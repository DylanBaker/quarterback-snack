import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quarterback Snack — Finding the Sexiest Quarterback",
  description: "Pick the hottest NFL QB in a head-to-head bracket. 32 QBs, 31 picks, one champion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
