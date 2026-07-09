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

export default function ProfileSelectionPage() {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const pic = getProfilePicture();
    if (pic?.dataUrl) setProfilePic(pic.dataUrl);
  }, []);

  function handleProfileClick(profile: (typeof profiles)[0]) {
    if (!profile.fullAccess) return;
    router.push("/admin/dashboard");
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
        onClick={() => router.push("/admin/dashboard")}
        className="rounded-full border border-white/10 px-8 py-3 text-sm text-stone-300 transition hover:border-white/20 hover:text-white"
      >
        Continue to dashboard
      </button>
    </div>
  );
}