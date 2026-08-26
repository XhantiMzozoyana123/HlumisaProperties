"use client";

import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";
import RequireZola from "@/components/RequireZola";
import { parseExcelFile } from "@/lib/excelParser";
import {
  fetchTransactionLedger,
  createTransactionLedgerEntry,
  updateTransactionLedgerEntry,
  deleteTransactionLedgerEntry,
  type TransactionLedger,
} from "@/lib/api";

type BookStatusColor = "white" | "red" | "green";

type BookEntry = {
  id: string;
  date: string;
  month: string;
  buyer: string;
  seller: string;
  originalAmount: number;
  amountPaid: number;       // label: "Due to Seller"
  deposit: number;
  lostDeed: number;
  commission: number;
  transferCosts: number;
  masterFees: number;
  balance: number;
  electricalCertificate: number;
  waterAccount: number;
  section118: number;
  erfNumber: string;
  area: string;
  outstandingBalance: number;
  statusColor: BookStatusColor;
  /** Database id (set once the entry has been persisted server-side). */
  backendId?: number;
};

/** Get today's date in South African timezone as YYYY-MM-DD */
function getTodaySA(): string {
  const now = new Date();
  const sa = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return sa.toISOString().split("T")[0];
}

/** Get the current month name in South African timezone */
function getCurrentMonthName(): string {
  const now = new Date();
  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
  ];
  const saMonthIndex = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    timeZone: "Africa/Johannesburg",
  }).format(now);
  return monthNames[parseInt(saMonthIndex, 10) - 1];
}

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

function monthNameToNumber(name: string): number {
  return MONTH_NAMES.indexOf(String(name || "").toUpperCase().trim());
}

/** Rank a month chronologically (JANUARY = 0 … DECEMBER = 11). Unknown months sort last. */
function monthRank(m: string): number {
  const i = monthNameToNumber(m);
  return i === -1 ? MONTH_NAMES.length : i;
}

/**
 * Returns a YYYY-MM-DD date for a row. If the row has an explicit date we keep it;
 * otherwise we derive a representative date from the Month so the backend's
 * auto-derived Month always matches the selected month (e.g. an empty date in month
 * MARCH becomes 2026-03-01 and never gets mislabelled as JANUARY by the server).
 */
