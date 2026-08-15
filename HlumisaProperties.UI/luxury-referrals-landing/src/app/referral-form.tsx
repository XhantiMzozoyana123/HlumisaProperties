"use client";

import { FormEvent, useState } from "react";

type PersonForm = {
  fullName: string;
  phoneNumber: string;
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
  subtitle?: string;
  form: PersonForm;
  onChange: (updated: PersonForm) => void;
};

function PersonCard({ title, subtitle, form, onChange }: PersonCardProps) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4 sm:rounded-[1.5rem] sm:p-5">
      <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-stone-400">{subtitle}</p>}

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
      </div>
    </div>
  );
}

export function ReferralForm() {
  const [referrer, setReferrer] = useState<PersonForm>({
    fullName: "",
    phoneNumber: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsDuplicate(false);

    const { firstName: referrerFirstName, lastName: referrerLastName } = splitFullName(referrer.fullName);

    try {
      const response = await fetch(apiUrl("/api/referrals"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerName: `${referrerFirstName} ${referrerLastName}`.trim(),
          referrerPhone: referrer.phoneNumber,
          intent: "sell",
          note: `Referral captured from landing page.`,
          date: new Date().toISOString().split("T")[0],
          isDiscarded: false,
        }),
      });

      if (response.status === 409) {
        // Duplicate referral - show the big reassuring plain English message
        setIsDuplicate(true);
        setReferrer({ fullName: "", phoneNumber: "" });
        return;
      }

      if (!response.ok) {
        // Never show raw API text to users - always show friendly message
        throw new Error("Something went wrong. Please try again.");
      }

      setReferrer({ fullName: "", phoneNumber: "" });
      setSuccessMessage("Thank you! We got your message. We will get back to you in WhatsApp.");
    } catch (error) {
      if (!isDuplicate) {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="backdrop-card rounded-[1.5rem] p-4 shadow-[0_0_40px_rgba(255,255,255,0.2),0_30px_100px_rgba(0,0,0,0.45)] sm:rounded-[2rem] sm:p-6">
      <div className="rounded-[1.25rem] border border-amber-200/15 bg-[linear-gradient(180deg,rgba(255,234,188,0.12),rgba(255,255,255,0.03))] p-4 sm:rounded-[1.5rem] sm:p-5">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Fill in your details
        </h2>

        <form className="mt-5 space-y-5 sm:mt-6 sm:space-y-6" onSubmit={handleSubmit}>
          <PersonCard
            title="Your details"
            subtitle="So we know who to pay."
            form={referrer}
            onChange={setReferrer}
          />

          <button
            className="w-full rounded-full bg-amber-200 px-6 py-3.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
            disabled={saving}
            type="submit"
          >
            {saving ? "Sending..." : "Send my referral"}
          </button>
        </form>

        <p className="mt-4 text-sm text-stone-300">
          We will WhatsApp you. Our team will message you as soon as possible.
        </p>

        {/* DUPLICATE MESSAGE - Big, prominent, plain English, same size as "Fill in your details" */}
        {isDuplicate && (
          <div className="mt-6 rounded-2xl border-2 border-emerald-300/40 bg-emerald-500/10 p-6 text-center shadow-[0_0_50px_rgba(52,211,153,0.25)] sm:p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/20 sm:h-20 sm:w-20">
              <svg className="h-8 w-8 text-emerald-300 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
              Thank you! We have already got you in our system.
            </h3>
            <p className="mt-4 text-lg font-medium text-emerald-100 sm:text-xl">
              We will WhatsApp you as soon as possible.
            </p>
            <p className="mt-3 text-lg font-medium text-emerald-100 sm:text-xl">
              Don't panic, please. We will get back to you.
            </p>
          </div>
        )}

        {/* SUCCESS MESSAGE - Big, nice, its own table box */}
        {successMessage && (
          <div className="mt-6 rounded-2xl border-2 border-amber-200/40 bg-amber-400/10 p-6 text-center shadow-[0_0_50px_rgba(253,230,138,0.25)] sm:p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-300/20 sm:h-20 sm:w-20">
              <svg className="h-8 w-8 text-amber-200 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold leading-tight text-amber-100 sm:text-3xl">
              Thank you! We got your message.
            </h3>
            <p className="mt-3 text-lg font-medium text-amber-100 sm:text-xl">
              We will get back to you in WhatsApp.
            </p>
            <p className="mt-4 text-base leading-relaxed text-amber-100/90 sm:text-lg">
              We will get back to you as soon as possible. Don't panic.
            </p>
          </div>
        )}

        {errorMessage && <p className="mt-4 text-sm text-rose-200">{errorMessage}</p>}
      </div>
    </div>
  );
}