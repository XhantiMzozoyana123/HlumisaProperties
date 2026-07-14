"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function ProfileSelectionPage() {
  const router = useRouter();
  const { isAuthenticated, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  async function handleLogin() {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoginLoading(true);
    setError(null);

    try {
      await login({ email, password });
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoginLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-amber-200 border-t-transparent" />
          <p className="mt-4 text-sm text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] space-y-10">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-200 text-2xl font-bold text-stone-950 mb-4">
          HP
        </div>
        <h1 className="text-4xl font-bold text-white">Hlumisa Properties</h1>
        <p className="mt-2 text-base text-stone-400">Admin sign in to manage the dashboard.</p>
      </div>

      <div className="backdrop-card w-full max-w-md rounded-[2rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div>
            <label className="block text-sm text-stone-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/50"
            />
          </div>
          <div>
            <label className="block text-sm text-stone-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              required
              className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 focus:border-amber-200/50"
            />
          </div>
          <button
            type="submit"
            disabled={loginLoading || !email || !password}
            className="w-full rounded-full bg-amber-200 px-6 py-4 text-sm font-semibold text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {error && <p className="mt-3 text-center text-sm text-rose-300">{error}</p>}
      </div>

    </div>
  );
}