function resolveDate(dateStr: string, month: string): string {
  if (dateStr && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr;
  const m = monthNameToNumber(month) + 1;
  const year = new Date().getFullYear();
  if (m < 1) return `${year}-01-01`;
  return `${year}-${String(m).padStart(2, "0")}-01`;
}

/** Map a database entry onto the UI BookEntry model (id is namespaced as db-<id>). */
function dbToEntry(r: TransactionLedger): BookEntry {
  const rawDate = String(r.date ?? "");
  return {
    id: `db-${r.id}`,
    backendId: r.id,
    date: rawDate.slice(0, 10),
    month: r.month || "",
    buyer: r.buyer || "",
    seller: r.seller || "",
    originalAmount: Number(r.originalAmount) || 0,
    amountPaid: Number(r.dueToSeller) || 0,
    deposit: Number(r.deposit) || 0,
    lostDeed: Number(r.lostDeed) || 0,
    commission: Number(r.commission) || 0,
    transferCosts: Number(r.transferCosts) || 0,
    masterFees: Number(r.masterFees) || 0,
    balance: 0,
    electricalCertificate: Number(r.elecCert) || 0,
    waterAccount: Number(r.waterAccount) || 0,
    section118: Number(r.section118) || 0,
    erfNumber: r.erfNumber || "",
    area: r.area || "",
    outstandingBalance: Number(r.balance) || 0,
    statusColor: (r.status as BookStatusColor) || "white",
  };
}

/** Build the API payload from a UI row, mapping UI column names onto DB columns. */
function toLedgerPayload(
  entry: BookEntry,
  colors: Record<string, BookStatusColor>
): Partial<TransactionLedger> {
  const rowColors: Record<string, BookStatusColor> = {};
  Object.entries(colors).forEach(([k, v]) => {
    if (k.startsWith(`${entry.id}_`)) rowColors[k.slice(entry.id.length + 1)] = v;
  });

  return {
    date: resolveDate(entry.date, entry.month),
    month: entry.month,
    buyer: entry.buyer,
    seller: entry.seller,
    originalAmount: entry.originalAmount,
    dueToSeller: entry.amountPaid,
    deposit: entry.deposit,
    lostDeed: entry.lostDeed,
    commission: entry.commission,
    transferCosts: entry.transferCosts,
    masterFees: entry.masterFees,
    elecCert: entry.electricalCertificate,
    waterAccount: entry.waterAccount,
    section118: entry.section118,
    balance: entry.outstandingBalance,
    erfNumber: entry.erfNumber,
    area: entry.area,
    status: entry.statusColor,
    cellColors: JSON.stringify(rowColors),
  };
}


type FieldType = "number" | "text" | "readonly";

const fieldConfig: Record<string, FieldType> = {
  date: "text",
  month: "readonly",
  buyer: "text",
  seller: "text",
  originalAmount: "number",
  amountPaid: "number",
  deposit: "number",
  lostDeed: "number",
  commission: "number",
  transferCosts: "number",
  masterFees: "number",
  balance: "number",
  electricalCertificate: "number",
  waterAccount: "number",
  section118: "number",
  erfNumber: "text",
  area: "text",
  outstandingBalance: "number",
};

/** Ordered keys for table columns Ã¢â‚¬â€ new layout as requested */
const columnOrder = [
  "date", "month", "buyer", "seller", "originalAmount", "amountPaid",
  "deposit", "lostDeed", "commission", "transferCosts", "masterFees",
  "electricalCertificate", "waterAccount", "section118",
  "outstandingBalance", "erfNumber", "area",
];

const fieldLabels: Record<string, string> = {
  date: "Date", month: "Month", buyer: "Buyer", seller: "Seller",
  originalAmount: "Original Amount", amountPaid: "Due to Seller",
  deposit: "Deposit", lostDeed: "Lost Deed", commission: "Commission",
  transferCosts: "Transfer Costs", masterFees: "Master Fees",
  electricalCertificate: "Elec Cert",
  waterAccount: "Water Account", section118: "Section 118",
  outstandingBalance: "Balance", erfNumber: "ERF", area: "Area",
};

/** Number columns that should be right-aligned */
const rightAlignedFields = new Set([
  "amountPaid", "deposit", "lostDeed", "commission", "transferCosts",
  "masterFees", "balance", "electricalCertificate", "waterAccount",
  "section118", "outstandingBalance", "originalAmount",
]);

function formatMoney(amount: number) {
  if (amount === 0) return "";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCellColorClass(color: BookStatusColor): string {
  switch (color) {
    case "red": return "text-rose-300";
    case "green": return "text-emerald-300";
    default: return "text-stone-200";
  }
}

function getCellBgClass(color: BookStatusColor): string {
  switch (color) {
    case "red": return "bg-rose-500/10";
    case "green": return "bg-emerald-500/10";
    default: return "";
  }
}

export default function BooksPage() {
  return (
    <RequireZola>
      <BooksContent />
    </RequireZola>
  );
}

function BooksContent() {
  const [data, setData] = useState<BookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [editCell, setEditCell] = useState<{ row: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [pendingFields, setPendingFields] = useState<Record<string, boolean>>({});

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cellColors, setCellColors] = useState<Record<string, BookStatusColor>>({});

  // Load the transaction ledger from the database on mount.
  const loadLedger = useCallback(async () => {
    try {
      setLoading(true);
      const rows = await fetchTransactionLedger();
      const mapped = rows.map(dbToEntry);
      const colors: Record<string, BookStatusColor> = {};
      rows.forEach((r) => {
        let stored: Record<string, string> = {};
        try {
          stored = JSON.parse(r.cellColors || "{}");
        } catch {
          stored = {};
        }
        Object.entries(stored).forEach(([f, c]) => {
          if (c === "red" || c === "green" || c === "white") colors[`db-${r.id}_${f}`] = c;
        });
      });
      // Derive the semantic highlight colours that used to be hardcoded.
      mapped.forEach((row) => {
        if (row.outstandingBalance > 0) colors[`${row.id}_outstandingBalance`] = colors[`${row.id}_outstandingBalance`] || "red";
        if (row.lostDeed === 7800) colors[`${row.id}_lostDeed`] = colors[`${row.id}_lostDeed`] || "red";
        if (row.lostDeed === 50000) colors[`${row.id}_lostDeed`] = colors[`${row.id}_lostDeed`] || "red";
        if (row.commission > 39000) colors[`${row.id}_commission`] = colors[`${row.id}_commission`] || "green";
      });
      setCellColors(colors);
      setData(mapped);
    } catch (err) {
      setUploadResult(`âŒ Failed to load ledger from database: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLedger();
  }, [loadLedger]);


  const [colorPickerCell, setColorPickerCell] = useState<{ row: string; field: string } | null>(null);
  const [colorPickerPos, setColorPickerPos] = useState<{ x: number; y: number } | null>(null);
  const [showAddColorPicker, setShowAddColorPicker] = useState(false);
  const [pendingNewEntry, setPendingNewEntry] = useState<BookEntry | null>(null);
  const [editSelectedColor, setEditSelectedColor] = useState<BookStatusColor>("white");

  function cycleBookStatusColor(rowId: string) {
    setData((prev) =>
      prev.map((d) => {
        if (d.id !== rowId) return d;
        const next: Record<BookStatusColor, BookStatusColor> = { white: "red", red: "green", green: "white" };
        return { ...d, statusColor: next[d.statusColor] };
      })
    );
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const addEntryRef = useRef<HTMLDivElement>(null);

  const months = ["ALL", "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST"];

  // Sort rows chronologically by month so JANUARY sits on top and AUGUST at the bottom.
  const filtered = (selectedMonth === "ALL" ? data : data.filter((d) => d.month === selectedMonth))
    .slice()
    .sort((a, b) => monthRank(a.month) - monthRank(b.month));

  const monthlyTotals: Record<string, { commission: number; transferCosts: number }> = {};
  data.forEach((d) => {
    if (!monthlyTotals[d.month]) monthlyTotals[d.month] = { commission: 0, transferCosts: 0 };
    monthlyTotals[d.month].commission += d.commission;
    monthlyTotals[d.month].transferCosts += d.transferCosts;
  });

  const handleCellClick = (row: BookEntry, field: string, e?: React.MouseEvent) => {
    const fType = fieldConfig[field] || "readonly";
    if (fType === "readonly") return;
    
    // When in "add entry" mode, apply the selected color directly and start editing
    if (showAddColorPicker) {
      const key = `${row.id}_${field}`;
      setCellColors((prev) => ({ ...prev, [key]: editSelectedColor }));
      const val = (row as any)[field];
      setEditCell({ row: row.id, field });
      setEditValue(val != null && val !== 0 ? String(val) : "");
      setTimeout(() => inputRef.current?.focus(), 10);
      return;
    }
    
    setColorPickerCell({ row: row.id, field });
    // Position the color picker right below the clicked cell
    if (e && e.currentTarget) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = Math.min(rect.left, window.innerWidth - 260);
      const y = Math.min(rect.bottom + 8, window.innerHeight - 200);
      setColorPickerPos({ x, y });
    } else {
      setColorPickerPos({ x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 80 });
    }
  };

  const handleColorSelected = (color: BookStatusColor) => {
    if (!colorPickerCell) return;
    const key = `${colorPickerCell.row}_${colorPickerCell.field}`;
    setCellColors((prev) => ({ ...prev, [key]: color }));
    const row = data.find((d) => d.id === colorPickerCell.row);
    if (row) {
      const val = (row as any)[colorPickerCell.field];
      setEditCell({ row: colorPickerCell.row, field: colorPickerCell.field });
      setEditValue(val != null && val !== 0 ? String(val) : "");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
    setColorPickerCell(null);
  };

  const handleCellSave = useCallback(() => {
    if (!editCell) return;
    setData((prev) =>
      prev.map((d) => {
        if (d.id !== editCell.row) return d;
        const fType = fieldConfig[editCell.field] || "text";
        const updated = { ...d };
        if (fType === "number") {
          (updated as any)[editCell.field] = parseFloat(editValue) || 0;
        } else {
          (updated as any)[editCell.field] = editValue;
        }
        return updated;
      })
    );
    setEditCell(null);
  }, [editCell, editValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCellSave();
    if (e.key === "Escape") {
      setEditCell(null);
      setColorPickerCell(null);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0) {
        setUploadResult("No valid rows found in the Excel file. Make sure the first row has headers like BUYER, SELLER, COMMISSION, etc.");
        return;
      }

      const monthMap: Record<string, string> = {
        "1": "JANUARY", "JAN": "JANUARY", "JANUARY": "JANUARY", "JAN.": "JANUARY",
        "2": "FEBRUARY", "FEB": "FEBRUARY", "FEBRUARY": "FEBRUARY", "FEB.": "FEBRUARY",
        "3": "MARCH", "MAR": "MARCH", "MARCH": "MARCH", "MAR.": "MARCH",
        "4": "APRIL", "APR": "APRIL", "APRIL": "APRIL", "APR.": "APRIL",
        "5": "MAY", "MAY": "MAY",
        "6": "JUNE", "JUN": "JUNE", "JUNE": "JUNE", "JUN.": "JUNE",
        "7": "JULY", "JUL": "JULY", "JULY": "JULY", "JUL.": "JULY",
        "8": "AUGUST", "AUG": "AUGUST", "AUGUST": "AUGUST", "AUG.": "AUGUST",
        "9": "SEPTEMBER", "SEP": "SEPTEMBER", "SEPTEMBER": "SEPTEMBER", "SEP.": "SEPTEMBER",
        "10": "OCTOBER", "OCT": "OCTOBER", "OCTOBER": "OCTOBER", "OCT.": "OCTOBER",
        "11": "NOVEMBER", "NOV": "NOVEMBER", "NOVEMBER": "NOVEMBER", "NOV.": "NOVEMBER",
        "12": "DECEMBER", "DEC": "DECEMBER", "DECEMBER": "DECEMBER", "DEC.": "DECEMBER",
      };

      const newEntries: BookEntry[] = parsed.map((row, idx) => {
        const rawMonth = (row.month || "").trim().toUpperCase();
        const normalizedMonth = monthMap[rawMonth] || monthMap[rawMonth.replace(/\.$/, "")] || rawMonth || (selectedMonth === "ALL" ? getCurrentMonthName() : selectedMonth);
        const id = `excel-${Date.now()}-${idx}`;
        return {
          id,
          date: row.date || getTodaySA(),
          month: normalizedMonth,
          buyer: row.buyer || "",
          seller: row.seller || "",
          originalAmount: row.originalAmount || 0,
          amountPaid: row.amountPaid || 0,
          deposit: row.deposit || 0,
          lostDeed: row.lostDeed || 0,
          commission: row.commission || 0,
          transferCosts: row.transferCosts || 0,
          masterFees: row.masterFees || 0,
          balance: row.balance || 0,
          electricalCertificate: row.electricalCertificate || 0,
          waterAccount: row.waterAccount || 0,
          section118: row.section118 || 0,
          erfNumber: row.erfNumber || "",
          area: row.area || "",
          outstandingBalance: row.outstandingBalance || row.balance || 0,
          statusColor: "white",
        };
      });

      setData((prev) => [...newEntries, ...prev]);
      setUploadResult(`Ã¢Å“â€¦ Successfully imported ${newEntries.length} row${newEntries.length !== 1 ? "s" : ""} from ${file.name}. The data has been auto-filled into the Books table.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadResult(`Ã¢ÂÅ’ Failed to parse Excel file: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAddRow = () => {
    const newId = `new-${Date.now()}`;
    const newEntry: BookEntry = {
      id: newId, date: getTodaySA(),
      month: selectedMonth === "ALL" ? getCurrentMonthName() : selectedMonth,
      buyer: "", seller: "", originalAmount: 0, amountPaid: 0,
      deposit: 0, lostDeed: 0, commission: 0, transferCosts: 0,
      masterFees: 0, balance: 0, electricalCertificate: 0,
      waterAccount: 0, section118: 0, erfNumber: "", area: "",
      outstandingBalance: 0, statusColor: "white",
    };
    // Add the new entry immediately AND show the 3 color options right next to the button
    setPendingNewEntry(newEntry);
    setData((prev) => [...prev, newEntry]);
    setShowAddColorPicker(true);
    setEditSelectedColor("white");
    setTimeout(() => {
      const el = document.getElementById(`book-row-${newId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedRow(newId);
        setTimeout(() => setHighlightedRow(null), 2500);
      }
    }, 100);
  };

  const handleAddColorSelected = (color: BookStatusColor) => {
    // Keep the picker open! Just update the selected color for the next cell click
    setEditSelectedColor(color);
    // If there's a pending new entry, update its status color
    if (pendingNewEntry) {
      setData((prev) =>
        prev.map((d) =>
          d.id === pendingNewEntry.id ? { ...d, statusColor: color } : d
        )
      );
    }
  };

  const handleFinishAddEntry = () => {
    setShowAddColorPicker(false);
    setPendingNewEntry(null);
    setEditCell(null);
  };

  const handleRemoveRow = async () => {
  if (!selectedRow) return;
  const target = data.find((d) => d.id === selectedRow);
  setData((prev) => prev.filter((d) => d.id !== selectedRow));
  setSelectedRow(null);
  if (target?.backendId != null) {
    try {
      await deleteTransactionLedgerEntry(target.backendId);
    } catch (err) {
      setUploadResult(`Failed to delete from database: ${err instanceof Error ? err.message : "Unknown error"}`);
      await loadLedger();
    }
  }
};

  const handleRowDoubleClick = (rowId: string) => {
    setSelectedRow((prev) => (prev === rowId ? null : rowId));
  };

  const handleSaveAll = async () => {
  if (!data.length) { setSaved(true); setTimeout(() => setSaved(false), 1500); return; }
  setSaving(true);
  try {
    for (const entry of data) {
      const payload = toLedgerPayload(entry, cellColors);
      if (entry.backendId != null) {
        await updateTransactionLedgerEntry(entry.backendId, payload);
      } else {
        await createTransactionLedgerEntry(payload);
      }
    }
    await loadLedger();
    setSaved(true);
    setUploadResult(`Saved ${data.length} entry${data.length === 1 ? "" : "ies"} to the database.`);
  } catch (err) {
    setUploadResult(`Failed to save to database: ${err instanceof Error ? err.message : "Unknown error"}`);
  } finally {
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }
};

  const totalCommission = filtered.reduce((s, d) => s + d.commission, 0);
  const totalTransfer = filtered.reduce((s, d) => s + d.transferCosts, 0);
  const totalMasterFees = filtered.reduce((s, d) => s + d.masterFees, 0);
  const totalOutstanding = filtered.reduce((s, d) => s + d.outstandingBalance, 0);
  const totalOutstandingUnfiltered = data.reduce((s, d) => s + d.outstandingBalance, 0);
  const flippedCount = filtered.filter((d) => d.commission > 39000).length;

  const scrollToBookRow = (rowId: string) => {
    setSelectedMonth("ALL");
    setTimeout(() => {
      const el = document.getElementById(`book-row-${rowId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedRow(rowId);
        setTimeout(() => setHighlightedRow(null), 3000);
      }
    }, 150);
  };

  function renderCell(row: BookEntry, field: string) {
    const isEditing = editCell?.row === row.id && editCell?.field === field;
    const fType = fieldConfig[field] || "readonly";
    if (fType === "readonly") {
      const val = (row as any)[field];
      return <span className="text-stone-500">{(val as string) || "-"}</span>;
    }
    const val = (row as any)[field];
    const display = fType === "number" ? formatMoney(val as number) || "-" : (val as string) || "-";
    const isOutstanding = field === "outstandingBalance" && (val as number) > 0;
    const isCommissionHighlight = field === "commission" && (val as number) > 39000;
    const isLostDeedRed = field === "lostDeed" && (val as number) === 7800;
    const cellKey = `${row.id}_${field}`;
    const cellColor = cellColors[cellKey] || "white";
    const colorClass = getCellColorClass(cellColor);
    const bgClass = getCellBgClass(cellColor);

    if (isEditing) {
      return (
        <input ref={inputRef} type={fType === "number" ? "number" : "text"}
          value={editValue} onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellSave} onKeyDown={handleKeyDown}
          className="w-full min-w-[80px] rounded-lg border border-amber-200/40 bg-black/60 px-2 py-1 text-sm text-white outline-none" autoFocus />
      );
    }

    return (
      <span onClick={(e) => handleCellClick(row, field, e)}
        className={`cursor-pointer rounded px-1 py-0.5 transition hover:bg-amber-200/15 ${colorClass} ${bgClass} ${isOutstanding || isLostDeedRed ? "font-semibold" : ""} ${isCommissionHighlight ? "font-semibold" : ""}`}>
        {display}
        <span className="ml-1 opacity-0 group-hover:opacity-100 text-stone-500 text-xs">Ã¢Å“Å½</span>
      </span>
    );
  }

  return (
    <div className="space-y-6" onDoubleClick={() => { if (selectedRow) setSelectedRow(null); }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Books</h1>
          <p className="mt-1 text-sm text-stone-400">Transaction ledger Ã¢â‚¬â€ all deals, commissions & balances.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none">
            {months.map((m) => (<option key={m} value={m}>{m === "ALL" ? "All Months" : m}</option>))}
          </select>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20">
            {uploading ? "Ã¢ÂÂ³ Importing..." : "Ã°Å¸â€œÅ  Upload Excel"}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="hidden"
              onChange={handleExcelUpload}
            />
          </label>
          <button onClick={handleSaveAll}
            className="rounded-full bg-amber-200 px-6 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-100">
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Total Commission</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(totalCommission) || "R0"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Transfer Costs</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(totalTransfer) || "R0"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Ã°Å¸ÂÂ  Flipped Houses</p>
          <p className="mt-2 text-2xl font-semibold text-purple-200">{flippedCount}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Master Fees</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(totalMasterFees) || "R0"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-rose-300/20 bg-rose-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-300">Ã°Å¸â€™Â³ Pending Payments</p>
          <p className="mt-2 text-2xl font-semibold text-rose-200">{formatMoney(totalOutstanding) || "R0"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Ã°Å¸â€œÅ  Outstanding Total</p>
          <p className="mt-2 text-2xl font-semibold text-amber-200">{formatMoney(totalOutstandingUnfiltered) || "R0"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(monthlyTotals).map(([month, t]) => (
          <div key={month} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xs">
            <span className="text-stone-400">{month}</span>
            <span className="ml-2 text-amber-200">C: {formatMoney(t.commission)}</span>
            <span className="ml-2 text-stone-400">T: {formatMoney(t.transferCosts)}</span>
          </div>
        ))}
      </div>

      {uploadResult && (
        <div className={`rounded-[1.5rem] border px-6 py-4 text-sm ${
          uploadResult.startsWith("Saved")
            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
            : "border-rose-400/20 bg-rose-500/10 text-rose-200"
        }`}>
          {uploadResult}
        </div>
      )}

      {!uploadResult && (
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-6 py-4 text-xs leading-relaxed text-stone-500">
          <strong className="text-emerald-300">Excel Upload:</strong> Upload an <strong>.xlsx</strong>, <strong>.xls</strong>, or <strong>.csv</strong> file and the data will <strong className="text-amber-200">auto-fill into the Books table</strong>. The first row must contain column headers such as <em>Buyer, Seller, Commission, Transfer Costs, Due to Seller, Balance, ERF, Area</em>, etc. Supported columns: Date, Month, Buyer, Seller, Original Amount, Due to Seller/Amount Paid, Deposit, Lost Deed, Commission, Transfer Costs, Master Fees, Elec Cert, Water Account, Section 118, Balance/Outstanding Balance, ERF, Area.
        </div>
      )}

      <div ref={tableRef} className="backdrop-card overflow-x-auto overflow-y-auto rounded-[2rem] max-h-[70vh]">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-stone-400 bg-[#0d1520]">
              {columnOrder.map((key) => (
                <th key={key} className={`px-4 py-4 ${key === "outstandingBalance" ? "text-rose-300" : ""} ${rightAlignedFields.has(key) ? "text-right" : ""}`}>
                  {fieldLabels[key]}
                </th>
              ))}
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => {
              const isFlipped = row.commission > 39000;
              const isHighlighted = highlightedRow === row.id;
              const isSelected = selectedRow === row.id;
              return (
                <tr key={row.id} id={`book-row-${row.id}`}
                  onDoubleClick={() => handleRowDoubleClick(row.id)}
                  className={`border-b border-white/5 transition cursor-pointer ${isSelected ? "bg-amber-400/20 ring-2 ring-amber-400/50" : isHighlighted ? "bg-amber-200/20 ring-2 ring-amber-300/40" : idx % 2 === 0 ? "bg-black/10 hover:bg-white/5" : "hover:bg-white/5"}`}>
                  {columnOrder.map((field) => (
                    <td key={field} className={`px-4 py-3 ${rightAlignedFields.has(field) ? "text-right" : ""}`}>
                      <span className="group">{renderCell(row, field)}</span>
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => cycleBookStatusColor(row.id)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition cursor-pointer hover:ring-2 hover:ring-white/20 ${row.statusColor === "green" ? "bg-emerald-500/20 text-emerald-200" : row.statusColor === "red" ? "bg-rose-500/20 text-rose-200" : "bg-white/5 text-stone-300"}`}>
                        {row.statusColor === "green" ? "Ã¢Å“â€œ Done" : row.statusColor === "red" ? "Ã¢Å“â€¢ Declined" : "Ã¢â€”â€¹ Pending"}
                      </button>
                      {isFlipped && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-200">Ã°Å¸ÂÂ  Flipped</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {loading && (
              <tr><td colSpan={columnOrder.length + 1} className="px-4 py-8 text-center text-sm text-stone-500">Loading ledger from the database…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={columnOrder.length + 1} className="px-4 py-8 text-center text-sm text-stone-500">No entries for this month.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Color picker popover Ã¢â‚¬â€ anchored right below the clicked cell */}
      {colorPickerCell && colorPickerPos && (
        <div
          className="fixed z-50 rounded-[2rem] border border-amber-200/30 bg-[#1d2736] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
          style={{ left: colorPickerPos.x, top: colorPickerPos.y }}
        >
          <div className="text-center">
            <p className="mb-3 text-sm text-stone-400">Color for <span className="font-medium text-amber-200">{fieldLabels[colorPickerCell.field]}</span>:</p>
            <div className="flex justify-center items-center gap-3">
              <button onClick={() => handleColorSelected("white")}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/60 bg-white text-xs font-bold uppercase tracking-wider text-stone-800 transition hover:scale-110 hover:border-white hover:bg-stone-100">W</button>
              <button onClick={() => handleColorSelected("red")}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-rose-400/70 bg-rose-600 text-xs font-bold uppercase tracking-wider text-white transition hover:scale-110 hover:border-rose-300 hover:bg-rose-500">R</button>
              <button onClick={() => handleColorSelected("green")}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-400/70 bg-emerald-600 text-xs font-bold uppercase tracking-wider text-white transition hover:scale-110 hover:border-emerald-300 hover:bg-emerald-500">G</button>
            </div>
            <button onClick={() => { setColorPickerCell(null); setColorPickerPos(null); }}
              className="mt-3 rounded-full border border-white/10 px-4 py-1.5 text-xs text-stone-400 transition hover:text-white hover:bg-white/5">Cancel</button>
          </div>
        </div>
      )}

      <div ref={addEntryRef} className="flex flex-wrap items-center justify-center gap-4">
        <div className="relative flex items-center gap-3">
          <button onClick={handleAddRow}
            className="flex items-center gap-2 rounded-full border-2 border-dashed border-white/20 px-8 py-4 text-base text-stone-400 transition hover:border-amber-200/40 hover:text-amber-200 hover:bg-amber-200/5">
            <span className="text-2xl font-light">+</span><span>Add new entry</span>
          </button>
          {showAddColorPicker && (
            <div className="flex items-center gap-2 rounded-full border border-amber-200/30 bg-[#1d2736] px-4 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <span className="text-xs text-stone-400 mr-1">Color:</span>
              <button onClick={() => handleAddColorSelected("white")}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold uppercase tracking-wider transition hover:scale-110 ${editSelectedColor === "white" ? "ring-2 ring-amber-300" : ""} border-white/60 bg-white text-stone-800 hover:border-white hover:bg-stone-100`}>W</button>
              <button onClick={() => handleAddColorSelected("red")}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold uppercase tracking-wider transition hover:scale-110 ${editSelectedColor === "red" ? "ring-2 ring-amber-300" : ""} border-rose-400/70 bg-rose-600 text-white hover:border-rose-300 hover:bg-rose-500`}>R</button>
              <button onClick={() => handleAddColorSelected("green")}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold uppercase tracking-wider transition hover:scale-110 ${editSelectedColor === "green" ? "ring-2 ring-amber-300" : ""} border-emerald-400/70 bg-emerald-600 text-white hover:border-emerald-300 hover:bg-emerald-500`}>G</button>
              <button onClick={handleFinishAddEntry}
                className="ml-1 rounded-full bg-amber-200 px-3 py-1.5 text-xs font-semibold text-stone-950 transition hover:bg-amber-100">Ã¢Å“â€œ Done</button>
            </div>
          )}
        </div>
        <button onClick={handleRemoveRow} disabled={!selectedRow}
          className={`flex items-center gap-2 rounded-full border-2 px-8 py-4 text-base transition ${selectedRow ? "border-rose-400/40 text-rose-300 hover:border-rose-300/60 hover:bg-rose-500/10 hover:text-rose-200" : "border-white/10 text-stone-600 cursor-not-allowed"}`}>
          <span className="text-2xl font-light">Ã¢Å“â€¢</span><span>Remove selected row</span>
        </button>
      </div>

      {flippedCount > 0 && (
        <div className="rounded-[2rem] border border-purple-300/20 bg-purple-500/5 p-6">
          <h2 className="text-lg font-semibold text-white">Ã°Å¸ÂÂ  Flipped Houses (Commission {">"} R39,000)</h2>
          <p className="text-sm text-stone-400">These deals have commission amounts exceeding R39,000. Click a row to jump to it in the table above.</p>
          <div className="mt-4 space-y-2">
            {data.filter((d) => d.commission > 39000).map((d) => (
              <div key={d.id} onClick={() => scrollToBookRow(d.id)}
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-purple-300/10 bg-black/20 px-5 py-3 transition hover:border-amber-300/30 hover:bg-amber-200/10 hover:scale-[1.01]">
                <div><p className="text-sm font-medium text-white">{d.buyer} Ã¢â€ â€™ {d.seller}</p><p className="text-xs text-stone-400">{d.month} Ã‚Â· {d.area}</p></div>
                <span className="text-sm font-semibold text-purple-200">{formatMoney(d.commission)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Link href="/admin/books/understanding"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm text-stone-400 transition hover:border-amber-200/40 hover:text-amber-200">
          <span>Ã°Å¸â€œâ€“</span><span>Books Understanding Ã¢â‚¬â€ learn how this page works</span>
        </Link>
      </div>

      <p className="text-center text-xs text-stone-600">
        Click "Add new entry" then pick a color (white/red/green) and click any cell to fill it in. The color picker stays until you click "Ã¢Å“â€œ Done". Click any existing cell to edit with its own color picker. Press Enter to save, Escape to cancel. Double-click a row to select it, then click "Remove selected row" to delete it. Hit "Save Changes" to persist to the database.
      </p>
    </div>
  );
}
