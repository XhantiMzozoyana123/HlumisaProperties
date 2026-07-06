"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSellers, deleteSeller, toggleSellerDiscarded, cycleSellerStatusColor, type Seller, type SellerStatusColor } from "@/lib/localData";

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    setSellers(getSellers());
  }, []);

  function refresh() {
    setSellers(getSellers());
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this seller permanently?")) return;
    deleteSeller(id);
    refresh();
  }

  function handleDiscard(id: string) {
    toggleSellerDiscarded(id);
    refresh();
  }

  function handleCycleColor(id: string) {
    cycleSellerStatusColor(id);
    refresh();
  }

  function handleDoubleClick(id: string, isDiscarded: boolean) {
    if (isDiscarded) {
      toggleSellerDiscarded(id);
      refresh();
    }
  }

  const activeSellers = sellers.filter((s) => !s.isDiscarded);

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
        <Link
          href="/admin/dashboard"
          className="rounded-full border border-white/10 px-5 py-2 text-sm text-stone-300 transition hover:border-white/20 hover:text-white"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="space-y-3">
        {sellers.map((seller) => (
          <div
            key={seller.id}
            onDoubleClick={() => handleDoubleClick(seller.id, seller.isDiscarded)}
            className={`rounded-[1.5rem] border p-5 transition cursor-default ${
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
                <p className="mt-1 text-xs text-stone-500">House</p>
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
    </div>
  );
}