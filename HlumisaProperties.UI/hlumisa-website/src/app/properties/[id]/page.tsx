import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPropertyById, fetchProperties, formatMoney } from "@/lib/api";

export const revalidate = 60;

export async function generateStaticParams() {
  const properties = await fetchProperties().catch(() => []);
  return properties.map((p) => ({ id: String(p.id) }));
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await fetchPropertyById(Number(id)).catch(() => null);
  if (!property) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-white"
      >
        ← Back to Properties
      </Link>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        {/* ─── Image ─── */}
        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a1a]">
          {property.imageBase64 ? (
            <img
              src={property.imageBase64}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-600 text-sm">
              No image available
            </div>
          )}
        </div>

        {/* ─── Details ─── */}
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center gap-3">
              {property.status === "on-market" && (
                <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
                  Available
                </span>
              )}
              {property.status === "under-offer" && (
                <span className="rounded-full bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400">
                  Under Offer
                </span>
              )}
              {property.status === "sold" && (
                <span className="rounded-full bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-400">
                  Sold
                </span>
              )}
              <span className="rounded-full bg-white/5 px-4 py-1.5 text-xs text-stone-400">
                {property.propertyType}
              </span>
              <span className="rounded-full bg-white/5 px-4 py-1.5 text-xs text-stone-400">
                {property.listingType}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white">{property.title}</h1>
            <p className="mt-2 text-lg text-stone-400">{property.location}</p>
          </div>

          <p className="text-4xl font-bold gold-text">{formatMoney(property.price)}</p>

          <div className="flex gap-6 text-sm">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3 text-center">
              <p className="text-lg font-semibold text-white">{property.bedrooms}</p>
              <p className="text-xs text-stone-500">Bedrooms</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3 text-center">
              <p className="text-lg font-semibold text-white">{property.bathrooms}</p>
              <p className="text-xs text-stone-500">Bathrooms</p>
            </div>
            {property.sizeInSqm > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3 text-center">
                <p className="text-lg font-semibold text-white">{property.sizeInSqm.toFixed(0)}</p>
                <p className="text-xs text-stone-500">m²</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">
              Description
            </h3>
            <p className="leading-relaxed text-stone-300">{property.description}</p>
          </div>

          <div className="text-sm text-stone-500">
            <p>Added: {property.dateAdded}</p>
            {property.sellerName && <p>Seller: {property.sellerName}</p>}
          </div>

          <Link
            href="/contact"
            className="gold-gradient inline-block rounded-full px-10 py-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Inquire About This Property
          </Link>
        </div>
      </div>
    </div>
  );
}