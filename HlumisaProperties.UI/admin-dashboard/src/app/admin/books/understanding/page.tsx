"use client";

import Link from "next/link";

export default function BooksUnderstandingPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/books"
          className="rounded-full border border-white/10 px-4 py-2 text-xs text-stone-400 transition hover:border-amber-200/40 hover:text-amber-200"
        >
          ← Back to Books
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-white">Books Understanding</h1>
          <p className="mt-1 text-sm text-stone-400">How the transaction ledger works — logic, columns & auto-calculations.</p>
        </div>
      </div>

      {/* Overview */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white">📖 Overview</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">
          The <strong className="text-amber-200">Books</strong> section is a transaction ledger that records all property deals handled by Hlumisa Properties. Each row represents a single deal between a buyer and a seller. The table stores key financial figures for each transaction, including the amount due to the seller, commissions earned, transfer costs, electrical certificate fees, water account balances, Section 118 figures, and outstanding balances.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-300">
          You can edit any editable cell by clicking on it. <strong className="text-amber-200">First a color picker popup appears</strong> — choose white, red, or green to highlight the cell value. Then type your value and press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-amber-200">Enter</kbd> to save or <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-stone-400">Esc</kbd> to cancel. All changes are saved locally in your browser using <strong className="text-stone-200">localStorage</strong> when you click the "Save Changes" button.
        </p>
      </section>

      {/* Column-by-column breakdown */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white">📋 Column Breakdown (in order)</h2>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-stone-300">
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">📅 Date</h3>
            <p className="mt-1">The date the entry was created. When you click "+ Add new entry", it automatically fills with today's South African date (YYYY-MM-DD). You can edit this manually if needed.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">📆 Month</h3>
            <p className="mt-1">The month this deal belongs to (e.g. JANUARY, FEBRUARY etc.). This field is read-only and is used for filtering the table. New entries default to the currently selected month, or JULY if "All Months" is active.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">👤 Buyer & Seller</h3>
            <p className="mt-1">Text fields for the names of the buyer and the seller involved in the property transaction.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">💰 Original Amount</h3>
            <p className="mt-1"><strong className="text-stone-200">This is purely a note/reference field.</strong> It stores the original price of the property so you can look back and see what it was initially listed for. It <strong className="text-rose-300">does NOT</strong> affect any calculations. It's just for your information.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">💵 Due to Seller</h3>
            <p className="mt-1">This is the money that goes <strong className="text-emerald-200">to the seller</strong>. It represents the amount the buyer has paid that is passed on to the seller of the property. (Previously called "Amount Paid".)</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">🏦 Deposit</h3>
            <p className="mt-1">Any deposit paid by the buyer as part of the property purchase.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">📄 Lost Deed</h3>
            <p className="mt-1">Costs associated with lost or missing title deeds. When this amount is <strong className="text-rose-300">R7,800</strong>, it gets highlighted in red as a common known cost for deed recovery.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">🏆 Commission</h3>
            <p className="mt-1">The commission Hlumisa Properties earns from the deal. When commission exceeds <strong className="text-purple-200">R39,000</strong>, the deal is flagged as a <strong className="text-purple-200">"Flipped House"</strong> — it gets highlighted in purple and appears in a special section below the table for quick access.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">📦 Transfer Costs</h3>
            <p className="mt-1">The legal and administrative costs for transferring the property from the seller to the buyer.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">📋 Master Fees</h3>
            <p className="mt-1">Fees paid to the Master of the High Court for estate-related matters. Now placed right next to Transfer Costs for easy reference. These are also tracked in the summary cards at the top.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">⚡ Elec Cert</h3>
            <p className="mt-1">Electrical Certificate costs — the fee for the required electrical compliance certificate needed when transferring a property.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">🚰 Water Account</h3>
            <p className="mt-1">Outstanding water account amounts for the property that need to be settled as part of the transfer process.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">📋 Section 118</h3>
            <p className="mt-1">Section 118 is part of the property transfer process. Before a property can be transferred to a new owner, the municipality must issue a Rates Clearance Certificate. To get this certificate, the municipality requires a Section 118 clearance amount to be paid.</p>
            <div className="mt-3 rounded-lg border border-amber-200/20 bg-amber-500/5 p-4">
              <p className="font-medium text-amber-200 text-xs uppercase tracking-wide">Example</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li><span className="text-stone-400">Total municipal debt on the property:</span> <span className="text-white font-medium">R180,000</span></li>
                <li><span className="text-stone-400">Section 118 clearance amount required for the transfer:</span> <span className="text-white font-medium">R65,000</span></li>
              </ul>
              <p className="mt-2 text-sm text-stone-300">Although the total debt is R180,000, paying the R65,000 Section 118 amount allows the municipality to issue the Rates Clearance Certificate, enabling the property transfer to proceed. The remaining balance may still need to be dealt with separately, depending on the circumstances.</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">⚖️ Balance</h3>
            <p className="mt-1">The Balance is the amount remaining <strong className="text-amber-200">after all deductions</strong> (Deposit, Lost Deed, Commission, Transfer Costs, Master Fees, Elec Cert, Water Account, Section 118) are subtracted from the <strong className="text-emerald-200">Due to Seller</strong> amount. It represents what is still owed or leftover on the deal.</p>
            <p className="mt-2"><strong className="text-rose-300">This field is manually editable.</strong> You can click and type whatever balance amount remains. When the value is greater than R0, the deal gets a "⏳ Pending" status badge and the amount is highlighted. This is totalled in the <strong className="text-amber-200">Pending Payments</strong> and <strong className="text-amber-200">Outstanding Total</strong> summary cards at the top. (Previously called "Outstanding".)</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-amber-200">📍 ERF & Area</h3>
            <p className="mt-1">The property's ERF (stand) number and the suburb/area where the property is located (e.g. Motherwell, Ibhayi, Wells Estate). These appear towards the end of the table.</p>
          </div>
        </div>
      </section>

      {/* Cell Color System */}
      <section className="rounded-[2rem] border border-amber-200/20 bg-amber-500/5 p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white">🎨 Cell Color System</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">
          When you click any editable cell in the table, a <strong className="text-amber-200">color picker popup</strong> appears first before you can type your value. This lets you assign a color to the cell value:
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-300">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-stone-200">○</span>
            <span><strong className="text-white">White</strong> — standard/default text color (greyish-white).</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-rose-300">●</span>
            <span><strong className="text-rose-300">Red</strong> — highlights the cell value in rose-red with a subtle red background, useful for flagging problematic amounts.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-300">●</span>
            <span><strong className="text-emerald-300">Green</strong> — highlights the cell value in emerald-green with a subtle green background, useful for confirming completed amounts.</span>
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          The color is remembered per-cell, so it stays even after you navigate away and come back. This helps you visually organize and prioritize your data.
        </p>
      </section>

      {/* Summary Cards */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white">📊 Summary Cards (Top of Page)</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">
          Six summary cards at the top of the Books page give you a quick financial snapshot:
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-300">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span><strong className="text-white">Total Commission</strong> — Sum of all commission amounts for the currently selected month (or all months).</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span><strong className="text-white">Transfer Costs</strong> — Total of all transfer cost amounts for the selected filter.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span><strong className="text-white">Flipped Houses</strong> — Count of deals where commission is greater than R39,000.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span><strong className="text-white">Master Fees</strong> — Total master fees for the selected filter.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span><strong className="text-white">Pending Payments</strong> — Total Balance amount for the currently selected month (filtered).</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span><strong className="text-white">Outstanding Total</strong> — Total Balance across <strong className="text-amber-200">ALL months</strong> (unfiltered), giving you the big picture of all money still owed.</span>
          </li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-stone-400">
          These cards update automatically whenever you edit any cell in the table. No need to manually refresh.
        </p>
      </section>

      {/* Adding & Removing Rows */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white">➕ Adding & Removing Rows</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-300">
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-emerald-200">Add New Entry</h3>
            <p className="mt-1">Click the "<strong className="text-white">+ Add new entry</strong>" button below the table. A new blank row will be added with today's date pre-filled and all financial fields set to R0. The page scrolls to the new row and highlights it briefly so you can find it easily.</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/20 p-4">
            <h3 className="font-semibold text-rose-300">Remove a Row</h3>
            <p className="mt-1"><strong className="text-white">Double-click</strong> any row to select it (it will get a golden highlight border). Then click the "<strong className="text-rose-300">✕ Remove selected row</strong>" button. The row will be deleted and all the summary numbers will update automatically. To deselect without deleting, <strong className="text-white">double-click anywhere on the page background</strong>.</p>
          </div>
        </div>
      </section>

      {/* Monthly Filter */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white">🔍 Monthly Filter</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">
          Use the dropdown in the top-right corner to filter the table by month. Selecting a specific month shows only that month's deals. Selecting "All Months" shows everything. The summary cards and monthly total badges at the top update based on your selection.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-300">
          Below the summary cards, there are also <strong className="text-amber-200">monthly total badges</strong> that show each month's commission and transfer cost totals at a glance <strong className="text-stone-200">(always based on all data, not the filtered view)</strong>.
        </p>
      </section>

      {/* Flipped Houses */}
      <section className="rounded-[2rem] border border-purple-300/20 bg-purple-500/5 p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white">🏠 Flipped Houses Section</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">
          Any deal where the <strong className="text-purple-200">commission exceeds R39,000</strong> is automatically classified as a "Flipped House." These deals appear:
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-300">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-purple-200">•</span>
            <span>In the table with a <strong className="text-purple-200">purple "🏠 Flipped" badge</strong> in the Status column.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-purple-200">•</span>
            <span>In a dedicated <strong className="text-purple-200">Flipped Houses section</strong> below the table, where you can click any entry to jump directly to that row in the table.</span>
          </li>
        </ul>
      </section>

      {/* Row Status */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white">🚦 Row Status Column</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">
          Each row has a <strong className="text-amber-200">Status</strong> button that cycles through three states when clicked:
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-300">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-stone-200">○</span>
            <span><strong className="text-white">Pending</strong> — white/grey default state (not yet processed).</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-rose-300">✕</span>
            <span><strong className="text-rose-300">Declined</strong> — red state for deals that fell through or were declined.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-200">✓</span>
            <span><strong className="text-emerald-200">Done</strong> — green state for completed/successful deals.</span>
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          This is separate from the per-cell color system — it tracks the overall status of the entire row/deal.
        </p>
      </section>

      {/* Auto-updates */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white">⚡ How Auto-Updates Work</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-300">
          The Books page updates all numbers automatically in real-time:
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-300">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-200">1.</span>
            <span>When you edit any cell and press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-amber-200">Enter</kbd>, the data in that row updates immediately.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-200">2.</span>
            <span>The <strong className="text-white">summary cards</strong> (Commission, Transfer Costs, Flipped Houses, Master Fees, Pending Payments, Outstanding Total) recalculate instantly based on the current data and month filter.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-200">3.</span>
            <span>The <strong className="text-white">monthly total badges</strong> (C: commission, T: transfer costs) update whenever any value changes.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-200">4.</span>
            <span>The <strong className="text-white">Flipped Houses section</strong> updates automatically — deals move in and out as their commission changes.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-200">5.</span>
            <span>When you click "<strong className="text-white">Save Changes</strong>", all the current data is persisted to your browser's localStorage.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-emerald-200">6.</span>
            <span>When you <strong className="text-white">remove a row</strong>, all the totals recalculate instantly to reflect the deletion.</span>
          </li>
        </ul>
      </section>

      {/* Important Notes */}
      <section className="rounded-[2rem] border border-amber-200/20 bg-amber-500/5 p-8 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white">⚠️ Important Notes</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-300">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span>The <strong className="text-white">Original Amount</strong> column is purely informational — it does <strong className="text-rose-300">NOT</strong> affect any calculations or the Balance.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span>The <strong className="text-white">Balance</strong> is manually entered by you — it is not auto-calculated from other fields.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span>Data is saved to <strong className="text-white">localStorage</strong> in your browser. Clearing your browser data will erase unsaved changes.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span>The <strong className="text-white">Month</strong> field cannot be edited directly — it is set when you add a new entry based on the currently selected month filter.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-200">•</span>
            <span>Each cell can be individually color-coded (white/red/green) using the color picker popup that appears when you click on a cell. These colors persist across sessions.</span>
          </li>
        </ul>
      </section>

      {/* Back link */}
      <div className="flex justify-center pb-8">
        <Link
          href="/admin/books"
          className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-400 transition hover:border-amber-200/40 hover:text-amber-200"
        >
          ← Back to Books Table
        </Link>
      </div>
    </div>
  );
}