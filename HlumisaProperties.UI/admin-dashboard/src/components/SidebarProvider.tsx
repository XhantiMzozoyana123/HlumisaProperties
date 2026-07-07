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
        className={`main-bg gpu-layer flex-1 min-h-screen p-8 ${
          !isProfilePage ? "ml-64" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}