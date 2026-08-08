"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { getSession } from "@/lib/session";

// Pages accessible by Agent Manager without JWT auth
const BRU_WHITE_PAGES = ["/admin/buyers", "/admin/sellers"];

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [bruWhiteSession, setBruWhiteSession] = useState(false);

  useEffect(() => {
    const session = getSession();
    setBruWhiteSession(session?.role === "bru-white");
  }, []);

  const isBruWhitePage = BRU_WHITE_PAGES.some((p) => pathname.startsWith(p));
  const hasAccess = isAuthenticated || (isBruWhitePage && bruWhiteSession);

  useEffect(() => {
    if (!loading && !hasAccess) {
      router.replace("/admin");
    }
  }, [loading, hasAccess, router]);

  if (loading && !bruWhiteSession) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-amber-200 border-t-transparent" />
          <p className="mt-4 text-sm text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
