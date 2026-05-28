import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentBid Studio",
  description: "Buy-side dashboard for AI bidding agents.",
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
