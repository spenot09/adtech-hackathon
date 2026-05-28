import LiveFeedPanel from "@/components/live-feed/LiveFeedPanel";

export const metadata = {
  title: "AgentBid Studio — Live Bidding (Phase 2 demo)",
};

export default function LiveDemoPage() {
  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          AgentBid Studio — Live Bidding
          <span className="ml-3 text-sm font-normal text-gray-500 align-middle">
            Phase 2 demo
          </span>
        </h1>
        <p className="text-gray-400 text-sm">
          Two agents, one opportunity stream — watch Coke and Stride compete in
          real time.
        </p>
      </div>
      <LiveFeedPanel />
    </main>
  );
}
