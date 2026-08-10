"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getProfilePicture } from "@/lib/localData";
import { getSession, clearSession } from "@/lib/session";
import { useAuth } from "@/lib/AuthContext";
import { getStoredUser, fetchPublicProfilePicture } from "@/lib/auth";

const fullNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "◉" },
  { label: "Referrals", href: "/admin/referrals", icon: "◎" },
  { label: "Properties", href: "/admin/properties", icon: "◆" },
  { label: "Books", href: "/admin/books", icon: "📓" },
  { label: "Books Understanding", href: "/admin/books/understanding", icon: "📖" },
];

const bruWhiteNavItems = [
  { label: "Buyers", href: "/admin/buyers", icon: "◉" },
  { label: "Sellers", href: "/admin/sellers", icon: "◎" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBruWhite, setIsBruWhite] = useState(false);

  useEffect(() => {
    // First try from API-backed stored user
    const storedUser = getStoredUser();
    if (storedUser?.profilePictureBase64) {
      setProfilePic(storedUser.profilePictureBase64);
    }

    const pic = getProfilePicture();
    if (pic?.dataUrl && !storedUser?.profilePictureBase64) {
      setProfilePic(pic.dataUrl);
    }

    // If no local profile picture, fetch from the public API
    if (!storedUser?.profilePictureBase64 && !pic?.dataUrl) {
      fetchPublicProfilePicture()
        .then((data) => {
          if (data.profilePictureBase64) {
            setProfilePic(data.profilePictureBase64);
          }
        })
        .catch(() => {
          // Silently fail - just show default initials
        });
    }

    setIsBruWhite(getSession()?.role === "bru-white");
  }, []);

  // Re-sync when user changes (after login or profile picture upload)
  useEffect(() => {
    if (user?.profilePictureBase64) {
      setProfilePic(user.profilePictureBase64);
    }
  }, [user]);

  // Close drawer when navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navItems = isBruWhite ? bruWhiteNavItems : fullNavItems;
  const profileName = isBruWhite ? "Agent Manager" : user?.firstName ?? "Zola";
  const profileRole = isBruWhite ? "Manager" : "Admin Dashboard";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
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
            <p className="text-xs text-stone-400">{profileName} &middot; {profileRole}</p>
          </div>
        </div>
        <button
          onClick={() => setMenuOpen(false)}
          className="text-stone-400 hover:text-white md:hidden"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
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

      <div className="space-y-1 border-t border-white/10 px-6 py-4">
        {!isBruWhite && (
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-400 transition hover:text-white hover:bg-white/5"
          >
            <span className="text-lg">⚙</span>
            Settings
          </Link>
        )}
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-400 transition hover:text-white hover:bg-white/5"
        >
          <span className="text-lg">◀</span>
          Back to profile
        </Link>
        <button
          onClick={() => {
            clearSession();
            logout();
            router.push("/admin");
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-500 transition hover:text-white hover:bg-white/5"
        >
          <span className="text-lg">↩</span>
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar-bg gpu-layer fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-white/10 md:block">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#1d2736] px-4 py-3 md:hidden">
        <p className="text-sm font-semibold text-white">Hlumisa Admin</p>
        <button
          onClick={() => setMenuOpen(true)}
          className="text-stone-300 hover:text-white"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="sidebar-bg absolute left-0 top-0 h-full w-64 border-r border-white/10 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Spacer for mobile top bar */}
      <div className="h-16 md:hidden" />
    </>
  );
}