// Excel/CSV parsing + serializing helpers for the Books section
// Parses .xlsx / .xls / .csv files and maps columns to BookEntry fields.
// Also round-trips rows back to CSV (including status + cell colours) so the
// Books table can live entirely off a client-side books.csv file.

import * as XLSX from "xlsx";

export type ParsedBookRow = {
  date?: string;
  month?: string;
  buyer?: string;
  seller?: string;
  originalAmount?: number;
  amountPaid?: number;
  deposit?: number;
  lostDeed?: number;
  commission?: number;
  transferCosts?: number;
  masterFees?: number;
  electricalCertificate?: number;
  waterAccount?: number;
  section118?: number;
  balance?: number;
  outstandingBalance?: number;
  erfNumber?: string;
  area?: string;
  status?: string;
  cellColors?: string;
};

/**
 * Normalize a header string: uppercase, trim, remove extra spaces,
 * and map common variations to a canonical key.
 */
function normalizeHeader(header: string): string | null {
  const h = header.replace(/\s+/g, " ").trim().toUpperCase();

  const map: Record<string, string> = {
    "DATE": "date",
    "MONTH": "month",
    "BUYER": "buyer",
    "BUYERS": "buyer",
    "PURCHASER": "buyer",
    "SELLER": "seller",
    "SELLERS": "seller",
    "ORIGINAL AMOUNT": "originalAmount",
    "PURCHASE PRICE": "originalAmount",
    "PRICE": "originalAmount",
    "AMOUNT": "amountPaid",
    "DUE TO SELLER": "amountPaid",
    "AMOUNT PAID": "amountPaid",
    "PAID": "amountPaid",
    "DEPOSIT": "deposit",
    "LOST DEED": "lostDeed",
    "DEED": "lostDeed",
    "COMMISSION": "commission",
    "TRANSFER COSTS": "transferCosts",
    "TRANSFER COST": "transferCosts",
    "MASTER FEES": "masterFees",
    "MASTER FEE": "masterFees",
    "ELEC CERT": "electricalCertificate",
    "ELECTRICAL CERT": "electricalCertificate",
    "ELECTRICAL CERTIFICATE": "electricalCertificate",
    "WATER ACCOUNT": "waterAccount",
    "WATER": "waterAccount",
    "SECTION 118": "section118",
    "SECTION118": "section118",
    "BALANCE": "balance",
    "OUTSTANDING": "outstandingBalance",
    "OUTSTANDING BALANCE": "outstandingBalance",
    "PENDING": "outstandingBalance",
    "ERF": "erfNumber",
    "ERF NUMBER": "erfNumber",
    "ERF NO": "erfNumber",
    "STAND NUMBER": "erfNumber",
    "AREA": "area",
    "SUBURB": "area",
    "LOCATION": "area",
    "STATUS": "status",
    "STATUS COLOR": "status",
    "ROW STATUS": "status",
    "CELL COLORS": "cellColors",
    "CELL COLOR": "cellColors",
    "COLORS": "cellColors",
  };

  // Also try matching with common separators removed
  const compact = h.replace(/[-_/]/g, " ");
  if (map[compact]) return map[compact];
  return map[h] ?? null;
}

/** Convert an Excel cell value to a number (handles strings with "R", commas, spaces). */
function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  const str = String(value).trim();
  if (!str) return 0;
  // Remove "R", spaces, and commas -> parse float
  const cleaned = str.replace(/[Rr]/g, "").replace(/\s/g, "").replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/** Convert a value to a string */
function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

/** Convert an Excel serial date (days since 1899-12-30, as produced by SheetJS for date cells) to YYYY-MM-DD. */
function serialToIso(serial: number): string {
  const ms = Math.round((serial - 25569) * 86400 * 1000);
  const date = new Date(ms);
  if (isNaN(date.getTime())) return `${new Date().getFullYear()}-01-01`;
  return date.toISOString().split("T")[0];
}

/** Text-ish fields that should stay strings when parsed from a spreadsheet/CSV. */
const TEXT_FIELDS = ["date", "month", "buyer", "seller", "erfNumber", "area", "status", "cellColors"];

