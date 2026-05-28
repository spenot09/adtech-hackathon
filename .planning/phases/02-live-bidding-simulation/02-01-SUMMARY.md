---
phase: 02-live-bidding-simulation
plan: "01"
subsystem: simulation-engine
tags:
  - next.js
  - tailwind
  - simulation
  - bidding
  - react
dependency_graph:
  requires: []
  provides:
    - lib/types/agent.ts (shared Agent/Brand/Ad/ImageStyle/RelevanceScore/Opportunity/Decision types)
    - lib/simulation/ (full simulation engine)
    - components/live-feed/ (self-contained live feed panel)
    - app/demo/live (standalone demo route)
  affects:
    - Phase 1 imports lib/types/agent.ts
    - Phase 1 mounts LiveFeedPanel in main dashboard
tech_stack:
  added:
    - next@14.2.29
    - react@18
    - react-dom@18
    - typescript@5
    - tailwindcss@3
    - postcss
    - autoprefixer
  patterns:
    - useSyncExternalStore for pub/sub store
    - recursive setTimeout for simulation loop
    - module-level singleton store
    - deterministic template-based ad picker
key_files:
  created:
    - package.json
    - tsconfig.json
    - next.config.js
    - tailwind.config.ts
    - postcss.config.js
    - app/layout.tsx
    - app/globals.css
    - app/page.tsx
    - lib/types/agent.ts
    - lib/simulation/fixtures.ts
    - lib/simulation/opportunities.ts
    - lib/simulation/relevance.ts
    - lib/simulation/decide.ts
    - lib/simulation/ad-templates.ts
    - lib/simulation/engine.ts
    - lib/simulation/store.ts
    - components/live-feed/AgentRunnerBar.tsx
    - components/live-feed/AdCard.tsx
    - components/live-feed/OpportunityCard.tsx
    - components/live-feed/LiveFeedPanel.tsx
    - app/demo/live/page.tsx
  modified:
    - .gitignore (added Next.js/node_modules patterns)
decisions:
  - Next.js 14 chosen (Node 18 constraint — 15+ requires Node 20)
  - Module-level singleton store pattern for zero-dependency in-memory pub/sub
  - useSyncExternalStore for React 18 concurrent-safe store subscription
  - 75% win rate in engine to produce frequent visible wins for demo impact
  - Recursive setTimeout instead of setInterval for variable tick intervals
metrics:
  duration_seconds: 342
  completed_date: "2026-05-28"
  tasks_completed: 3
  files_created: 21
---

# Phase 02 Plan 01: Live Bidding Simulation Summary

Multi-agent live bidding simulation with Next.js 14, deterministic relevance scoring, rule-based decision engine, curated (brand x intent) ad templates, and brand-styled HTML ad cards — all visible at `/demo/live` with no external APIs or DB.

## What Was Built

### Task 1: Scaffold + Shared Types + Fixtures + Opportunities (commit 05d3113)

- Next.js 14 App Router project with TypeScript and Tailwind CSS scaffolded manually (create-next-app requires interactive mode with Node 18).
- `lib/types/agent.ts` — full shared type surface for Phase 1 consumption (see type signatures below).
- `lib/simulation/fixtures.ts` — `FIXTURE_AGENTS` (Coke + Stride) with all required fields + `cloneFixtureAgents()`.
- `lib/simulation/opportunities.ts` — 15 `OPPORTUNITY_TEMPLATES` with the prescribed distribution (3 Coke-favored, 4 Stride-favored, 1 shared travel, 2 blocked categories, 2 general skips, plus fitness gifts and general shopping), plus `sampleOpportunity()`.

### Task 2: Simulation Engine, Relevance, Decisions, Ad Templates, Store (commit 7bf390b)

- `lib/simulation/relevance.ts` — `scoreRelevance()`: keyword intersection × intent weight × 2 boost, clamped to [0,1].
- `lib/simulation/decide.ts` — `decide()`: 6 ordered rules (block → CPC ceiling → budget cap → low relevance → review escalation → bid with relevance-weighted amount).
- `lib/simulation/ad-templates.ts` — `AD_TEMPLATES` covering 5 Coke intents + 4 Stride intents, `pickAd()` with brand-derived fallback.
- `lib/simulation/engine.ts` — `runSimulation()` / `startEngine()` / `stopEngine()`: recursive setTimeout 800–1800ms, 75% win rate, attaches Ad synchronously on win.
- `lib/simulation/store.ts` — Module-level singleton, `useSyncExternalStore`-backed `useSimulation()` hook.

### Task 3: UI Components + Demo Route (commit 6eea348)

