"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  fetchTransactionLedger,
  createTransactionLedgerEntry,
  updateTransactionLedgerEntry,
  deleteTransactionLedgerEntry,
  type TransactionLedger as ApiTransactionLedger,
} from "@/lib/api";

type BookStatusColor = "white" | "red" | "green";

type BookEntry = {
  id: string;
  date: string;
  month: string;
  buyer: string;
  seller: string;
  originalAmount: number;
  amountPaid: number;
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
};

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

const rightAlignedFields = new Set([
  "amountPaid", "deposit", "lostDeed", "commission", "transferCosts",
  "masterFees", "balance", "electricalCertificate", "waterAccount",
  "section118", "outstandingBalance", "originalAmount",
]);

function formatMoney(amount: number) {
  if (amount === 0) return "";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency", currency: "ZAR", maximumFractionDigits: 0,
  }).format(amount);
}

function getCellColorClass(color: BookStatusColor): string {
  switch (color) {
    case "red": return "text-rose-300";
    case "green": return "text-emerald-300";
    default: return "text-stone-200";
  }
}

function apiToBookEntry(entry: ApiTransactionLedger): BookEntry {
  const statusMap: Record<string, BookStatusColor> = {
    "Pending": "white", "Declined": "red", "Done": "green",
  };
  return {
    id: String(entry.id),
    date: new Date(entry.date).toISOString().split("T")[0],
    month: entry.month.toUpperCase(),
    buyer: entry.buyer,
    seller: entry.seller,
    originalAmount: Number(entry.originalAmount),
    amountPaid: Number(entry.dueToSeller),
    deposit: Number(entry.deposit),
    lostDeed: Number(entry.lostDeed),
    commission: Number(entry.commission),
    transferCosts: Number(entry.transferCosts),
    masterFees: Number(entry.masterFees),
    balance: Number(entry.balance),
    electricalCertificate: Number(entry.elecCert),
    waterAccount: Number(entry.waterAccount),
    section118: Number(entry.section118),
    erfNumber: entry.erfNumber,
    area: entry.area,
    outstandingBalance: Number(entry.balance),
    statusColor: statusMap[entry.status] || "white",
  };
}

function bookEntryToApi(entry: BookEntry): Partial<ApiTransactionLedger> {
  return {
    date: new Date(entry.date + "T00:00:00").toISOString(),
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
    status: entry.statusColor === "green" ? "Done" : entry.statusColor === "red" ? "Declined" : "Pending",
  };
}

