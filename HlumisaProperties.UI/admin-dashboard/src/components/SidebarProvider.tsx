"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfilePage = pathname === "/admin";
  const isLoginPage = pathname === "/admin/login";
  const hideSidebar = isProfilePage || isLoginPage;

  return (
    <div className="flex min-h-full">
      {!hideSidebar && <Sidebar />}
      <main
        className={`main-bg gpu-layer flex-1 min-h-screen p-8 ${
          !hideSidebar ? "ml-64" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