/** Convert raw header/row arrays into ParsedBookRow objects. */
function rowsToBookRows(rows: unknown[][]): ParsedBookRow[] {
  if (rows.length < 2) return [];

  // First row = headers
  const headers = rows[0] as unknown[];
  const colMap: Array<{ col: number; field: string | null }> = headers.map((h, idx) => ({
    col: idx,
    field: normalizeHeader(String(h)),
  }));

  const results: ParsedBookRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || row.every((cell) => cell === "" || cell === null || cell === undefined)) {
      continue; // skip empty rows
    }

    const bookRow: ParsedBookRow = {};
    for (const { col, field } of colMap) {
      if (!field) continue;
      const value = row[col];

      if (field === "date" && typeof value === "number" && value > 0) {
        // SheetJS converts date-like cells (CSV or Excel) into Excel serial numbers;
        // turn them back into a YYYY-MM-DD string so the date column round-trips.
        bookRow.date = serialToIso(value);
        continue;
      }

      if (TEXT_FIELDS.includes(field)) {
        (bookRow as any)[field] = toText(value);
      } else {
        (bookRow as any)[field] = toNumber(value);
      }
    }

    // Copy balance to outstandingBalance if only balance is present
    if (bookRow.balance && !bookRow.outstandingBalance) {
      bookRow.outstandingBalance = bookRow.balance;
    }

    results.push(bookRow);
  }

  return results;
}

/**
 * Parse an Excel/CSV file picked by the user and return BookEntry-compatible rows.
 * The first row is treated as headers. Column names are matched flexibly.
 */
export async function parseExcelFile(file: File): Promise<ParsedBookRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  // Convert sheet to array-of-arrays (raw values preserved as much as possible)
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });
  return rowsToBookRows(rows);
}

/**
 * Parse a plain CSV string (e.g. the bundled books.csv fetched by the UI)
 * and return BookEntry-compatible rows. Reuses the same parsing pipeline as
 * parseExcelFile, so the bundled file behaves exactly like an uploaded one.
 */
export async function parseCsvText(text: string): Promise<ParsedBookRow[]> {
  return parseExcelFile(new File([text], "books.csv", { type: "text/csv" }));
}

/** Column headers written to the books.csv file (names the parser understands). */
export const CSV_HEADERS = [
  "Date", "Month", "Buyer", "Seller", "Original Amount", "Due to Seller",
  "Deposit", "Lost Deed", "Commission", "Transfer Costs", "Master Fees",
  "Elec Cert", "Water Account", "Section 118", "Outstanding Balance",
  "ERF", "Area", "Status", "Cell Colors",
];

/** Quote a CSV field when it contains a comma, quote, or newline. */
function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, "\"\"")}"`;
  return s;
}

/**
 * Serialize UI book rows (plus their per-cell colors) back into a CSV string.
 * The Status + Cell Colors columns let a saved file round-trip all the way back
 * into the table (row status + cell highlight colours included).
 */
export function entriesToCsv(
  entries: Array<{
    id: string;
    date?: string;
    month?: string;
    buyer?: string;
    seller?: string;
    originalAmount?: number;
    amountPaid?: number;
    deposit?: number;
    lostDeed?: number;
    commission?: number;
    transferCosts?: number;
    masterFees?: number;
    electricalCertificate?: number;
    waterAccount?: number;
    section118?: number;
    outstandingBalance?: number;
    erfNumber?: string;
    area?: string;
    statusColor?: string;
  }>,
  colors?: Record<string, string>
): string {
  const lines = [CSV_HEADERS.join(",")];

  for (const entry of entries) {
    // Collect only the colors belonging to this row (keys are "<rowId>_<field>").
    const rowColors: Record<string, string> = {};
    if (colors) {
      Object.entries(colors).forEach(([key, value]) => {
        const prefix = `${entry.id}_`;
        if (key.startsWith(prefix)) rowColors[key.slice(prefix.length)] = value;
      });
    }

    const values: Array<string | number> = [
      entry.date ?? "",
      entry.month ?? "",
      entry.buyer ?? "",
      entry.seller ?? "",
      entry.originalAmount ?? 0,
      entry.amountPaid ?? 0,
      entry.deposit ?? 0,
      entry.lostDeed ?? 0,
      entry.commission ?? 0,
      entry.transferCosts ?? 0,
      entry.masterFees ?? 0,
      entry.electricalCertificate ?? 0,
      entry.waterAccount ?? 0,
      entry.section118 ?? 0,
      entry.outstandingBalance ?? 0,
      entry.erfNumber ?? "",
      entry.area ?? "",
      entry.statusColor ?? "white",
      Object.keys(rowColors).length > 0 ? JSON.stringify(rowColors) : "",
    ];

    lines.push(values.map(csvEscape).join(","));
  }

  return lines.join("\r\n") + "\r\n";
}