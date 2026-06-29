"use client";

import { FormEvent, useEffect, useState } from "react";

type LeadFormState = {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
};

type PropertyListing = {
  id: number;
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sizeInSqm: number;
  isAvailable: boolean;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.hlumisaproperties.online").replace(/\/$/, "");

function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

function splitFullName(fullName: string) {
  const trimmed = fullName.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(" ");
  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ");

  return { firstName, lastName };
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatArea(sizeInSqm: number) {
  return new Intl.NumberFormat("en-ZA", {
    maximumFractionDigits: 0,
  }).format(sizeInSqm);
}

export default function Home() {
  const [leadForm, setLeadForm] = useState<LeadFormState>({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
  });
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProperties() {
      try {
        setPropertiesLoading(true);
        setPropertiesError(null);

        const response = await fetch(apiUrl("/api/property-listings"), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load property listings (${response.status})`);
        }

        const data = (await response.json()) as PropertyListing[];

        if (!active) {
          return;
        }

        const sorted = [...data].sort((left, right) => {
          if (left.isAvailable === right.isAvailable) {
            return right.id - left.id;
          }

          return left.isAvailable ? -1 : 1;
        });

        setProperties(sorted);
      } catch (error) {
        if (active) {
          setPropertiesError(error instanceof Error ? error.message : "Unable to load listings.");
        }
      } finally {
        if (active) {
          setPropertiesLoading(false);
        }
      }
    }

    void loadProperties();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const { firstName, lastName } = splitFullName(leadForm.fullName);

    try {
      const response = await fetch(apiUrl("/api/leads"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          FirstName: firstName,
          LastName: lastName,
          EmailAddress: leadForm.emailAddress,
          PhoneNumber: leadForm.phoneNumber,
          Location: "",
          JsonCommunicationThread: JSON.stringify([
            {
              source: "referral-capture",
              note: "Referral commission lead captured from landing page",
              submittedAt: new Date().toISOString(),
            },
          ]),
          LeadType: "Refferal",
          IsContacted: false,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `Failed to submit referral (${response.status})`);
      }

      setLeadForm({
        fullName: "",
        emailAddress: "",
        phoneNumber: "",
      });
      setSuccessMessage("Referral saved. We will contact them about the house and your commission will be handled.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to submit referral.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,214,153,0.18),transparent_24%),linear-gradient(180deg,#12100e_0%,#070707_48%,#050505_100%)] px-6 py-10 text-white sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center gap-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-amber-200/80">Hlumisa Properties</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Send us the referral. We will contact them. You get paid <span className="text-amber-200">commission</span>.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-300 sm:text-xl">
              Keep it simple. We only need the person’s full name, email, and phone number so we can contact them about the house they want to buy or sell.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-stone-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Simple form</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Fast contact</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">API connected</span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-amber-200/15 bg-[linear-gradient(180deg,rgba(255,234,188,0.12),rgba(255,255,255,0.03))] p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-amber-100/80">Referral capture</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Send us the referral</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">Just the contact details we need to call them back and talk about the house.</p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
                  placeholder="Full name"
                  value={leadForm.fullName}
                  onChange={(event) => setLeadForm((current) => ({ ...current, fullName: event.target.value }))}
                  required
                />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
                  placeholder="Email address"
                  type="email"
                  value={leadForm.emailAddress}
                  onChange={(event) => setLeadForm((current) => ({ ...current, emailAddress: event.target.value }))}
                  required
                />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
                  placeholder="Phone number"
                  value={leadForm.phoneNumber}
                  onChange={(event) => setLeadForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                  required
                />
                <button
                  className="w-full rounded-full bg-amber-200 px-6 py-4 text-sm font-semibold text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? "Submitting to API..." : "Send referral details"}
                </button>
              </form>

              {successMessage && <p className="mt-4 text-sm text-emerald-200">{successMessage}</p>}
              {errorMessage && <p className="mt-4 text-sm text-rose-200">{errorMessage}</p>}
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <p className="text-sm font-semibold text-white">Only the basics</p>
            <p className="mt-2 text-sm leading-6 text-stone-300">Full name, email, and phone number only.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <p className="text-sm font-semibold text-white">Commission paid</p>
            <p className="mt-2 text-sm leading-6 text-stone-300">We track the referral and pay your commission.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <p className="text-sm font-semibold text-white">Sent to the API</p>
            <p className="mt-2 text-sm leading-6 text-stone-300">The form goes straight to the backend lead endpoint.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">Live property listings</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Current homes from the API</h2>
          <p className="mt-2 text-sm leading-6 text-stone-300">These are real listings pulled from your backend. No dummy cards.</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {propertiesLoading && (
              <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-stone-300">
                Loading property listings...
              </div>
            )}

            {!propertiesLoading && propertiesError && (
              <div className="lg:col-span-3 rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                {propertiesError}
              </div>
            )}

            {!propertiesLoading && !propertiesError && properties.length === 0 && (
              <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-stone-300">
                No property listings were returned by the API.
              </div>
            )}

            {!propertiesLoading && !propertiesError &&
              properties.slice(0, 6).map((property) => (
                <article key={property.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-400">{property.propertyType}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{property.title}</h3>
                      <p className="mt-1 text-sm text-stone-300">{property.location}</p>
                    </div>
                    <p className="text-sm font-semibold text-amber-200">{formatMoney(property.price)}</p>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-stone-300">{property.description}</p>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.28em] text-stone-300">
                    <span className="rounded-full border border-white/10 px-3 py-2">{property.bedrooms} beds</span>
                    <span className="rounded-full border border-white/10 px-3 py-2">{property.bathrooms} baths</span>
                    <span className="rounded-full border border-white/10 px-3 py-2">{formatArea(property.sizeInSqm)} m²</span>
                    <span className="rounded-full border border-white/10 px-3 py-2">{property.isAvailable ? "Available" : "Sold / under offer"}</span>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
