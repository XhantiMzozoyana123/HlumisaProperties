import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hlumisa Properties — Luxury Real Estate",
  description:
    "Discover exclusive properties with Hlumisa Properties. Premium real estate services across South Africa's finest locations.",
  openGraph: {
    title: "Hlumisa Properties — Luxury Real Estate",
    description:
      "Discover exclusive properties with Hlumisa Properties. Premium real estate services across South Africa's finest locations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-warm-black/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold gold-text font-serif tracking-wide">Hlumisa</span>
              <span className="hidden text-sm font-light tracking-[0.3em] text-stone-400 sm:block">
                PROPERTIES
              </span>
            </Link>
            <div className="flex items-center gap-8 text-sm">
              <Link href="/" className="text-stone-300 transition hover:text-gold-light">
                Home
              </Link>
              <Link href="/properties" className="text-stone-300 transition hover:text-gold-light">
                Properties
              </Link>
              <Link href="/about" className="text-stone-300 transition hover:text-gold-light">
                About
              </Link>
              <Link
                href="/contact"
                className="rounded-full gold-gradient px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Contact
              </Link>
            </div>
          </div>
        </nav>

        <main className="min-h-screen pt-20">{children}</main>

        <footer className="border-t border-white/5 bg-warm-black">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="grid gap-12 md:grid-cols-4">
              <div className="md:col-span-2">
                <span className="text-2xl font-bold gold-text font-serif">Hlumisa Properties</span>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-400">
                  South Africa's premier luxury real estate agency. We specialise in exceptional
                  properties across the country's most desirable locations.
                </p>
              </div>
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Quick Links</h4>
                <div className="space-y-3 text-sm text-stone-400">
                  <Link href="/properties" className="block transition hover:text-gold-light">Properties</Link>
                  <Link href="/about" className="block transition hover:text-gold-light">About Us</Link>
                  <Link href="/contact" className="block transition hover:text-gold-light">Contact</Link>
                </div>
              </div>
              <div>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Contact</h4>
                <div className="space-y-3 text-sm text-stone-400">
                  <p>info@hlumisaproperties.co.za</p>
                  <p>+27 (0) 82 555 0001</p>
                  <p>Umhlanga Ridge, Durban</p>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-white/5 pt-8 text-center text-xs text-stone-600">
              &copy; {new Date().getFullYear()} Hlumisa Properties. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}