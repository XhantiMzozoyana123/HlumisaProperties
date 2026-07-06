"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfilePicture } from "@/lib/localData";

const profiles = [
  {
    id: "zola",
    name: "Zola Mzozoyana",
    initials: "ZM",
    color: "bg-amber-200",
    textColor: "text-stone-950",
    fullAccess: true,
  },
  {
    id: "thandi",
    name: "Thandi Mokoena",
    initials: "TM",
    color: "bg-emerald-400",
    textColor: "text-stone-950",
    fullAccess: false,
  },
  {
    id: "sipho",
    name: "Sipho Khumalo",
    initials: "SK",
    color: "bg-sky-400",
    textColor: "text-stone-950",
    fullAccess: false,
  },
];

const ADMIN_USERNAME = "ZolaMzozoyana1970";
const ADMIN_PASSWORD = "Mzozoyana1970";

export default function ProfileSelectionPage() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const pic = getProfilePicture();
    if (pic?.dataUrl) setProfilePic(pic.dataUrl);
  }, []);

  function handleProfileClick(profile: (typeof profiles)[0]) {
    if (!profile.fullAccess) return;
    setShowAuth(true);
    setUsername("");
    setPassword("");
    setAuthError("");
  }

  function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username !== ADMIN_USERNAME) {
      setAuthError("Username is incorrect.");
    } else if (password !== ADMIN_PASSWORD) {
      setAuthError("Password is incorrect.");
    } else {
      setShowAuth(false);
      router.push("/admin/dashboard");
    }
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
            disabled={!profile.fullAccess}
            className={`group flex flex-col items-center gap-3 transition-all ${
              profile.fullAccess
                ? "cursor-pointer hover:scale-105"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            <div
              className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-full text-3xl font-bold shadow-lg transition-all ${
                profile.color
              } ${profile.textColor} ${
                profile.fullAccess
                  ? "group-hover:ring-4 group-hover:ring-white/30"
                  : ""
              }`}
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
            {!profile.fullAccess && (
              <span className="text-xs text-stone-500">Restricted</span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push("/admin/login")}
        className="rounded-full border border-white/10 px-8 py-3 text-sm text-stone-300 transition hover:border-white/20 hover:text-white"
      >
        Sign in with email
      </button>

      {/* Auth modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#12100e] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-200 text-xl font-bold text-stone-950">
                ZM
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">Zola Mzozoyana</h2>
              <p className="mt-1 text-sm text-stone-400">Enter credentials to continue</p>
            </div>

            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
                placeholder="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                className="w-full rounded-full bg-amber-200 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
              >
                Sign in
              </button>
            </form>

            <button
              onClick={() => setShowAuth(false)}
              className="mt-4 w-full text-center text-sm text-stone-500 transition hover:text-stone-300"
            >
              Cancel
            </button>
            <button
              onClick={() => router.push("/admin/login")}
              className="mt-2 w-full text-center text-sm text-amber-300/70 transition hover:text-amber-200"
            >
              Reset password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}