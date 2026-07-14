"use client";

import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // The root /admin page is the login/profile page — no auth guard needed
  const isProfilePage = pathname === "/admin";

  if (isProfilePage) {
    return <>{children}</>;
  }

  return <AuthGuard>{children}</AuthGuard>;
}