- `components/live-feed/AgentRunnerBar.tsx` — per-agent spend bar with brand color fill, status badge (gray/green-pulse/red).
- `components/live-feed/AdCard.tsx` — brand-styled HTML/CSS ad card: gradient background, accent shape (circle/diamond/wave/burst), motion hints (animate-pulse/animate-float/animate-shimmer), brand wordmark, headline/body/CTA.
- `components/live-feed/OpportunityCard.tsx` — full-width card with timestamp, intent badge, category tag, query, two-column decision strips with relevance bars, won/lost pills, inline AdCard on win.
- `components/live-feed/LiveFeedPanel.tsx` — Start All / Stop All / Reset controls wired to `startEngine`/`stopEngine`/`simulationStore.reset`, per-agent runner bars, scrollable newest-first feed.
- `app/demo/live/page.tsx` — standalone demo route.

## Shared Type Signatures (for Phase 1)

```typescript
// lib/types/agent.ts
export type AutonomyMode = "manual" | "assisted" | "autonomous";
export type Intent = "thirst" | "refreshment" | "summer" | "travel-booking" | "food" | "fitness" | "running" | "shopping" | "finance-advice" | "medical" | "general-question";

export type Brand = { name: string; color: string; voice: string; designGuidelines: string; keywords: string[] };
export type Agent = { id: string; name: string; brand: Brand; goal: string; dailyBudgetCap: number; maxCpc: number; autonomyMode: AutonomyMode; targetIntents: Intent[]; blockedCategories: string[]; status: "paused" | "active" | "stopped"; spend: number };
export type Opportunity = { id: string; timestamp: number; query: string; intent: Intent; category: string; suggestedCpc: number };
export type RelevanceScore = { matchedKeywords: string[]; intentMatched: boolean; score: number };
export type ImageStyle = { background: string; iconEmoji: string; accentShape: "circle" | "diamond" | "wave" | "burst"; motionHint?: "pulse" | "float" | "shimmer" };
export type Ad = { headline: string; body: string; cta: string; imageStyle: ImageStyle; source: "template" | "fallback" };
export type Decision = { agentId: string; opportunityId: string; action: "bid" | "skip" | "block" | "review"; bidAmount?: number; reason: string; relevance: RelevanceScore; won?: boolean; ad?: Ad };
```

## Ad Template Coverage

| Agent | Intent         | Template |
|-------|----------------|----------|
| coke  | thirst         | "Ice-cold Coke. Right now." (burst + pulse) |
| coke  | refreshment    | "Refreshment, uncapped." (circle + shimmer) |
| coke  | summer         | "Tastes like summer." (wave + float) |
| coke  | travel-booking | "Wherever you're headed." (diamond) |
| coke  | food           | "Better with Coke." (burst) |
| stride | fitness       | "Built for the next mile." (diamond + pulse) |
| stride | running       | "Run further. Recover faster." (wave + float) |
| stride | shopping      | "Athletic, all-day." (circle) |
| stride | travel-booking | "Pack lighter. Walk further." (diamond) |

All 9 target-intent × brand combos covered with curated templates. Any non-covered intent falls back to a brand-derived ad with `source: "fallback"`.

## Demo Route

**URL:** `http://localhost:3000/demo/live`

Walkthrough:
1. Page loads — both agents shown as Paused at $0/$500.
2. Press **Start All** — both flip to Active (green pulse).
3. Within ~2s, first opportunity card appears with two decision columns.
4. Coke bids on thirst/refreshment/summer; Stride skips with "Low relevance" reason.
5. Stride bids on running/fitness; Coke skips with "Low relevance" reason.
6. Medical/gambling categories: both agents BLOCK.
7. Wins render HTML AdCards with brand gradients, emojis, and animated accents.
8. Spend bars climb in real time (transition-all duration-300).
9. **Stop All** halts the stream. **Reset** clears to $0.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-next-app interactive mode incompatible with Node 18**
- **Found during:** Task 1
- **Issue:** `npx create-next-app@latest` (v16.2.6) requires Node 20+ and prompts interactively even with `--yes`; running on Node 18.20.8.
- **Fix:** Manually scaffolded `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `app/layout.tsx`, `app/globals.css` with equivalent configuration. Stack choice (Next.js 14) preserved.
- **Files modified:** All scaffold files (created manually).
- **Commit:** 05d3113

None — all other plan elements executed exactly as written.

## Self-Check: PASSED

- [x] lib/types/agent.ts exists
- [x] lib/simulation/fixtures.ts exists with FIXTURE_AGENTS containing Coke + Stride
- [x] lib/simulation/opportunities.ts exists with 15 OPPORTUNITY_TEMPLATES + sampleOpportunity()
- [x] lib/simulation/relevance.ts, decide.ts, ad-templates.ts, engine.ts, store.ts all exist
- [x] components/live-feed/{AgentRunnerBar,AdCard,OpportunityCard,LiveFeedPanel}.tsx all exist
- [x] app/demo/live/page.tsx exists
- [x] Commits 05d3113, 7bf390b, 6eea348 all exist in git log
- [x] npx tsc --noEmit passes (0 errors)
