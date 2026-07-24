import Link from "next/link";

export const metadata = {
  title: "About | Hlumisa Properties",
  description: "Learn about Hlumisa Properties — South Africa's premier luxury real estate agency.",
};

export default function AboutPage() {
  return (
    <div className="px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-200/80">Who We Are</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            About <span className="text-amber-200">Hlumisa Properties</span>
          </h1>
        </div>

        <div className="mx-auto max-w-3xl space-y-8">
          <p className="text-lg leading-8 text-stone-300">
            Founded with a passion for exceptional real estate, <strong className="text-white">Hlumisa Properties</strong> has
            grown into one of South Africa's most trusted names in luxury property. We specialise in connecting
            discerning buyers with extraordinary homes across the country's most desirable locations.
          </p>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Our Mission</p>
            <h2 className="mb-4 text-xl font-semibold text-white">Mission</h2>
            <p className="leading-relaxed text-stone-300">
              To provide an unparalleled real estate experience through deep market knowledge,
              personalised service, and an unwavering commitment to excellence. Every property
              we represent is carefully vetted to ensure it meets the highest standards of quality
              and desirability.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Why Choose Us</p>
            <h2 className="mb-5 text-xl font-semibold text-white">Why Choose Us</h2>
            <div className="space-y-5">
              {[
                { title: "Curated Portfolio", desc: "Every property is hand-selected for its quality, location, and investment potential." },
                { title: "Local Expertise", desc: "Deep knowledge of South Africa's premium markets from Umhlanga to Sandton, Cape Town to Franschhoek." },
                { title: "Personalised Service", desc: "Dedicated agents who understand your unique needs and preferences." },
                { title: "Trusted Network", desc: "Established relationships with top conveyancers, bond originators, and property professionals." },
              ].map((item) => (
                <div key={item.title} className="border-l-2 border-amber-200/50 pl-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-stone-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className="rounded-full bg-amber-200 px-8 py-4 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}