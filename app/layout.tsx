import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentBid Studio",
  description:
    "Buy-side dashboard for brands to create AI bidding agents that compete for conversational ad inventory.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
