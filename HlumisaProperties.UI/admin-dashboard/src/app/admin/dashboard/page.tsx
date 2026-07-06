"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getDemoHouses,
  getBuyers,
  getSellers,
  getReferrals,
  formatMoney,
  type DemoHouse,
  type Buyer,
  type Seller,
} from "@/lib/localData";

export default function DashboardPage() {
  const [houses, setHouses] = useState<DemoHouse[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [referrals, setReferralsCount] = useState(0);

  useEffect(() => {
    setHouses(getDemoHouses());
    setBuyers(getBuyers());
    setSellers(getSellers());
    setReferralsCount(getReferrals().length);
  }, []);

  const activeBuyers = buyers.filter((b) => !b.isDiscarded);
  const activeSellers = sellers.filter((s) => !s.isDiscarded);
  const totalLeads = activeBuyers.length + activeSellers.length + referrals;
  const totalProperties = houses.length;
  const onMarketProperties = houses.filter((h) => h.status === "on-market").length;
  const totalValue = houses.reduce((sum, h) => sum + h.price, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-400">Overview of Hlumisa Properties activity.</p>
      </div>

      {/* Buyers & Sellers buttons - tall hero section */}
      <div className="grid gap-4 sm:grid-cols-2 h-[32rem]">
        <Link
          href="/admin/buyers"
          className="flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 p-8 text-center backdrop-blur-md transition-all hover:scale-[1.02] hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/10"
        >
          <span className="text-5xl font-bold text-white">{activeBuyers.length} Buyers</span>
          <p className="mt-3 text-base text-stone-400">All active buyer leads</p>
        </Link>
        <Link
          href="/admin/sellers"
          className="flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-500/30 to-sky-600/20 p-8 text-center backdrop-blur-md transition-all hover:scale-[1.02] hover:border-sky-400/30 hover:shadow-lg hover:shadow-sky-500/10"
        >
          <span className="text-5xl font-bold text-white">{activeSellers.length} Sellers</span>
          <p className="mt-3 text-base text-stone-400">All active seller leads</p>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <StatCard label="Total leads" value={totalLeads} />
        <StatCard label="Total properties" value={totalProperties} />
        <StatCard label="Portfolio value" value={formatMoney(totalValue)} />
      </div>

      {/* Recent referrals */}
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="text-lg font-semibold text-white">Recent referrals</h2>
        <p className="text-sm text-stone-400">Latest referrals captured.</p>
        <div className="mt-4 space-y-2">
          {referrals === 0 && (
            <p className="text-sm text-stone-500">No referrals yet.</p>
          )}
        </div>
      </div>

      {/* Recent properties */}
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="text-lg font-semibold text-white">Recent properties</h2>
        <p className="text-sm text-stone-400">
          {onMarketProperties} on market &middot; {houses.length - onMarketProperties} under offer / sold
        </p>
        <div className="mt-4 space-y-2">
          {houses.length === 0 && (
            <p className="text-sm text-stone-500">No properties yet.</p>
          )}
          {[...houses].reverse().slice(0, 5).map((property) => (
            <div
              key={property.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium text-white">{property.title}</p>
                <p className="text-xs text-stone-400">{property.status === "on-market" ? "On Market" : property.status === "under-offer" ? "Under Offer" : "Sold"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-amber-200">{formatMoney(property.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}