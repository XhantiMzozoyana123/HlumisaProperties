import Link from "next/link";
import { fetchProperties, formatMoney } from "@/lib/api";

export const revalidate = 60;

export default async function PropertiesPage() {
  const properties = await fetchProperties().catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-12 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] gold-text">Our Portfolio</p>
        <h1 className="text-5xl font-bold text-white">All Properties</h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-400">
          Browse our complete collection of exceptional properties.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-16 text-center">
          <p className="text-stone-400">No properties available at this time. Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
                {property.imageBase64 ? (
                  <img
                    src={property.imageBase64}
                    alt={property.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-600 text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  {property.status === "on-market" && (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                      Available
                    </span>
                  )}
                  {property.status === "under-offer" && (
                    <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs text-orange-400">
                      Under Offer
                    </span>
                  )}
                  {property.status === "sold" && (
                    <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-400">
                      Sold
                    </span>
                  )}
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-stone-400">
                    {property.propertyType}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:gold-text transition">
                  {property.title}
                </h3>
                <p className="mt-1 text-sm text-stone-500">{property.location}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-bold gold-text">{formatMoney(property.price)}</p>
                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span>{property.bedrooms} bed</span>
                    <span>{property.bathrooms} bath</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}