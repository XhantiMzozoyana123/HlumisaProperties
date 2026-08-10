"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfilePicture } from "@/lib/localData";
import { setSession } from "@/lib/session";
import { useAuth } from "@/lib/AuthContext";
import { getStoredUser, fetchPublicProfilePicture } from "@/lib/auth";

const profiles = [
  {
    id: "zola",
    name: "Zola",
    initials: "ZM",
    color: "bg-amber-200",
    textColor: "text-stone-950",
    requiresAuth: true,
  },
  {
    id: "bru-white",
    name: "Agent Manager",
    initials: "AM",
    color: "bg-sky-400",
    textColor: "text-stone-950",
    requiresAuth: false,
  },
];

export default function ProfileSelectionPage() {
  const router = useRouter();
  const { isAuthenticated, login, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    // First try from API-backed stored user
    const storedUser = getStoredUser();
    if (storedUser?.profilePictureBase64) {
      setProfilePic(storedUser.profilePictureBase64);
      return;
    }

    const pic = getProfilePicture();
    if (pic?.dataUrl) {
      setProfilePic(pic.dataUrl);
      return;
    }

    // Fetch from the public API so the profile picture shows even in a new browser
    fetchPublicProfilePicture()
      .then((data) => {
        if (data.profilePictureBase64) {
          setProfilePic(data.profilePictureBase64);
        }
      })
      .catch(() => {
        // Silently fail - just show default initials
      });
  }, []);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  function handleProfileClick(profile: (typeof profiles)[0]) {
    if (profile.requiresAuth) {
      setShowAuth(true);
      setEmail("");
      setPassword("");
      setAuthError("");
    } else {
      // Agent Manager - no password, direct access to Buyers & Sellers
      setSession({ role: "bru-white", name: "Agent Manager" });
      router.push("/admin/buyers");
    }
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    setLoginLoading(true);
    setAuthError("");

    try {
      await login({ email, password });
      setSession({ role: "zola", name: "Zola", email });
      setShowAuth(false);
      router.push("/admin/dashboard");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoginLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
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
        <h1 className="text-4xl font-bold text-white">Who's using Hlumisa Properties?</h1>
        <p className="mt-2 text-base text-stone-400">Select a profile to access the admin dashboard.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleProfileClick(profile)}
            className="group flex flex-col items-center gap-3 transition-all cursor-pointer hover:scale-105"
          >
            <div
              className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-full text-3xl font-bold shadow-lg transition-all ${profile.color} ${profile.textColor} group-hover:ring-4 group-hover:ring-white/30`}
            >
              {profilePic && profile.id === "zola" ? (
                <img src={profilePic} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                profile.initials
              )}
            </div>
            <span className="text-base font-medium text-stone-300 group-hover:text-white transition-colors">
              {profile.name}
            </span>
            {profile.requiresAuth && (
              <span className="text-xs text-stone-500">Password required</span>
            )}
          </button>
        ))}
      </div>

      {/* Auth modal for Zola */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#12100e] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-200 text-xl font-bold text-stone-950">
                ZM
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">Zola</h2>
              <p className="mt-1 text-sm text-stone-400">Enter credentials to continue</p>
            </div>

            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {authError && (
                <p className="text-sm text-rose-400">{authError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100 disabled:opacity-60"
              >
                {loginLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <button
              onClick={() => setShowAuth(false)}
              className="mt-4 w-full text-center text-sm text-stone-500 transition hover:text-stone-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}