"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/admin/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="backdrop-card w-full max-w-md rounded-[2rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-200 text-xl font-bold text-stone-950">
            HP
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-white">Admin sign in</h1>
          <p className="mt-2 text-sm text-stone-400">Sign in to manage Hlumisa Properties</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <button
            className="w-full rounded-full bg-amber-200 px-6 py-4 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
            type="submit"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
