"use client";

import "./globals.css";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    document.title = "Hlumisa Properties | Referral Commission Landing Page";
  }, []);

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta
          name="description"
          content="Send us property referrals. We contact them, you earn commission. Quick and simple."
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}