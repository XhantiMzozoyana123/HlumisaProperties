import Link from "next/link";

export const metadata = {
  title: "About | Hlumisa Properties",
  description: "Learn about Hlumisa Properties — South Africa's premier luxury real estate agency.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-16 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] gold-text">Who We Are</p>
        <h1 className="text-5xl font-bold text-white">About Hlumisa Properties</h1>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 text-stone-300 leading-relaxed">
        <p className="text-lg">
          Founded with a passion for exceptional real estate, <strong className="text-white">Hlumisa Properties</strong> has
          grown into one of South Africa's most trusted names in luxury property. We specialise in connecting
          discerning buyers with extraordinary homes across the country's most desirable locations.
        </p>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
          <h2 className="mb-4 text-2xl font-bold text-white font-serif">Our Mission</h2>
          <p>
            To provide an unparalleled real estate experience through deep market knowledge, 
            personalised service, and an unwavering commitment to excellence. Every property 
            we represent is carefully vetted to ensure it meets the highest standards of quality 
            and desirability.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
          <h2 className="mb-4 text-2xl font-bold text-white font-serif">Why Choose Us</h2>
          <ul className="space-y-4">
            {[
              { title: "Curated Portfolio", desc: "Every property is hand-selected for its quality, location, and investment potential." },
              { title: "Local Expertise", desc: "Deep knowledge of South Africa's premium markets from Umhlanga to Sandton, Cape Town to Franschhoek." },
              { title: "Personalised Service", desc: "Dedicated agents who understand your unique needs and preferences." },
              { title: "Trusted Network", desc: "Established relationships with top conveyancers, bond originators, and property professionals." },
            ].map((item) => (
              <li key={item.title} className="border-l-2 gold-border pl-4">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-stone-400">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/contact"
          className="gold-gradient rounded-full px-10 py-4 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Get in Touch
        </Link>
      </div>
    </div>
  );
}