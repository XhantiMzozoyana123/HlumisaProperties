"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfilePage = pathname === "/admin";

  return (
    <div className="flex min-h-full">
      {!isProfilePage && <Sidebar />}
      <main
        className={`flex-1 min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,214,153,0.18),transparent_24%),linear-gradient(180deg,#12100e_0%,#070707_48%,#050505_100%)] p-8 ${
          !isProfilePage ? "ml-64" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}