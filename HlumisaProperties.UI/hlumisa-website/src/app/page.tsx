import Link from "next/link";
import { fetchProperties, formatMoney } from "@/lib/api";

export const revalidate = 60;

export default async function HomePage() {
  let properties = await fetchProperties().catch(() => []);

  // Show only available on-market properties, up to 6
  const featured = properties
    .filter((p) => p.isAvailable && p.status === "on-market")
    .slice(0, 6);

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-warm-black via-transparent to-warm-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,83,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] gold-text">
            South Africa's Finest Properties
          </p>
          <h1 className="text-5xl font-bold leading-tight text-white md:text-7xl">
            Exceptional Living <br />
            <span className="gold-text">Awaits You</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-400">
            Discover a curated collection of the most exclusive properties across
            South Africa. From coastal villas to city penthouses — find your
            extraordinary home with Hlumisa Properties.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/properties"
              className="gold-gradient rounded-full px-10 py-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Browse Properties
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/10 px-10 py-4 text-sm font-semibold text-stone-300 transition hover:border-white/20 hover:text-white"
            >
              Get in Touch
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-warm-black to-transparent" />
      </section>

      {/* ─── Stats ─── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-8 text-center md:grid-cols-3">
          {[
            { label: "Properties Listed", value: properties.length },
            { label: "Premium Locations", value: "15+" },
            { label: "Years Experience", value: "10+" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
              <p className="text-4xl font-bold gold-text font-serif">{stat.value}</p>
              <p className="mt-2 text-sm text-stone-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured Listings ─── */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] gold-text">
            Featured
          </p>
          <h2 className="text-4xl font-bold text-white">Available Properties</h2>
          <p className="mx-auto mt-4 max-w-xl text-stone-400">
            Hand-picked properties currently available on the market.
          </p>
        </div>

        {featured.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-stone-400">No properties available at this time. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
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
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-stone-400">
                      {property.propertyType}
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-stone-400">
                      {property.listingType}
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

        {properties.length > 6 && (
          <div className="mt-10 text-center">
            <Link
              href="/properties"
              className="inline-block rounded-full border border-white/10 px-8 py-3 text-sm font-semibold text-stone-300 transition hover:border-white/20 hover:text-white"
            >
              View All Properties →
            </Link>
          </div>
        )}
      </section>
    </>
  );
}