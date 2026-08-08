"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";

export default function RequireZola({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session?.role === "bru-white") {
      router.replace("/admin/buyers");
    } else {
      setAllowed(true);
    }
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-sm text-stone-400">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}