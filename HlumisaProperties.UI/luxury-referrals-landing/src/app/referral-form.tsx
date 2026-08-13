"use client";

import { FormEvent, useState } from "react";

type PersonForm = {
  fullName: string;
  phoneNumber: string;
  address: string;
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

type PersonCardProps = {
  title: string;
  form: PersonForm;
  onChange: (updated: PersonForm) => void;
};

function PersonCard({ title, form, onChange }: PersonCardProps) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4 sm:rounded-[1.5rem] sm:p-5">
      <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>

      <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
        <input
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/30 sm:rounded-2xl sm:px-4"
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => onChange({ ...form, fullName: e.target.value })}
          required
        />
        <input
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/30 sm:rounded-2xl sm:px-4"
          placeholder="Phone number"
          type="tel"
          inputMode="tel"
          value={form.phoneNumber}
          onChange={(e) => onChange({ ...form, phoneNumber: e.target.value })}
          required
        />
        <textarea
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/30 resize-none sm:rounded-2xl sm:px-4"
          placeholder="Home Address"
          rows={2}
          value={form.address}
          onChange={(e) => onChange({ ...form, address: e.target.value })}
          required
        />
      </div>
    </div>
  );
}

export function ReferralForm() {
  const [referrer, setReferrer] = useState<PersonForm>({
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [referral, setReferral] = useState<PersonForm>({
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const { firstName: refFirstName, lastName: refLastName } = splitFullName(referral.fullName);
    const { firstName: referrerFirstName, lastName: referrerLastName } = splitFullName(referrer.fullName);

    try {
      const response = await fetch(apiUrl("/api/referrals"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerName: `${referrerFirstName} ${referrerLastName}`.trim(),
          referrerPhone: referrer.phoneNumber,
          referrerAddress: referrer.address,
          referredName: `${refFirstName} ${refLastName}`.trim(),
          referredPhone: referral.phoneNumber,
          referredAddress: referral.address,
          intent: "buy",
          note: `Referral captured from landing page.`,
          date: new Date().toISOString().split("T")[0],
          isDiscarded: false,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `Failed to submit referral (${response.status})`);
      }

      setReferrer({ fullName: "", phoneNumber: "", address: "" });
      setReferral({ fullName: "", phoneNumber: "", address: "" });
      setSuccessMessage("Referral saved. We will contact them about the house and your commission will be handled.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to submit referral.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="backdrop-card rounded-[1.5rem] p-4 shadow-[0_0_40px_rgba(255,255,255,0.2),0_30px_100px_rgba(0,0,0,0.45)] sm:rounded-[2rem] sm:p-6">
      <div className="rounded-[1.25rem] border border-amber-200/15 bg-[linear-gradient(180deg,rgba(255,234,188,0.12),rgba(255,255,255,0.03))] p-4 sm:rounded-[1.5rem] sm:p-5">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Start by filling in
        </h2>

        <form className="mt-5 space-y-5 sm:mt-6 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
            <PersonCard
              title="Your details"
              form={referrer}
              onChange={setReferrer}
            />
            <PersonCard
              title="Their details"
              form={referral}
              onChange={setReferral}
            />
          </div>

          <button
            className="w-full rounded-full bg-amber-200 px-6 py-3.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
            disabled={saving}
            type="submit"
          >
            {saving ? "Submitting to API..." : "Submit referral"}
          </button>
        </form>

        {successMessage && <p className="mt-4 text-sm text-emerald-200">{successMessage}</p>}
        {errorMessage && <p className="mt-4 text-sm text-rose-200">{errorMessage}</p>}
      </div>
    </div>
  );
}