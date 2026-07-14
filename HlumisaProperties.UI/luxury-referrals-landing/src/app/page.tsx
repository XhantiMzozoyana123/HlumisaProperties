"use client";

import { ReferralForm } from "./referral-form";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "Hlumisa Properties | Referral Commission Landing Page";
  }, []);

  return (
    <main className="main-bg gpu-layer min-h-screen px-6 py-10 text-white sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center gap-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-amber-200/80">
              Hlumisa Properties
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
              Refer someone. We handle the rest. You get paid{" "}
              <span className="text-amber-200">commission</span>.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-300 sm:text-xl">
              Fill in your details and the person you are referring. We only need their name,
              phone, and home address so we can contact them about the property.
            </p>
          </div>

          <ReferralForm />
        </div>
      </section>
    </main>
  );
}