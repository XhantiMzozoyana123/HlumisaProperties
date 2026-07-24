import Link from "next/link";
import { fetchProperties, formatMoney } from "@/lib/api";

export const revalidate = 60;

export default async function HomePage() {
  const properties = await fetchProperties().catch(() => []);
  const featured = properties
    .filter((p) => p.isAvailable && p.status === "on-market")
    .slice(0, 6);

  return (
    <div className="px-6 py-10 sm:px-8 lg:px-12">
      {/* ─── Hero ─── */}
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col justify-center gap-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-amber-200/80">
              Hlumisa Properties
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Exceptional living{" "}
              <span className="text-amber-200">awaits you</span>.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-300 sm:text-xl">
              Discover a curated collection of the most exclusive properties across
              South Africa. From coastal villas to city penthouses — find your
              extraordinary home with Hlumisa Properties.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/properties"
                className="rounded-full bg-amber-200 px-8 py-4 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
              >
                Browse Properties
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/10 px-8 py-4 text-sm font-semibold text-stone-300 transition hover:border-white/20 hover:text-white"
              >
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Stat cards */}
          <div className="space-y-5">
            {[
              { label: "Properties Listed", value: properties.length },
              { label: "Premium Locations", value: "15+" },
              { label: "Years Experience", value: "10+" },
            ].map((stat) => (
              <div key={stat.label} className="backdrop-card rounded-[1.5rem] p-6">
                <p className="text-3xl font-semibold text-amber-200">{stat.value}</p>
                <p className="mt-1 text-sm text-stone-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Listings ─── */}
      <section className="mx-auto max-w-6xl pb-24">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-200/80">Featured</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Available <span className="text-amber-200">Properties</span>
          </h2>
        </div>

        {featured.length === 0 ? (
          <div className="backdrop-card rounded-[1.5rem] px-6 py-16 text-center">
            <p className="text-stone-400">No properties available at this time. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="backdrop-card rounded-[1.5rem] overflow-hidden transition hover:bg-white/[0.06]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#1d2736]">
                  {property.imageBase64 ? (
                    <img
                      src={property.imageBase64}
                      alt={property.title}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-600 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-stone-400">
                      {property.propertyType}
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-stone-400">
                      {property.listingType}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white transition group-hover:text-amber-200">
                    {property.title}
                  </h3>
                  <p className="mt-1 text-sm text-stone-500">{property.location}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-semibold text-amber-200">{formatMoney(property.price)}</p>
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

        {properties.length > 6 && (
          <div className="mt-10 text-center">
            <Link
              href="/properties"
              className="rounded-full border border-white/10 px-8 py-3 text-sm font-semibold text-stone-300 transition hover:border-white/20 hover:text-white"
            >
              View All Properties →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}