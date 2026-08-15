"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchSellers, deleteSeller, toggleSellerDiscarded, cycleSellerStatusColor, createSeller } from "@/lib/api";
import { getSession } from "@/lib/session";

type Seller = Awaited<ReturnType<typeof fetchSellers>>[number];

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBruWhite, setIsBruWhite] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    location: "",
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
        const data = await fetchSellers();
        if (active) setSellers(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load sellers.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const activeSellers = sellers.filter((s) => !s.isDiscarded);

  async function handleDelete(id: number) {
    if (!confirm("Delete this seller permanently?")) return;
    try {
      await deleteSeller(id);
      setSellers((current) => current.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete seller.");
    }
  }

  async function handleDiscard(id: number) {
    try {
      await toggleSellerDiscarded(id);
      setSellers((current) => current.map((s) => s.id === id ? { ...s, isDiscarded: !s.isDiscarded } : s));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update seller.");
    }
  }

  async function handleCycleColor(id: number) {
    try {
      const updated = await cycleSellerStatusColor(id);
      setSellers((current) => current.map((s) => s.id === id ? { ...s, statusColor: updated.statusColor } : s));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update seller status.");
    }
  }

  async function handleAddSeller(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const newSeller = await createSeller({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        location: form.location.trim(),
        isContacted: false,
        isDiscarded: false,
        statusColor: "gray",
      });
      setSellers((current) => [newSeller, ...current]);
      setShowAddModal(false);
      setForm({ firstName: "", lastName: "", phoneNumber: "", location: "" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add seller.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-sm text-stone-400">Loading sellers…</p>
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
          <h1 className="text-3xl font-semibold text-white">Sellers</h1>
          <p className="mt-1 text-sm text-stone-400">
            {activeSellers.length} active seller lead{activeSellers.length !== 1 ? "s" : ""}
            {sellers.length - activeSellers.length > 0 && (
              <span className="text-stone-500"> &middot; {sellers.length - activeSellers.length} discarded</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
          >
            + Add Seller
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
        {sellers.map((seller) => (
          <div
            key={seller.id}
            className={`rounded-[1.5rem] border p-5 transition ${
              seller.isDiscarded
                ? "border-stone-800 bg-stone-900/30 opacity-50"
                : "border-white/10 bg-black/20"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className={`text-base font-semibold ${seller.isDiscarded ? "text-stone-500 line-through" : "text-white"}`}>
                  {seller.firstName} {seller.lastName}
                </p>
                <p
                  onClick={() => handleCycleColor(seller.id)}
                  className={`text-sm cursor-pointer transition hover:opacity-80 ${
                    seller.isDiscarded
                      ? "text-stone-500"
                      : seller.statusColor === "green"
                        ? "text-emerald-300"
                        : seller.statusColor === "red"
                          ? "text-rose-300"
                          : "text-stone-400"
                  }`}
                >
                  {seller.phoneNumber}
                </p>
                <p className="text-sm text-stone-400">{seller.location}</p>
                <p className="mt-1 text-xs text-stone-500">{seller.propertyType}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => handleCycleColor(seller.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer hover:ring-2 hover:ring-white/20 ${
                    seller.isDiscarded
                      ? "bg-stone-500/10 text-stone-400"
                      : seller.statusColor === "green"
                        ? "bg-emerald-500/10 text-emerald-200"
                        : seller.statusColor === "red"
                          ? "bg-rose-500/10 text-rose-200"
                          : "bg-white/5 text-stone-300"
                  }`}
                >
                  {seller.isDiscarded
                    ? "Discarded"
                    : seller.statusColor === "green"
                      ? "Contacted"
                      : seller.statusColor === "red"
                        ? "Declined"
                        : "New"}
                </button>
                <div className="flex gap-2">
                  {!seller.isDiscarded && (
                    <button
                      onClick={() => handleDiscard(seller.id)}
                      className="rounded-full border border-stone-400/20 px-4 py-1.5 text-xs text-stone-400 transition hover:bg-stone-500/10"
                    >
                      Grey out
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(seller.id)}
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

      {/* Add Seller Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-[#1d2736] p-6 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Add Seller</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-stone-400 transition hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleAddSeller}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-stone-400">First Name</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/30"
                    placeholder="John"
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
                    placeholder="Doe"
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
                  placeholder="Cape Town"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Adding..." : "Add Seller"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}