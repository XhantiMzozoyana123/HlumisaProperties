"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchBuyers, fetchSellers, fetchReferrals, fetchProperties, formatMoney } from "@/lib/api";

export default function DashboardPage() {
  const [buyerCount, setBuyerCount] = useState(0);
  const [sellerCount, setSellerCount] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [properties, setProperties] = useState<Awaited<ReturnType<typeof fetchProperties>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const [buyers, sellers, referrals, props] = await Promise.all([
          fetchBuyers().catch(() => []),
          fetchSellers().catch(() => []),
          fetchReferrals().catch(() => []),
          fetchProperties().catch(() => []),
        ]);
        if (!active) return;
        setBuyerCount(buyers.filter((b: { isDiscarded: boolean }) => !b.isDiscarded).length);
        setSellerCount(sellers.filter((s: { isDiscarded: boolean }) => !s.isDiscarded).length);
        setReferralCount(referrals.filter((r: { isDiscarded: boolean }) => !r.isDiscarded).length);
        setProperties(props);
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const totalLeads = buyerCount + sellerCount + referralCount;
  const totalProperties = properties.length;
  const onMarketProperties = properties.filter((h: { status: string }) => h.status === "on-market").length;
  const totalValue = properties.reduce((sum: number, h: { price: number }) => sum + h.price, 0);

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
          <span className="text-5xl font-bold text-white">{loading ? "..." : buyerCount} Buyers</span>
          <p className="mt-3 text-base text-stone-400">All active buyer leads</p>
        </Link>
        <Link
          href="/admin/sellers"
          className="flex flex-col items-center justify-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-500/30 to-sky-600/20 p-8 text-center backdrop-blur-md transition-all hover:scale-[1.02] hover:border-sky-400/30 hover:shadow-lg hover:shadow-sky-500/10"
        >
          <span className="text-5xl font-bold text-white">{loading ? "..." : sellerCount} Sellers</span>
          <p className="mt-3 text-base text-stone-400">All active seller leads</p>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <StatCard label="Total leads" value={loading ? "..." : totalLeads} />
        <StatCard label="Total properties" value={loading ? "..." : totalProperties} />
        <StatCard label="Portfolio value" value={loading ? "..." : formatMoney(totalValue)} />
      </div>

      {/* Recent referrals */}
      <div className="backdrop-card rounded-[2rem] p-6">
        <h2 className="text-lg font-semibold text-white">Recent referrals</h2>
        <p className="text-sm text-stone-400">Latest referrals captured.</p>
        <div className="mt-4 space-y-2">
          {!loading && referralCount === 0 && (
            <p className="text-sm text-stone-500">No referrals yet.</p>
          )}
        </div>
      </div>

      {/* Recent properties */}
      <div className="backdrop-card rounded-[2rem] p-6">
        <h2 className="text-lg font-semibold text-white">Recent properties</h2>
        <p className="text-sm text-stone-400">
          {loading ? "..." : onMarketProperties} on market &middot; {loading ? "..." : totalProperties - onMarketProperties} under offer / sold
        </p>
        <div className="mt-4 space-y-2">
          {!loading && properties.length === 0 && (
            <p className="text-sm text-stone-500">No properties yet.</p>
          )}
          {[...properties].reverse().slice(0, 5).map((property: { id: number; title: string; status: string; price: number }) => (
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