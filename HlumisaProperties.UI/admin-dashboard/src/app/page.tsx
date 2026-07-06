"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#12100e]">
      <p className="text-stone-400 text-sm">Loading...</p>
    </div>
  );
}