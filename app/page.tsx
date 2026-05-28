import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">AgentBid Studio</h1>
      <p className="text-gray-400 mb-8 text-center max-w-xl">
        Buy-side dashboard for brands to create AI bidding agents that compete
        for conversational ad inventory in LLM channels.
      </p>
      <Link
        href="/demo/live"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
      >
        Launch Live Bidding Demo
      </Link>
    </main>
  );
}
