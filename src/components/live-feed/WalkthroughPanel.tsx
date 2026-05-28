"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { DEMO_SCENARIOS } from "@/lib/simulation/demo-scenarios";
import { FIXTURE_AGENTS } from "@/lib/simulation/fixtures";
import { PREGENERATED_ADS } from "@/lib/simulation/pregenerated-ads";
import { runPolicyChecks } from "@/lib/simulation/policies";
import AdCard from "@/components/live-feed/AdCard";
import type { GeneratedAd, PolicyCheck } from "@/lib/types/agent";

const intentColors: Record<string, string> = {
  thirst: "bg-blue-900/60 text-blue-300 border-blue-700",
  refreshment: "bg-cyan-900/60 text-cyan-300 border-cyan-700",
  summer: "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  "travel-booking": "bg-purple-900/60 text-purple-300 border-purple-700",
  food: "bg-orange-900/60 text-orange-300 border-orange-700",
  fitness: "bg-green-900/60 text-green-300 border-green-700",
  running: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  shopping: "bg-pink-900/60 text-pink-300 border-pink-700",
  "finance-advice": "bg-teal-900/60 text-teal-300 border-teal-700",
  medical: "bg-red-900/60 text-red-300 border-red-700",
  "general-question": "bg-gray-800 text-gray-400 border-gray-600",
};

const actionConfig = {
  bid: { label: "BID", class: "bg-blue-600 text-white" },
  skip: { label: "SKIP", class: "bg-gray-700 text-gray-300" },
  block: { label: "BLOCK", class: "bg-red-700 text-white" },
  review: { label: "REVIEW", class: "bg-amber-600 text-white" },
};