export default function BooksPage() {
  const [data, setData] = useState<BookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [editCell, setEditCell] = useState<{ row: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [colorPickerCell, setColorPickerCell] = useState<{ row: string; field: string } | null>(null);

  const months = ["ALL", "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE"];

  const filtered = selectedMonth === "ALL" ? data : data.filter((d) => d.month === selectedMonth);

  const monthlyTotals: Record<string, { commission: number; transferCosts: number }> = {};
  data.forEach((d) => {
    if (!monthlyTotals[d.month]) monthlyTotals[d.month] = { commission: 0, transferCosts: 0 };
    monthlyTotals[d.month].commission += d.commission;
    monthlyTotals[d.month].transferCosts += d.transferCosts;
  });

  // Load data from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const entries = await fetchTransactionLedger();
        const mapped = entries.map(apiToBookEntry);
        setData(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to load transaction ledger.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCellClick = (row: BookEntry, field: string) => {
    const fType = fieldConfig[field] || "readonly";
    if (fType === "readonly") return;
    setColorPickerCell({ row: row.id, field });
  };

  const handleColorSelected = (color: BookStatusColor) => {
    if (!colorPickerCell) return;
    const row = data.find((d) => d.id === colorPickerCell.row);
    if (row) {
      const val = (row as any)[colorPickerCell.field];
      setEditCell({ row: colorPickerCell.row, field: colorPickerCell.field });
      setEditValue(val != null && val !== 0 ? String(val) : "");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
    setColorPickerCell(null);
  };

  const handleCellSave = useCallback(async () => {
    if (!editCell) return;
    const rowId = editCell.row;
    const field = editCell.field;

    setData((prev) =>
      prev.map((d) => {
        if (d.id !== rowId) return d;
        const fType = fieldConfig[field] || "text";
        const updated = { ...d };
        if (fType === "number") {
          (updated as any)[field] = parseFloat(editValue) || 0;
        } else {
          (updated as any)[field] = editValue;
        }
        return updated;
      })
    );
    setEditCell(null);

    // Persist to API
    try {
      const row = data.find((d) => d.id === rowId);
      if (row) {
        const apiPayload = bookEntryToApi({ ...row, [field]: field === "number" ? parseFloat(editValue) || 0 : editValue });
        await updateTransactionLedgerEntry(Number(row.id), apiPayload);
      }
    } catch (err: any) {
      console.error("Failed to save cell:", err);
    }
  }, [editCell, editValue, data]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCellSave();
    if (e.key === "Escape") {
      setEditCell(null);
      setColorPickerCell(null);
    }
  };

  const handleAddRow = async () => {
    const newId = `new-${Date.now()}`;
    const newEntry: BookEntry = {
      id: newId, date: new Date().toISOString().split("T")[0],
      month: "JULY", buyer: "", seller: "", originalAmount: 0, amountPaid: 0,
      deposit: 0, lostDeed: 0, commission: 0, transferCosts: 0,
      masterFees: 0, balance: 0, electricalCertificate: 0,
      waterAccount: 0, section118: 0, erfNumber: "", area: "",
      outstandingBalance: 0, statusColor: "white",
    };
    setData((prev) => [...prev, newEntry]);

    // Create in API
    try {
      const apiPayload = bookEntryToApi(newEntry);
      const created = await createTransactionLedgerEntry(apiPayload);
      setData((prev) => prev.map((d) => d.id === newId ? apiToBookEntry(created) : d));
    } catch (err: any) {
      console.error("Failed to create row:", err);
    }
  };

  const handleRemoveRow = async () => {
    if (!selectedRow) return;
    try {
      await deleteTransactionLedgerEntry(Number(selectedRow));
      setData((prev) => prev.filter((d) => d.id !== selectedRow));
      setSelectedRow(null);
    } catch (err: any) {
      console.error("Failed to delete row:", err);
    }
  };

  const handleRowDoubleClick = (rowId: string) => {
    setSelectedRow((prev) => (prev === rowId ? null : rowId));
  };

  const handleSaveAll = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Reading file...");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const csvText = evt.target?.result as string;
        const entries = parseCSV(csvText);
        setUploadStatus(`Uploading ${entries.length} entries...`);

        for (const entry of entries) {
          const apiPayload = bookEntryToApi(entry);
          await createTransactionLedgerEntry(apiPayload);
        }

        const refreshed = await fetchTransactionLedger();
        setData(refreshed.map(apiToBookEntry));
        setUploadStatus(`Uploaded ${entries.length} entries from CSV.`);
        setTimeout(() => setUploadStatus(null), 4000);
      } catch (err: any) {
        setUploadStatus(`Error: ${err.message}`);
        setTimeout(() => setUploadStatus(null), 6000);
      }
    };
    reader.onerror = () => {
      setUploadStatus("Failed to read file.");
      setTimeout(() => setUploadStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  function parseCSV(csvText: string): BookEntry[] {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const columnMap: Record<string, string> = {
      date: "date", month: "month", buyer: "buyer", seller: "seller",
      "original amount": "originalAmount", originalamount: "originalAmount",
      "due to seller": "amountPaid", "amount paid": "amountPaid", amountpaid: "amountPaid",
      deposit: "deposit", "lost deed": "lostDeed", lostdeed: "lostDeed",
      commission: "commission", "transfer costs": "transferCosts", transfercosts: "transferCosts",
      "master fees": "masterFees", masterfees: "masterFees",
      "elec cert": "electricalCertificate", "electrical certificate": "electricalCertificate", electricalcertificate: "electricalCertificate",
      "water account": "waterAccount", wateraccount: "waterAccount",
      "section 118": "section118", section118: "section118",
      balance: "outstandingBalance", "outstanding balance": "outstandingBalance", outstandingbalance: "outstandingBalance",
      erf: "erfNumber", "erf number": "erfNumber", erfnumber: "erfNumber", area: "area",
    };

    const fieldToHeader: Record<string, number> = {};
    headers.forEach((h, i) => {
      const mapped = columnMap[h];
      if (mapped) fieldToHeader[mapped] = i;
    });

    const entries: BookEntry[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = parseCSVLine(line);
      if (values.length < 2) continue;

      const getStr = (field: string): string => {
        const idx = fieldToHeader[field];
        return idx !== undefined ? values[idx]?.trim() ?? "" : "";
      };
      const getNum = (field: string): number => {
        const raw = getStr(field).replace(/[Rr\s,]/g, "");
        return parseFloat(raw) || 0;
      };

      const entry: BookEntry = {
        id: `csv-${i}-${Date.now()}`, date: getStr("date"),
        month: getStr("month").toUpperCase(), buyer: getStr("buyer"), seller: getStr("seller"),
        originalAmount: getNum("originalAmount"), amountPaid: getNum("amountPaid"),
        deposit: getNum("deposit"), lostDeed: getNum("lostDeed"), commission: getNum("commission"),
        transferCosts: getNum("transferCosts"), masterFees: getNum("masterFees"),
        balance: 0, electricalCertificate: getNum("electricalCertificate"),
        waterAccount: getNum("waterAccount"), section118: getNum("section118"),
        erfNumber: getStr("erfNumber"), area: getStr("area"),
        outstandingBalance: getNum("outstandingBalance"), statusColor: "white",
      };
      entries.push(entry);
    }

    if (entries.length === 0) throw new Error("No valid data rows found in CSV.");
    return entries;
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === "," && !inQuotes) { result.push(current); current = ""; }
      else current += ch;
    }
    result.push(current);
    return result;
  }

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

    if (isEditing) {
      return (
        <input ref={inputRef} type={fType === "number" ? "number" : "text"}
          value={editValue} onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellSave} onKeyDown={handleKeyDown}
          className="w-full min-w-[80px] rounded-lg border border-amber-200/40 bg-black/60 px-2 py-1 text-sm text-white outline-none" autoFocus />
      );
    }

    return (
      <span onClick={() => handleCellClick(row, field)}
        className={`cursor-pointer rounded px-1 py-0.5 transition hover:bg-amber-200/15 ${getCellColorClass(row.statusColor)} ${isOutstanding || isLostDeedRed ? "font-semibold" : ""} ${isCommissionHighlight ? "font-semibold" : ""}`}>
        {display}
        <span className="ml-1 opacity-0 group-hover:opacity-100 text-stone-500 text-xs">edit</span>
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#12100e]">
        <p className="text-stone-400 text-sm">Loading transaction ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#12100e]">
        <p className="text-rose-300 text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Books</h1>
          <p className="mt-1 text-sm text-stone-400">Transaction ledger — all deals, commissions and balances.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white outline-none">
            {months.map((m) => (<option key={m} value={m}>{m === "ALL" ? "All Months" : m}</option>))}
          </select>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="rounded-full border border-white/20 px-6 py-2 text-sm text-stone-300 transition hover:border-amber-200/40 hover:text-amber-200">
            Upload CSV
          </button>
          <button onClick={handleSaveAll}
            className="rounded-full bg-amber-200 px-6 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-100">
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-stone-300">
          {uploadStatus}
        </div>
      )}

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
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Flipped Houses</p>
          <p className="mt-2 text-2xl font-semibold text-purple-200">{flippedCount}</p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Master Fees</p>
          <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(totalMasterFees) || "R0"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-rose-300/20 bg-rose-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-300">Pending Payments</p>
          <p className="mt-2 text-2xl font-semibold text-rose-200">{formatMoney(totalOutstanding) || "R0"}</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Outstanding Total</p>
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

      <div ref={tableRef} className="backdrop-card overflow-x-auto rounded-[2rem]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-stone-400">
              {columnOrder.map((key) => (
                <th key={key} className={`px-4 py-4 ${key === "outstandingBalance" ? "text-rose-300" : ""} ${rightAlignedFields.has(key) ? "text-right" : ""}`}>
                  {fieldLabels[key]}
                </th>
              ))}
              <th className="px-4 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columnOrder.length + 1} className="px-4 py-8 text-center text-sm text-stone-500">
                  No entries for this month.
                </td>
              </tr>
            )}
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
                      <button onClick={() => {
                        const next: Record<BookStatusColor, BookStatusColor> = { white: "red", red: "green", green: "white" };
                        const newStatus = next[row.statusColor];
                        setData((prev) => prev.map((d) => d.id === row.id ? { ...d, statusColor: newStatus } : d));
                        updateTransactionLedgerEntry(Number(row.id), { status: newStatus === "green" ? "Done" : newStatus === "red" ? "Declined" : "Pending" }).catch(console.error);
                      }}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition cursor-pointer hover:ring-2 hover:ring-white/20 ${row.statusColor === "green" ? "bg-emerald-500/20 text-emerald-200" : row.statusColor === "red" ? "bg-rose-500/20 text-rose-200" : "bg-white/5 text-stone-300"}`}>
                        {row.statusColor === "green" ? "Done" : row.statusColor === "red" ? "Declined" : "Pending"}
                      </button>
                      {isFlipped && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-200">Flipped</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {colorPickerCell && (
        <div className="fixed left-4 top-4 z-50 rounded-[2rem] border border-white/10 bg-[#12100e] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
          <div className="text-center">
            <p className="mb-3 text-sm text-stone-400">Color for <span className="text-amber-200 font-medium">{fieldLabels[colorPickerCell.field]}</span></p>
            <div className="flex justify-center gap-3">
              <button onClick={() => handleColorSelected("white")}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/60 bg-white text-xs font-bold uppercase tracking-wider text-stone-800 transition hover:scale-110">W</button>
              <button onClick={() => handleColorSelected("red")}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-rose-400/70 bg-rose-600 text-xs font-bold uppercase tracking-wider text-white transition hover:scale-110">R</button>
              <button onClick={() => handleColorSelected("green")}
                className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400/70 bg-emerald-600 text-xs font-bold uppercase tracking-wider text-white transition hover:scale-110">G</button>
            </div>
            <button onClick={() => setColorPickerCell(null)}
              className="mt-3 rounded-full border border-white/10 px-4 py-1.5 text-xs text-stone-400 transition hover:text-white hover:bg-white/5">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button onClick={handleAddRow}
          className="flex items-center gap-2 rounded-full border-2 border-dashed border-white/20 px-8 py-4 text-base text-stone-400 transition hover:border-amber-200/40 hover:text-amber-200 hover:bg-amber-200/5">
          <span className="text-2xl font-light">+</span><span>Add new entry</span>
        </button>
        <button onClick={handleRemoveRow} disabled={!selectedRow}
          className={`flex items-center gap-2 rounded-full border-2 px-8 py-4 text-base transition ${selectedRow ? "border-rose-400/40 text-rose-300 hover:border-rose-300/60 hover:bg-rose-500/10 hover:text-rose-200" : "border-white/10 text-stone-600 cursor-not-allowed"}`}>
          <span className="text-2xl font-light">x</span><span>Remove selected row</span>
        </button>
      </div>

      {flippedCount > 0 && (
        <div className="rounded-[2rem] border border-purple-300/20 bg-purple-500/5 p-6">
          <h2 className="text-lg font-semibold text-white">Flipped Houses</h2>
          <p className="text-sm text-stone-400">These deals with commission amounts exceeding R39,000. Click a row to jump to it in the table above.</p>
          <div className="mt-4 space-y-2">
            {data.filter((d) => d.commission > 39000).map((d) => (
              <div key={d.id} onClick={() => scrollToBookRow(d.id)}
                className="flex cursor-pointer items-center justify-between rounded-2xl border border-purple-300/10 bg-black/20 px-5 py-3 transition hover:border-amber-300/30 hover:bg-amber-200/10 hover:scale-[1.01]">
                <div><p className="text-sm font-medium text-white">{d.buyer} to {d.seller}</p><p className="text-xs text-stone-400">{d.month} . {d.area}</p></div>
                <span className="text-sm font-semibold text-purple-200">{formatMoney(d.commission)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <Link href="/admin/books/understanding"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm text-stone-400 transition hover:border-amber-200/40 hover:text-amber-200">
          <span>Books Understanding — learn how this page works</span>
        </Link>
      </div>

      <p className="text-center text-xs text-stone-600">
        Click any cell to edit. First pick a color (white/red/green), then type your value. Press Enter to save, Escape to cancel. Double-click a row to select it, then click Remove selected row to delete it.
      </p>
    </div>
  );
}