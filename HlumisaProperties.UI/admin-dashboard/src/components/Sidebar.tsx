"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfilePicture } from "@/lib/localData";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "◉" },
  { label: "Referrals", href: "/admin/referrals", icon: "◎" },
  { label: "Properties", href: "/admin/properties", icon: "◆" },
  { label: "Books", href: "/admin/books", icon: "📓" },
  { label: "Books Understanding", href: "/admin/books/understanding", icon: "📖" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const pic = getProfilePicture();
    if (pic) setProfilePic(pic.dataUrl);
  }, []);

  return (
    <aside className="sidebar-bg gpu-layer fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-white/10">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className="h-10 w-10 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-sm font-bold text-stone-950">
            HP
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-white">Hlumisa Properties</p>
          <p className="text-xs text-stone-400">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-amber-200/10 text-amber-200 font-semibold"
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 space-y-1">
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-400 transition hover:text-white hover:bg-white/5"
        >
          <span className="text-lg">⚙</span>
          Settings
        </Link>
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-400 transition hover:text-white hover:bg-white/5"
        >
          <span className="text-lg">◀</span>
          Back to profile
        </Link>
        {user && (
          <p className="px-4 pt-2 text-xs text-stone-500">
            Signed in as {user.firstName ?? user.email}
          </p>
        )}
        <button
          onClick={() => { logout(); router.push("/admin"); }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-500 transition hover:text-white hover:bg-white/5"
        >
          <span className="text-lg">✕</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
