import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hlumisa Properties | Referral Commission Landing Page",
  description:
    "Send us property referrals. We contact them, you earn commission. Quick and simple.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}