function PolicyChecklist({ checks }: { checks: PolicyCheck[] }) {
  return (
    <div className="mt-2 rounded-md border border-gray-700 bg-gray-800/60 p-2 space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
        Policy checks
      </p>
      {checks.map((check) => (
        <div key={check.ruleId} className="flex items-start gap-1.5">
          {check.passed ? (
            <CheckCircle2 size={12} className="text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle size={12} className="text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-gray-300">{check.ruleName}</span>
            <span className="text-[11px] text-gray-500"> — {check.detail}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WalkthroughPanel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealedDecisions, setRevealedDecisions] = useState(0); // 0, 1, 2
  const [adState, setAdState] = useState<"idle" | "loading" | "done">("idle");
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);

  const scenario = DEMO_SCENARIOS[activeIndex]!;
  const isLastScenario = activeIndex === DEMO_SCENARIOS.length - 1;
  const agentIds = ["nike", "nb"] as const;

  // Derive winner from current scenario
  const winner = (() => {
    const s = scenario;
    for (const agentId of agentIds) {
      const d = s.decisions[agentId];
      if (d.action === "bid" && d.won === true) return agentId;
    }
    return null;
  })();

  // Reset state when scenario changes
  useEffect(() => {
    setRevealedDecisions(0);
    setAdState("idle");
    setGeneratedAd(null);
    setShowOutcome(false);
  }, [activeIndex]);

  // Show outcome badges 1s after both decisions are revealed
  useEffect(() => {
    if (revealedDecisions < 2) return;
    const t = setTimeout(() => setShowOutcome(true), 1000);
    return () => clearTimeout(t);
  }, [revealedDecisions]);

  function generateAd() {
    if (!winner) return;
    const ad = PREGENERATED_ADS[scenario.id];
    if (!ad) return;
    setAdState("loading");
    setTimeout(() => {
      setGeneratedAd(ad);
      setAdState("done");
    }, 2200);
  }

  function jumpTo(index: number) {
    setActiveIndex(index);
  }

  function restart() {
    setActiveIndex(0);
  }

  // Derive button label and action
  let nextLabel: string;
  let nextDisabled = false;
  let nextAction: () => void;

  if (revealedDecisions === 0) {
    nextLabel = "Reveal Nike Bid →";
    nextAction = () => setRevealedDecisions(1);
  } else if (revealedDecisions === 1) {
    nextLabel = "Reveal New Balance Bid →";
    nextAction = () => setRevealedDecisions(2);
  } else if (revealedDecisions === 2 && winner && adState === "idle") {
    nextLabel = "Generate Winning Ad ✦";
    nextAction = generateAd;
  } else if (adState === "loading") {
    nextLabel = "Generating…";
    nextDisabled = true;
    nextAction = () => {};
  } else {
    // adState === "done" or no winner
    if (isLastScenario) {
      nextLabel = "↺ Restart";
      nextAction = restart;
    } else {
      nextLabel = "Next Scenario →";
      nextAction = () => setActiveIndex((i) => i + 1);
    }
  }

  const showRestartButton = revealedDecisions === 2 && (adState === "done" || !winner) && isLastScenario;
  const showNextButton = !showRestartButton;

  return (
    <div className="w-full">
      {/* Scenario pill buttons */}
      <div className="flex gap-2 flex-wrap">
        {DEMO_SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => jumpTo(i)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === activeIndex
                ? "bg-white text-gray-900"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      {/* Scenario card */}
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 mt-4">
        {/* Top row: badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`px-2 py-0.5 text-xs rounded-full border font-medium ${
              intentColors[scenario.opportunity.intent] ??
              "bg-gray-800 text-gray-400 border-gray-600"
            }`}
          >
            {scenario.opportunity.intent}
          </span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400 border border-gray-600">
            {scenario.opportunity.category}
          </span>
          <span className="ml-auto text-xs text-gray-500 font-mono">
            CPC ${scenario.opportunity.suggestedCpc.toFixed(2)}
          </span>
        </div>

        {/* Query */}
        <p className="italic text-gray-300 text-sm mt-2 mb-4 leading-relaxed">
          &ldquo;{scenario.opportunity.query}&rdquo;
        </p>

        {/* Two-column decisions grid */}
        <div className="grid grid-cols-2 gap-4">
          {agentIds.map((agentId, colIndex) => {
            const agent = FIXTURE_AGENTS.find((a) => a.id === agentId);
            const decision =
              scenario.decisions[agentId as keyof typeof scenario.decisions];
            const isVisible = revealedDecisions > colIndex;
            const actionCfg = actionConfig[decision.action];
            const isWinner = winner === agentId;

            // Compute policy checks dynamically from fixture agent + opportunity
            const policyChecks = agent
              ? runPolicyChecks(agent, scenario.opportunity, decision.relevance.score)
              : [];

            return (
              <div
                key={agentId}
                className={`space-y-2 transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                {/* Agent header */}
                {agent && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: agent.brand.color }}
                    />
                    <span className="text-xs font-medium text-gray-300 truncate">
                      {agent.name}
                    </span>
                  </div>
                )}

                {/* Action badge + bid + won/lost */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded ${actionCfg.class}`}
                  >
                    {actionCfg.label}
                  </span>
                  {decision.bidAmount !== undefined && (
                    <span className="text-xs font-mono text-white">
                      ${decision.bidAmount.toFixed(2)}
                    </span>
                  )}
                  {decision.won !== undefined && showOutcome && (
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        decision.won
                          ? "bg-green-900/60 text-green-300"
                          : "bg-red-900/60 text-red-400"
                      }`}
                    >
                      {decision.won ? "WON" : "LOST"}
                    </span>
                  )}
                </div>

                {/* Relevance bar */}
                <div className="space-y-0.5">
                  <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${decision.relevance.score * 100}%`,
                        backgroundColor: agent?.brand.color ?? "#888",
                      }}
                    />
                  </div>
                  <p className="text-gray-500 text-xs">
                    {(decision.relevance.score * 100).toFixed(0)}% relevant
                  </p>
                </div>

                {/* Reason */}
                <p className="text-xs text-gray-400 leading-snug">
                  {decision.reason}
                </p>

                {/* Policy checks */}
                <PolicyChecklist checks={policyChecks} />

                {/* Legacy ad card if decision.ad exists (template/fallback) */}
                {decision.ad && agent && !isWinner && (
                  <div className="mt-2">
                    <AdCard ad={decision.ad} brand={agent.brand} />
                  </div>
                )}

                {/* AI-generated banner — winner column only */}
                {isWinner && adState === "loading" && (
                  <div className="mt-3 rounded-xl overflow-hidden aspect-[16/9] relative bg-gray-900 border border-gray-700">
                    {/* Shimmer sweep */}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    {/* Skeleton blocks */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end gap-2">
                      <div className="h-3 w-2/3 rounded bg-gray-700 animate-pulse" />
                      <div className="h-2 w-full rounded bg-gray-800 animate-pulse" />
                      <div className="h-2 w-4/5 rounded bg-gray-800 animate-pulse" />
                      <div className="h-7 w-28 rounded-lg bg-gray-700 animate-pulse mt-1" />
                    </div>
                    {/* Status label */}
                    <div className="absolute top-3 left-4 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs text-gray-500">Generating ad creative&hellip;</span>
                    </div>
                  </div>
                )}
                {isWinner && adState === "done" && generatedAd && agent && (
                  <div className="mt-3">
                    <AdCard ad={generatedAd} brand={agent.brand} generated={true} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-5">
        <span className="text-xs text-gray-600">
          Scenario {activeIndex + 1} of {DEMO_SCENARIOS.length}
          {revealedDecisions < 2 && (
            <span className="ml-2 text-gray-700">
              &middot; {2 - revealedDecisions} decision{2 - revealedDecisions === 1 ? "" : "s"} remaining
            </span>
          )}
        </span>
        <div className="flex gap-2">
          {showRestartButton ? (
            <button
              onClick={restart}
              className="px-4 py-1.5 rounded-lg bg-gray-700 text-gray-200 text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              ↺ Restart
            </button>
          ) : showNextButton ? (
            <button
              onClick={nextAction}
              disabled={nextDisabled}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                nextDisabled
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-900 hover:bg-gray-200"
              }`}
            >
              {nextLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
