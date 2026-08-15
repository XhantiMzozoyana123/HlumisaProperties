"use client";

import { useEffect, useState } from "react";
import { fetchReferrals, createReferral, deleteReferral, toggleReferralDiscarded } from "@/lib/api";
import RequireZola from "@/components/RequireZola";

type Referral = Awaited<ReturnType<typeof fetchReferrals>>[number];

export default function ReferralsPage() {
  return (
    <RequireZola>
      <ReferralsContent />
    </RequireZola>
  );
}

function ReferralsContent() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    referrerName: "",
    referrerPhone: "",
    intent: "buy" as "buy" | "sell",
    note: "",
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchReferrals();
        if (active) setReferrals(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load referrals.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const activeReferrals = referrals.filter((r) => !r.isDiscarded);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const newRef = await createReferral({
        ...form,
        date: new Date().toISOString().split("T")[0],
        isDiscarded: false,
      });
      setReferrals((current) => [newRef, ...current]);
      setForm({
        referrerName: "",
        referrerPhone: "",
        intent: "buy",
        note: "",
      });
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create referral.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this referral permanently?")) return;
    try {
      await deleteReferral(id);
      setReferrals((current) => current.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete referral.");
    }
  }

  async function handleDiscard(id: number) {
    try {
      await toggleReferralDiscarded(id);
      setReferrals((current) => current.map((r) => r.id === id ? { ...r, isDiscarded: !r.isDiscarded } : r));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update referral.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-sm text-stone-400">Loading referrals…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-6 text-sm text-rose-100">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Referrals</h1>
          <p className="mt-1 text-sm text-stone-400">
            {activeReferrals.length} active referral{activeReferrals.length !== 1 ? "s" : ""}
            {referrals.length - activeReferrals.length > 0 && (
              <span className="text-stone-500"> &middot; {referrals.length - activeReferrals.length} greyed out</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
        >
          + Add referral
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="backdrop-card rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-white">New referral</h2>
          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-400">Referrer</p>
            </div>
            <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" placeholder="Full name" value={form.referrerName} onChange={(e) => setForm((f) => ({ ...f, referrerName: e.target.value }))} required />
            <input className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500" placeholder="Phone number" value={form.referrerPhone} onChange={(e) => setForm((f) => ({ ...f, referrerPhone: e.target.value }))} required />

            <select className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none" value={form.intent} onChange={(e) => setForm((f) => ({ ...f, intent: e.target.value as "buy" | "sell" }))}>
              <option value="buy">Looking to Buy</option>
              <option value="sell">Looking to Sell</option>
            </select>
            <textarea className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 sm:col-span-2" placeholder="Notes / details about the referral" rows={2} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            <div className="flex items-center gap-3 sm:col-span-2">
              <button type="submit" className="rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100">
                Save referral
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-300 transition hover:bg-white/5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {referrals.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-stone-400">
          No referrals yet. Click &ldquo;+ Add referral&rdquo; to record one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[1.5rem] border border-white/10 bg-black/20">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-stone-500">
                <th className="px-5 py-4 font-medium">Referrer</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Notes</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr
                  key={r.id}
                  onDoubleClick={() => {
                    if (r.isDiscarded) handleDiscard(r.id);
                  }}
                  className={`border-b border-white/5 last:border-0 ${
                    r.isDiscarded ? "opacity-40 bg-stone-900/20" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${r.isDiscarded ? "text-stone-500 line-through" : "text-white"}`}>
                        {r.referrerName}
                      </p>
                      <p className="text-xs text-stone-400">{r.referrerPhone}</p>
                      <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700">In Process</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {r.isDiscarded ? "Greyed out" : "In Process"}
                  </td>
                  <td className={`px-5 py-4 ${r.isDiscarded ? "text-stone-500" : "text-stone-400"}`}>{r.date}</td>
                  <td className={`px-5 py-4 max-w-[200px] truncate ${r.isDiscarded ? "text-stone-500" : "text-stone-400"}`}>{r.note || "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {!r.isDiscarded ? (
                        <button
                          onClick={() => handleDiscard(r.id)}
                          className="rounded-full border border-stone-400/20 px-3 py-1 text-xs text-stone-400 transition hover:bg-stone-500/10"
                        >
                          Grey out
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDiscard(r.id)}
                          className="rounded-full border border-emerald-400/20 px-3 py-1 text-xs text-emerald-200 transition hover:bg-emerald-500/10"
                        >
                          Ungrey
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="rounded-full border border-rose-300/20 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}