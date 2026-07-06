"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBuyers, deleteBuyer, toggleBuyerDiscarded, type Buyer } from "@/lib/localData";

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    setBuyers(getBuyers());
  }, []);

  function refresh() {
    setBuyers(getBuyers());
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this buyer permanently?")) return;
    deleteBuyer(id);
    refresh();
  }

  function handleDiscard(id: string) {
    toggleBuyerDiscarded(id);
    refresh();
  }

  function handleDoubleClick(id: string, isDiscarded: boolean) {
    if (isDiscarded) {
      toggleBuyerDiscarded(id);
      refresh();
    }
  }

  const activeBuyers = buyers.filter((b) => !b.isDiscarded);

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
        <Link
          href="/admin/dashboard"
          className="rounded-full border border-white/10 px-5 py-2 text-sm text-stone-300 transition hover:border-white/20 hover:text-white"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="space-y-3">
        {buyers.map((buyer) => (
          <div
            key={buyer.id}
            onDoubleClick={() => handleDoubleClick(buyer.id, buyer.isDiscarded)}
            className={`rounded-[1.5rem] border p-5 transition cursor-default ${
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
                <p className="mt-1 text-xs text-stone-500">House</p>
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
                    <button
                      onClick={() => handleDiscard(buyer.id)}
                      className="rounded-full border border-stone-400/20 px-4 py-1.5 text-xs text-stone-400 transition hover:bg-stone-500/10"
                    >
                      Grey out
                    </button>
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
    </div>
  );
}