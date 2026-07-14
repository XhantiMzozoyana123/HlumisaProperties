"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarProvider from "@/components/SidebarProvider";
import { AuthProvider } from "@/lib/AuthContext";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    document.title = "Hlumisa Properties — Admin Dashboard";
  }, []);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="description"
          content="Admin dashboard for managing property listings, leads, and referrals."
        />
      </head>
      <body className="min-h-full">
        <AuthProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}