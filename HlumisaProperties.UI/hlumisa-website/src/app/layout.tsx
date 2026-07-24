import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hlumisa Properties",
  description:
    "Hlumisa Properties — South Africa's premier luxury real estate agency.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="main-bg gpu-layer min-h-full flex flex-col">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-white">
                Hlumisa <span className="text-amber-200">Properties</span>
              </span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/" className="text-stone-300 transition hover:text-white">
                Home
              </Link>
              <Link href="/properties" className="text-stone-300 transition hover:text-white">
                Properties
              </Link>
              <Link href="/about" className="text-stone-300 transition hover:text-white">
                About
              </Link>
              <Link
                href="/contact"
                className="rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
              >
                Contact
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex-1 pt-16">{children}</main>

        <footer className="backdrop-card">
          <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <span className="text-lg font-semibold text-white">
                  Hlumisa <span className="text-amber-200">Properties</span>
                </span>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-400">
                  South Africa's premier luxury real estate agency. We specialise in exceptional
                  properties across the country's most desirable locations.
                </p>
              </div>
              <div>
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Contact</p>
                <div className="space-y-2 text-sm text-stone-400">
                  <p>info@hlumisaproperties.co.za</p>
                  <p>+27 (0) 82 555 0001</p>
                  <p>Umhlanga Ridge, Durban</p>
                </div>
              </div>
            </div>
            <div className="mt-10 border-t border-white/5 pt-6">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-center text-xs text-stone-500">
                  &copy; {new Date().getFullYear()} Hlumisa Properties. All rights reserved.
                </p>
                <div className="flex gap-4 text-xs text-stone-500">
                  <Link href="/terms" className="transition hover:text-amber-200">
                    Terms & Conditions
                  </Link>
                  <span className="text-white/10">|</span>
                  <Link href="/privacy" className="transition hover:text-amber-200">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}