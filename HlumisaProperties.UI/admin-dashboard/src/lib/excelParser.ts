// Excel parsing helpers for the Books section
// Parses .xlsx / .xls / .csv files and maps columns to BookEntry fields

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

/**
 * Parse an Excel/CSV file (ArrayBuffer) and return BookEntry-compatible rows.
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

      if (["date", "month", "buyer", "seller", "erfNumber", "area"].includes(field)) {
        (bookRow as any)[field] = toText(value);
      } else {
        (bookRow as any)[field] = toNumber(value);
      }
    }

    // Copy balance to outstandingBalance if both present
    if (bookRow.balance && !bookRow.outstandingBalance) {
      bookRow.outstandingBalance = bookRow.balance;
    }

    results.push(bookRow);
  }

  return results;
}