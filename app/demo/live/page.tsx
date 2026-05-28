import WalkthroughPanel from "@/components/live-feed/WalkthroughPanel";

export const metadata = {
  title: "AgentBid Studio — Live Bidding Demo",
};

export default function LiveDemoPage() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          AgentBid Studio — Live Bidding Demo
        </h1>
        <p className="text-gray-400 text-sm">
          Nike and New Balance compete across three live scenarios.
        </p>
      </div>
      <WalkthroughPanel />
    </main>
  );
}
