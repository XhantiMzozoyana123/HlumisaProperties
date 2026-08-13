"use client";

import { ReferralForm } from "./referral-form";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "Hlumisa Properties | Referral Commission Landing Page";
  }, []);

  return (
    <main className="main-bg gpu-layer min-h-screen px-4 py-8 text-white sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center gap-8 sm:gap-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <div className="space-y-4 sm:space-y-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/80 sm:text-xs sm:tracking-[0.5em]">
              Hlumisa Properties
            </p>
            <h1 className="max-w-3xl text-[2rem] font-bold leading-[1.1] tracking-[-0.02em] drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] sm:text-5xl sm:leading-[0.98] sm:tracking-[-0.05em] sm:drop-shadow-[0_0_35px_rgba(255,255,255,0.35)] lg:text-6xl xl:text-7xl">
              Refer someone. We handle the rest. You get paid{" "}
              <span className="text-amber-200 drop-shadow-[0_0_15px_rgba(253,230,138,0.5)]">commission</span>.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-300 sm:text-lg sm:leading-8 lg:text-xl">
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