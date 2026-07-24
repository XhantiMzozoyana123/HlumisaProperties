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
    <div className="px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-sm text-stone-400 transition hover:text-white"
        >
          ← Back to Properties
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ─── Image ─── */}
          <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#1d2736]">
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
              <div className="mb-3 flex flex-wrap items-center gap-2">
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
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-stone-400">
                  {property.propertyType}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-stone-400">
                  {property.listingType}
                </span>
              </div>
              <h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
                {property.title}
              </h1>
              <p className="mt-2 text-stone-400">{property.location}</p>
            </div>

            <p className="text-3xl font-semibold text-amber-200">{formatMoney(property.price)}</p>

            <div className="flex flex-wrap gap-3">
              <div className="backdrop-card rounded-[1rem] px-5 py-3 text-center min-w-[80px]">
                <p className="text-lg font-semibold text-white">{property.bedrooms}</p>
                <p className="text-xs text-stone-500">Bedrooms</p>
              </div>
              <div className="backdrop-card rounded-[1rem] px-5 py-3 text-center min-w-[80px]">
                <p className="text-lg font-semibold text-white">{property.bathrooms}</p>
                <p className="text-xs text-stone-500">Bathrooms</p>
              </div>
              {property.sizeInSqm > 0 && (
                <div className="backdrop-card rounded-[1rem] px-5 py-3 text-center min-w-[80px]">
                  <p className="text-lg font-semibold text-white">{property.sizeInSqm.toFixed(0)}</p>
                  <p className="text-xs text-stone-500">m²</p>
                </div>
              )}
            </div>

            <div className="backdrop-card rounded-[1.5rem] p-6">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-amber-200/80">Description</p>
              <p className="leading-relaxed text-stone-300">{property.description}</p>
            </div>

            <div className="flex items-center gap-3 text-sm text-stone-500">
              <span>Added {property.dateAdded}</span>
              {property.sellerName && <span>· Seller: {property.sellerName}</span>}
            </div>

            <Link
              href="/contact"
              className="inline-block rounded-full bg-amber-200 px-8 py-4 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
            >
              Inquire About This Property
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}