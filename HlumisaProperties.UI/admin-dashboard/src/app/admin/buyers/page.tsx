"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchBuyers, deleteBuyer, toggleBuyerDiscarded, markBuyerContacted, createBuyer } from "@/lib/api";
import { getSession } from "@/lib/session";

type Buyer = Awaited<ReturnType<typeof fetchBuyers>>[number];

export default function BuyersPage() {
  const [isBruWhite, setIsBruWhite] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    location: "",
    budget: "",
    propertyType: "",
  });

  useEffect(() => {
    setIsBruWhite(getSession()?.role === "bru-white");
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBuyers();
        if (active) setBuyers(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load buyers.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const activeBuyers = buyers.filter((b) => !b.isDiscarded);

  async function handleDelete(id: number) {
    if (!confirm("Delete this buyer permanently?")) return;
    try {
      await deleteBuyer(id);
      setBuyers((current) => current.filter((b) => b.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete buyer.");
    }
  }

  async function handleDiscard(id: number) {
    try {
      await toggleBuyerDiscarded(id);
      setBuyers((current) => current.map((b) => b.id === id ? { ...b, isDiscarded: !b.isDiscarded } : b));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update buyer.");
    }
  }

  async function handleContact(id: number) {
    try {
      await markBuyerContacted(id);
      setBuyers((current) => current.map((b) => b.id === id ? { ...b, isContacted: true } : b));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update buyer.");
    }
  }

  async function handleAddBuyer(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const newBuyer = await createBuyer({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        location: form.location.trim(),
        budget: form.budget.trim(),
        propertyType: form.propertyType.trim(),
        isContacted: false,
        isDiscarded: false,
      });
      setBuyers((current) => [newBuyer, ...current]);
      setShowAddModal(false);
      setForm({ firstName: "", lastName: "", phoneNumber: "", location: "", budget: "", propertyType: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add buyer.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-sm text-stone-400">Loading buyers…</p>
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
          <h1 className="text-3xl font-semibold text-white">Buyers</h1>
          <p className="mt-1 text-sm text-stone-400">
            {activeBuyers.length} active buyer lead{activeBuyers.length !== 1 ? "s" : ""}
            {buyers.length - activeBuyers.length > 0 && (
              <span className="text-stone-500"> &middot; {buyers.length - activeBuyers.length} discarded</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
          >
            + Add Buyer
          </button>
          <Link
            href={isBruWhite ? "/admin" : "/admin/dashboard"}
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-stone-300 transition hover:border-white/20 hover:text-white"
          >
            &larr; {isBruWhite ? "Back to Profiles" : "Back to Dashboard"}
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {buyers.map((buyer) => (
          <div
            key={buyer.id}
            className={`rounded-[1.5rem] border p-5 transition ${
              buyer.isDiscarded
                ? "border-stone-800 bg-stone-900/30 opacity-50"
                : "border-white/10 bg-black/20"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className={`text-base font-semibold ${buyer.isDiscarded ? "text-stone-500 line-through" : "text-white"}`}>
                  {buyer.firstName} {buyer.lastName}
                </p>
                <p className="text-sm text-stone-400">{buyer.phoneNumber}</p>
                <p className="text-sm text-stone-400">{buyer.location}</p>
                <p className="mt-1 text-xs text-stone-500">{buyer.propertyType}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    buyer.isDiscarded
                      ? "bg-stone-500/10 text-stone-400"
                      : buyer.isContacted
                        ? "bg-emerald-500/10 text-emerald-200"
                        : "bg-amber-500/10 text-amber-200"
                  }`}
                >
                  {buyer.isDiscarded ? "Discarded" : buyer.isContacted ? "Contacted" : "New"}
                </span>
                <div className="flex gap-2">
                  {!buyer.isDiscarded && (
                    <>
                      <button
                        onClick={() => handleContact(buyer.id)}
                        className="rounded-full border border-emerald-400/20 px-4 py-1.5 text-xs text-emerald-200 transition hover:bg-emerald-500/10"
                      >
                        {buyer.isContacted ? "Mark new" : "Mark contacted"}
                      </button>
                      <button
                        onClick={() => handleDiscard(buyer.id)}
                        className="rounded-full border border-stone-400/20 px-4 py-1.5 text-xs text-stone-400 transition hover:bg-stone-500/10"
                      >
                        Grey out
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(buyer.id)}
                    className="rounded-full border border-rose-300/20 px-4 py-1.5 text-xs text-rose-200 transition hover:bg-rose-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Buyer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-[#1d2736] p-6 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add Buyer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-stone-400 transition hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleAddBuyer}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-stone-400">First Name</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/30"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-stone-400">Last Name</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/30"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-stone-400">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/30"
                  placeholder="+27 82 555 0000"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-stone-400">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/30"
                  placeholder="Johannesburg"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-stone-400">Budget</label>
                <input
                  type="text"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/30"
                  placeholder="R3,000,000"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-stone-400">Property Type</label>
                <input
                  type="text"
                  value={form.propertyType}
                  onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/30"
                  placeholder="House, Flat, etc."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Adding..." : "Add Buyer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}