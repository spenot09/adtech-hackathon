---
phase: 02-live-bidding-simulation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - lib/types/agent.ts
  - lib/simulation/fixtures.ts
  - lib/simulation/opportunities.ts
  - lib/simulation/relevance.ts
  - lib/simulation/decide.ts
  - lib/simulation/ad-templates.ts
  - lib/simulation/engine.ts
  - lib/simulation/store.ts
  - components/live-feed/LiveFeedPanel.tsx
  - components/live-feed/OpportunityCard.tsx
  - components/live-feed/AgentRunnerBar.tsx
  - components/live-feed/AdCard.tsx
  - app/demo/live/page.tsx
autonomous: true
requirements:
  - BID-01
  - BID-02
  - BID-03
  - BID-04
  - BID-05
  - AD-01
  - AD-02
  - DASH-02

must_haves:
  truths:
    - "User can click Start and see BOTH fixture agents (Coke + Stride) flip to active with per-agent budget bars visible"
    - "Live feed continuously renders new opportunities every ~1-2 seconds while agents are active"
    - "Each opportunity card shows detected intent badge and TWO side-by-side decision strips (one per agent)"
    - "Each agent decision shows action (bid/skip/block/review) with reason text and a relevance bar"
    - "On a high-relevance opportunity for Coke (e.g. 'cold drink on a hot day'), Coke bids near maxCpc while Stride skips with 'low relevance' reason — and vice versa for a running/fitness opportunity"
    - "Bid wins immediately render an HTML brand-styled AdCard using a curated (brand × intent) template"
    - "Per-agent spend bars climb and remaining budget decreases as wins accrue"
    - "Clicking Stop halts the opportunity stream"
  artifacts:
    - path: "lib/types/agent.ts"
      provides: "Shared Agent/Brand/Ad/ImageStyle/RelevanceScore types consumed by Phase 1 and Phase 2"
      contains: "export type Agent"
    - path: "lib/simulation/fixtures.ts"
      provides: "Two hardcoded fixture agents (Coke, Stride) for standalone multi-agent demo"
      contains: "FIXTURE_AGENTS"
    - path: "lib/simulation/relevance.ts"
      provides: "Deterministic keyword+intent relevance scoring"
      contains: "scoreRelevance"
    - path: "lib/simulation/ad-templates.ts"
      provides: "Curated (brand × intent) ad templates with HTML ImageStyle specs"
      contains: "pickAd"
    - path: "lib/simulation/engine.ts"
      provides: "Multi-agent setInterval-based opportunity generator + decision loop (runSimulation)"
      contains: "runSimulation"
    - path: "components/live-feed/LiveFeedPanel.tsx"
      provides: "Two-column self-contained panel slottable into the dashboard later"
      min_lines: 40
    - path: "components/live-feed/AdCard.tsx"
      provides: "HTML/CSS brand-styled ad card driven by ImageStyle + templated copy"
      min_lines: 30
    - path: "app/demo/live/page.tsx"
      provides: "Standalone demo route so Phase 2 is visible without Phase 1"
  key_links:
    - from: "components/live-feed/LiveFeedPanel.tsx"
      to: "lib/simulation/engine.ts"
      via: "subscribe to in-memory event store via useSimulation hook"
      pattern: "useSimulation|subscribe"
    - from: "lib/simulation/engine.ts"
      to: "lib/simulation/decide.ts"
      via: "calls decide(agent, opportunity, relevance) per tick per agent"
      pattern: "decide\\("
    - from: "lib/simulation/engine.ts"
      to: "lib/simulation/ad-templates.ts"
      via: "calls pickAd(agent, opportunity) synchronously on win"
      pattern: "pickAd\\("
    - from: "components/live-feed/OpportunityCard.tsx"
      to: "components/live-feed/AdCard.tsx"
      via: "renders AdCard inline when decision.ad is present"
      pattern: "AdCard"
---

<objective>
Ship the multi-agent live bidding simulation: an opportunity stream that pops conversational ad requests every ~1-2s, TWO fixture agents (Coke + Stride) that each visibly decide bid/skip/block/review with relevance scores and reasons, brand-styled HTML ad cards on wins (drawn from a curated (brand × intent) template library), and per-agent budget bars that climb in real time.

Purpose: This is the demo's centerpiece — without the live feed, the project has no "wow" moment. Side-by-side competing agents make the bounded-autonomy story visceral: one agent confidently bids while the other passes, and the rationale is right there. It must run standalone (via a `/demo/live` route using hardcoded fixture agents) so it ships independently of Phase 1's parallel work.

Output: A self-contained two-column live-feed panel + N-agent simulation engine + deterministic ad-template picker that Phase 1 can later slot into the main dashboard. Shared Agent/Brand/Ad types defined here so Phase 1 adopts them.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md

<coordination_note>
Phase 1 is being built in parallel. Phase 2 MUST be standalone-runnable:
- Use hardcoded `FIXTURE_AGENTS` (Coke + Stride, all fields populated) in `lib/simulation/fixtures.ts`.
- Define the shared `Agent`, `Brand`, `Ad`, `ImageStyle`, `RelevanceScore` types in `lib/types/agent.ts` — Phase 1 will import these.
- Build the live-feed panel as a self-contained component that can later be slotted into Phase 1's dashboard.
- Keep file ownership in `lib/types/`, `lib/simulation/`, `components/live-feed/`, `app/demo/live/` to avoid merge conflicts with Phase 1's `app/`, `components/dashboard/`, `lib/store/agents.ts` work.
- Phase 2 owns a throwaway demo route at `app/demo/live/page.tsx` so it is independently demoable.
- No external API keys or `.env.local` required — ads are deterministic templates.
</coordination_note>

<phase_goal>
## Phase Goal

**As a** brand advertiser running an AgentBid agent, **I want to** start my agent and watch it make visible bid/skip decisions on a live stream of conversational ad opportunities, **so that** I can trust it is working and see ad spend translating into placed sponsored answers in real time.
</phase_goal>

<scope_discipline>
Hackathon constraint: 4-hour total build, ~60-90 min for this phase. Favor demo impact over engineering depth.

In scope:
- In-memory event loop (`setInterval`/recursive `setTimeout`), no DB, no WebSockets.
- N-agent simulation engine (`runSimulation({ agents, ... })`) — not hardcoded to 2.
- Hardcoded opportunity templates (15 total, ~8 matching at least one brand's target intents incl. clear winners for each brand) randomly sampled.
- Deterministic relevance scoring (keyword overlap × intent match) — no real ML.
- Relevance-weighted bid amount: `maxCpc * (0.4 + 0.6 * relevance)`.
- Rule-based decision logic (block category, intent mismatch / low relevance, over-budget, near-cap review, otherwise bid).
- Deterministic templated ads keyed by `(brandId, intent)` with hand-authored headline/body/CTA + an HTML `ImageStyle` spec. Picked synchronously on win — no API call, no async.
- Pure HTML/CSS brand-styled ad cards driven by the template's `ImageStyle` (no image hosting, no image gen API).
- Intents: thirst, refreshment, summer, travel-booking, food, fitness, running, shopping, finance-advice, medical, general-question.

Out of scope (later phases):
- Real analytics panel beyond per-agent budget bars (Phase 3).
- Hard safety enforcement of budget cap (Phase 3 hardens this; Phase 2 just stops ticking when budget hits 0).
- Approval queue / autonomy modes (Phase 4).
- Any real ad exchange, LLM ad generation, or image generation API.
</scope_discipline>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold (idempotent), shared types incl. Brand/Ad/ImageStyle, two fixture agents (Coke + Stride), 15 opportunity templates</name>
  <files>package.json, tsconfig.json, next.config.js, tailwind.config.ts, app/layout.tsx, app/globals.css, lib/types/agent.ts, lib/simulation/fixtures.ts, lib/simulation/opportunities.ts</files>
  <action>
    First, check whether a Next.js app already exists at the repo root (look for `package.json` + `app/` directory). If Phase 1 has scaffolded it, skip the scaffold step and only add Tailwind config if missing. If not present, scaffold a minimal Next.js 14 App Router project with TypeScript and Tailwind: `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm --eslint=false` (run non-interactively; accept defaults; do not overwrite `.planning/`).

    Then create the shared types and fixtures:

    `lib/types/agent.ts` — Export:
      - `AutonomyMode = "manual" | "assisted" | "autonomous"`.
      - `Intent = "thirst" | "refreshment" | "summer" | "travel-booking" | "food" | "fitness" | "running" | "shopping" | "finance-advice" | "medical" | "general-question"`.
      - `Brand` with fields: `name: string`, `color: string` (hex), `voice: string` (1-line tone description), `designGuidelines: string` (1-2 lines on visual style), `keywords: string[]`.
      - `Agent` with fields: `id: string`, `name: string`, `brand: Brand`, `goal: string`, `dailyBudgetCap: number`, `maxCpc: number`, `autonomyMode: AutonomyMode`, `targetIntents: Intent[]`, `blockedCategories: string[]`, `status: "paused" | "active" | "stopped"`, `spend: number`.
      - `Opportunity` (id, timestamp, query: string, intent: Intent, category: string, suggestedCpc: number).
      - `RelevanceScore` (matchedKeywords: string[], intentMatched: boolean, score: number).
      - `ImageStyle` with fields: `background: string` (CSS gradient/solid), `iconEmoji: string`, `accentShape: "circle" | "diamond" | "wave" | "burst"`, `motionHint?: "pulse" | "float" | "shimmer"`.
      - `Ad` with fields: `headline: string`, `body: string`, `cta: string`, `imageStyle: ImageStyle`, `source: "template" | "fallback"`.
      - `Decision` (agentId: string, opportunityId: string, action: "bid" | "skip" | "block" | "review", bidAmount?: number, reason: string, relevance: RelevanceScore, won?: boolean, ad?: Ad).

    `lib/simulation/fixtures.ts` — Export `FIXTURE_AGENTS: Agent[]` containing exactly:
      1. **Coke** — id "coke", name "Coca-Cola Bidder", brand `{ name: "Coca-Cola", color: "#F40009", voice: "Iconic, joyful, refreshment-first; classic American optimism.", designGuidelines: "Bold red, white serif wordmark feel, condensation/ice cues, energetic.", keywords: ["cold", "drink", "hot", "summer", "ice", "refresh", "thirsty", "beach", "vacation"] }`, goal "Win refreshment and thirst-driven placements", dailyBudgetCap 500, maxCpc 4.50, autonomyMode "autonomous", targetIntents ["thirst", "refreshment", "summer", "travel-booking", "food"], blockedCategories ["medical", "gambling", "politics"], status "paused", spend 0.
      2. **Stride** — id "stride", name "Stride Athletic Bidder", brand `{ name: "Stride Athletic", color: "#1E3A8A", voice: "Driven, performance-oriented, encouraging.", designGuidelines: "Deep navy, clean sans, motion lines, athletic energy.", keywords: ["shoes", "run", "athletic", "fitness", "marathon", "comfortable", "walking"] }`, goal "Win fitness and running-shoe placements", dailyBudgetCap 500, maxCpc 4.00, autonomyMode "autonomous", targetIntents ["fitness", "running", "shopping", "travel-booking"], blockedCategories ["medical", "gambling", "politics"], status "paused", spend 0.

    Also export `cloneFixtureAgents(): Agent[]` returning deep clones (so reset works).

    `lib/simulation/opportunities.ts` — Export `OPPORTUNITY_TEMPLATES`: array of exactly 15 objects each with `query` (realistic conversational user message), `intent` (one of the Intent values), `category` (e.g. "beverage", "footwear", "travel", "finance", "medical", "gambling", "shopping", "general"), `suggestedCpc` (number 1.50-6.00). Composition target: ~8 templates that match at least one brand's target intents with strong keyword overlap, including:
      - Clear Coke winners (e.g. "I'm dying for a cold drink on a hot summer day", "what's the most refreshing thing to grab at the beach?", "best ice-cold soda for a bbq?").
      - Clear Stride winners (e.g. "looking for comfortable running shoes for a marathon", "what athletic shoes are best for long walks?", "need new shoes to start running").
      - At least one travel-booking template both brands target moderately (e.g. "planning a summer vacation, where should I go?").
      - At least 2 medical/gambling/politics templates so block decisions show up.
      - Remainder: general-question, finance-advice, etc. that both agents skip.

    Export `sampleOpportunity(): Opportunity` that picks a random template, stamps `id` (use `crypto.randomUUID()`) and `timestamp` (Date.now()).
  </action>
  <verify>
    <automated>test -f lib/types/agent.ts && test -f lib/simulation/fixtures.ts && test -f lib/simulation/opportunities.ts && grep -q "FIXTURE_AGENTS" lib/simulation/fixtures.ts && grep -q "Coca-Cola" lib/simulation/fixtures.ts && grep -q "Stride" lib/simulation/fixtures.ts && grep -q "OPPORTUNITY_TEMPLATES" lib/simulation/opportunities.ts && grep -q "sampleOpportunity" lib/simulation/opportunities.ts && npx tsc --noEmit</automated>
  </verify>
  <done>Next.js app scaffolded (or confirmed present), Tailwind working, `Agent`/`Brand`/`Ad`/`ImageStyle`/`RelevanceScore`/`Opportunity`/`Decision` types exported, both FIXTURE_AGENTS (Coke + Stride) defined with all fields including keyword arrays, exactly 15 opportunity templates exist with the prescribed distribution, `tsc --noEmit` passes.</done>
</task>

<task type="auto">
  <name>Task 2: N-agent simulation engine, relevance scoring, decision rules, templated ad picker, in-memory store</name>
  <files>lib/simulation/relevance.ts, lib/simulation/decide.ts, lib/simulation/ad-templates.ts, lib/simulation/engine.ts, lib/simulation/store.ts</files>
  <action>
    `lib/simulation/relevance.ts` — Export `scoreRelevance(agent: Agent, opp: Opportunity): RelevanceScore`. Lowercase the opportunity `query`, split on non-word chars, intersect with `agent.brand.keywords` (also lowercased) to get `matchedKeywords`. Compute `intentMatched = agent.targetIntents.includes(opp.intent)`. Formula: `raw = matchedKeywords.length / agent.brand.keywords.length`, `intentWeight = intentMatched ? 1.0 : 0.3`, `score = Math.min(1, raw * intentWeight * 2)` (the `*2` boost keeps scores in a useful range given keyword lists of ~7-9). Clamp to [0, 1]. Return `{ matchedKeywords, intentMatched, score }`. Deterministic — no randomness.

    `lib/simulation/decide.ts` — Export `decide(agent: Agent, opp: Opportunity, relevance: RelevanceScore): Decision`. Rules in order:
      1. If `opp.category` is in `agent.blockedCategories` → action "block", reason `"Category ${category} is in your block list."`.
      2. If `opp.suggestedCpc > agent.maxCpc` → action "skip", reason `"Suggested CPC $${suggestedCpc} exceeds your max CPC $${maxCpc}."`.
      3. If `agent.spend + opp.suggestedCpc > agent.dailyBudgetCap` → action "skip", reason `"Would exceed daily budget cap."`.
      4. If `relevance.score < 0.15` → action "skip", reason `"Low relevance: ${agent.brand.name} keywords don't match ${opp.intent}."`.
      5. If `relevance.score >= 0.7` AND `opp.suggestedCpc >= agent.maxCpc * 0.9` AND `agent.autonomyMode !== "autonomous"` → action "review", reason "High-value high-relevance bid near max CPC — escalating per autonomy policy." (Phase 4 wires this; Phase 2 fixtures are "autonomous" so dormant but coded.)
      6. Otherwise → action "bid", `bidAmount = Number((agent.maxCpc * (0.4 + 0.6 * relevance.score)).toFixed(2))`, reason `"Relevance ${(relevance.score*100).toFixed(0)}% — bidding $${bidAmount}."`.
    Always include `relevance` on the returned `Decision`. Do NOT determine `won` here.

    `lib/simulation/ad-templates.ts` — Curated, hand-authored ad library. Export:
      - `AD_TEMPLATES: Record<string /*agentId*/, Partial<Record<Intent, Ad>>>` — hand-write at least these entries (every `source: "template"`):
        - `coke.thirst`: headline "Ice-cold Coke. Right now.", body "Crack one open. Nothing else hits the same on a hot day.", cta "Find a fridge near you", imageStyle `{ background: "linear-gradient(135deg, #F40009 0%, #8B0000 100%)", iconEmoji: "🥤", accentShape: "burst", motionHint: "pulse" }`.
        - `coke.refreshment`: headline "Refreshment, uncapped.", body "Real sugar, real fizz, real refreshment. Open happiness.", cta "Grab a bottle", imageStyle `{ background: "radial-gradient(circle at 30% 30%, #FF1F2C 0%, #B00007 100%)", iconEmoji: "🧊", accentShape: "circle", motionHint: "shimmer" }`.
        - `coke.summer`: headline "Tastes like summer.", body "Beach days, BBQs, balcony nights. Coke makes the moment.", cta "Pack a cooler", imageStyle `{ background: "linear-gradient(180deg, #F40009 0%, #FFD200 100%)", iconEmoji: "🏖️", accentShape: "wave", motionHint: "float" }`.
        - `coke.travel-booking`: headline "Wherever you're headed.", body "There's always a Coke waiting on the other side.", cta "Plan your trip", imageStyle `{ background: "linear-gradient(120deg, #F40009 0%, #1E3A8A 120%)", iconEmoji: "✈️", accentShape: "diamond" }`.
        - `coke.food`: headline "Better with Coke.", body "Burgers, tacos, pizza — every bite tastes better with a cold Coca-Cola.", cta "Order a 6-pack", imageStyle `{ background: "linear-gradient(135deg, #F40009 0%, #2C0000 100%)", iconEmoji: "🍔", accentShape: "burst" }`.
        - `stride.fitness`: headline "Built for the next mile.", body "Stride Athletic — cushion where you need it, lockdown where it counts.", cta "Shop fitness", imageStyle `{ background: "linear-gradient(135deg, #1E3A8A 0%, #0B1437 100%)", iconEmoji: "💪", accentShape: "diamond", motionHint: "pulse" }`.
        - `stride.running`: headline "Run further. Recover faster.", body "Marathon-tested foam. Engineered for runners who don't quit.", cta "Find your fit", imageStyle `{ background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)", iconEmoji: "🏃", accentShape: "wave", motionHint: "float" }`.
        - `stride.shopping`: headline "Athletic, all-day.", body "Stride Athletic. Performance you can wear anywhere.", cta "Browse shoes", imageStyle `{ background: "linear-gradient(120deg, #1E3A8A 0%, #475569 100%)", iconEmoji: "👟", accentShape: "circle" }`.
        - `stride.travel-booking`: headline "Pack lighter. Walk further.", body "Trip-ready shoes that go from boarding gate to boardwalk.", cta "Travel-ready styles", imageStyle `{ background: "linear-gradient(120deg, #1E3A8A 0%, #F40009 120%)", iconEmoji: "🧳", accentShape: "diamond" }`.

      - `pickAd(agent: Agent, opportunity: Opportunity): Ad` — looks up `AD_TEMPLATES[agent.id]?.[opportunity.intent]`. If present, returns it unchanged with `source: "template"`. If missing (unexpected intent for that brand), returns a brand-derived fallback: `{ headline: \`${agent.brand.name} — for your ${opportunity.intent}\`, body: \`A ${agent.brand.voice.split(",")[0].toLowerCase()} pick for "${opportunity.query.slice(0,60)}".\`, cta: "Learn more", imageStyle: { background: \`linear-gradient(135deg, ${agent.brand.color} 0%, #000 100%)\`, iconEmoji: "✨", accentShape: "circle" }, source: "fallback" }`. Synchronous — no async, no Promise.

    `lib/simulation/store.ts` — Tiny in-memory pub/sub store usable from a React client component. Export a singleton with:
      - `agents: Agent[]` (defaults to `cloneFixtureAgents()`).
      - `events: Array<{ opportunity: Opportunity; decisions: Record<string /*agentId*/, Decision> }>` (cap at 50, drop oldest).
      - `subscribe(fn): () => void`, `emit()`, `start()`, `stop()`, `reset()`.
      - `applyDecisions(opp, decisionsByAgent)` — mutates each agent's `spend` when its decision is "bid" AND `won`.
      - `setAgentStatus(status: "paused" | "active" | "stopped")` — applies to ALL agents.
      Use a plain object module-level singleton. Wrap consumption with a React hook `useSimulation()` that returns `{ agents, events, start, stop, reset }` and re-renders via `useSyncExternalStore`.

    `lib/simulation/engine.ts` — Export `runSimulation({ agents, store, getAgents })` and convenience `startEngine()` / `stopEngine()`. `startEngine` sets all agents' status to "active" via `store.setAgentStatus("active")`, then uses recursive `setTimeout` with a random delay between 800-1800ms. On each tick:
      1. Read current agents from store. Stop if no agent has status "active" OR every active agent has `spend >= dailyBudgetCap`.
      2. `const opp = sampleOpportunity()`.
      3. For EACH agent (only those still "active" with budget remaining):
         a. `const relevance = scoreRelevance(agent, opp)`.
         b. `const decision = decide(agent, opp, relevance)`.
         c. If action is "bid": simulate win/loss with **75% win rate** (`Math.random() < 0.75`). If won: deduct `decision.bidAmount` from agent's spend AND attach `decision.ad = pickAd(agent, opp)`. If lost: no ad.
      4. Push `{ opportunity: opp, decisions: { [agentId]: Decision, ... } }` to events.
      5. `store.emit()`.
    `stopEngine` calls `store.setAgentStatus("stopped")` and clears the timer.

    Engine must export `runSimulation({ agents })` as the canonical entrypoint so the simulation isn't hardcoded to two agents; `startEngine/stopEngine` are thin wrappers over the default store.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>Relevance scoring is deterministic and brand-keyword driven. Decision logic implements all 6 rule branches in order including the low-relevance skip and relevance-weighted bid amount. Engine supports N agents via `runSimulation({ agents, ... })`, ticks every 0.8-1.8s, deducts spend on wins at 75% win rate, attaches a templated `Ad` synchronously on wins, stops when all agents are out of budget or stopped. `pickAd` returns a curated (brand × intent) ad with full `ImageStyle` for every fixture-agent target intent. `tsc --noEmit` passes.</done>
</task>

<task type="auto">
  <name>Task 3: Two-column live feed UI, per-agent runner bars, HTML brand-styled AdCard, standalone demo route</name>
  <files>components/live-feed/LiveFeedPanel.tsx, components/live-feed/OpportunityCard.tsx, components/live-feed/AgentRunnerBar.tsx, components/live-feed/AdCard.tsx, app/demo/live/page.tsx</files>
  <action>
    `components/live-feed/AgentRunnerBar.tsx` ("use client") — Props: `{ agent: Agent }`. Renders one agent's header: name, brand name, brand color swatch (small dot using `agent.brand.color`), status badge (paused gray, active green-pulse, stopped red), and a Tailwind progress bar showing `spend / dailyBudgetCap` with labels "$X.XX spent / $Y remaining". Bar fill uses `agent.brand.color`. Use `transition-all duration-300` on the fill so the climb is visually smooth.

    `components/live-feed/AdCard.tsx` — Pure component, props: `{ ad: Ad; brand: Brand }`. Layout (all Tailwind/CSS, no images):
      - Outer card: rounded-2xl, shadow-lg, border using `brand.color`, `aspect-[4/3]` or fixed height, `overflow-hidden`, position relative.
      - Background: inline style `background: ad.imageStyle.background`.
      - Accent shape: an absolutely-positioned div behind the icon, shape switched by `ad.imageStyle.accentShape` (circle = rounded-full, diamond = rotate-45 square, wave = inline SVG path, burst = radial-gradient overlay). Semi-transparent white.
      - Icon: oversized centered emoji from `ad.imageStyle.iconEmoji` at ~7xl text size. If `motionHint` is set, apply matching CSS animation (`pulse` → Tailwind `animate-pulse`, `float` → custom keyframes via inline class, `shimmer` → gradient sweep).
      - Brand wordmark: `brand.name` in bold near the top.
      - Headline (`ad.headline`) and body (`ad.body`) in a content panel at bottom with a translucent backdrop for legibility.
      - CTA button (`ad.cta`) styled with `brand.color`.
      - If `ad.source === "fallback"`: render a small "fallback" tag in the corner.

    `components/live-feed/OpportunityCard.tsx` — Pure component, props: `{ opportunity: Opportunity; decisions: Record<string, Decision>; agents: Agent[] }`. Layout:
      - Top row: timestamp (HH:MM:SS), intent badge (colored by intent), category tag.
      - Middle: the conversational query in italic quotes.
      - Two-column decision strip: one cell per agent (use `agents` order). Each cell shows:
        - Agent name + brand color dot.
        - Action badge color-coded (bid=blue, skip=gray, block=red, review=amber).
        - Bid amount if present (e.g. "$3.24") and a small horizontal relevance bar (width = `relevance.score * 100%`, filled with brand color).
        - Reason text small/muted.
        - won/lost pill if `decision.won` is defined ("WON" green / "LOST" red).
        - If `decision.ad` is present (i.e. it's a win): render `<AdCard ad={decision.ad} brand={agent.brand} />` below the cell.

    `components/live-feed/LiveFeedPanel.tsx` ("use client") — Uses `useSimulation()`. Layout:
      - Header row: a `Start All` / `Stop All` / `Reset` control set (one global trigger that flips both agents — wired to `startEngine()` / `stopEngine()` / `store.reset()`).
      - Then a row of per-agent `AgentRunnerBar` cards (one per agent, full width).
      - Then a scrollable feed of `OpportunityCard`s, newest first. Each card spans full width and renders the two decision columns internally.
      - Empty state: "Press Start to begin the live bidding stream — Coke and Stride will compete on every opportunity."
      - Apply `flex flex-col gap-3`, max-height, `overflow-y-auto` on the feed. Tailwind polish: rounded-lg, border, shadow-sm, dark-mode friendly.

    `app/demo/live/page.tsx` — Server component that renders a centered container (`max-w-5xl mx-auto p-6`) with a page title "AgentBid Studio — Live Bidding (Phase 2 demo)", a one-line description ("Two agents, one opportunity stream — watch Coke and Stride compete in real time."), and `<LiveFeedPanel />`. This route is the standalone Phase 2 demo; Phase 1 can later mount `<LiveFeedPanel />` into the real dashboard.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
    <human-check>Manual smoke at http://localhost:3000/demo/live — press Start, confirm both agent bars activate, opportunities stream in with two-column decisions, at least one win renders an AdCard, spend bars climb, Stop halts the stream.</human-check>
  </verify>
  <done>Visit `/demo/live`. Press Start → both agents' status flips active, opportunities appear every ~1-2s, each card shows intent badge + TWO decision strips with relevance bars. On a "cold drink / hot day" opportunity Coke bids near maxCpc and Stride skips with low-relevance reason (and vice versa for a running opportunity). Bid wins immediately render brand-styled HTML AdCards using the curated (brand × intent) template. Per-agent spend bars climb visibly. Stop halts the stream. Reset returns to zero. `tsc --noEmit` passes.</done>
</task>

</tasks>

<verification>
End-to-end demo walkthrough on `/demo/live`:
1. Page loads with Coke and Stride both shown as paused, each at spend $0 / $500.
2. Click Start All → both status badges turn green/pulsing → first opportunity card appears within ~2s.
3. Within 15 seconds, the feed shows:
   - A high-relevance Coke BID (e.g. on a "cold drink / summer" opportunity) with a near-maxCpc bid amount and a tall relevance bar — at least one WON with an HTML AdCard from the curated template library.
   - A simultaneous Stride SKIP on that same Coke-favored opportunity with reason "Low relevance: Stride Athletic keywords don't match ...".
   - A mirror case: a running/fitness opportunity where Stride bids high and Coke skips with low-relevance.
   - At least one BLOCK on a medical/gambling category (both agents).
4. Per-agent spend bars visibly increase as wins land; remaining budgets decrease.
5. AdCards render the curated brand-styled visual + headline/body/CTA from `AD_TEMPLATES`.
6. Click Stop All → no new opportunities appear.
7. Click Reset → spends return to $0, feed clears.

Type check: `npx tsc --noEmit` passes.
</verification>

<success_criteria>
- Phase 2 runs standalone via `/demo/live` without any Phase 1 code.
- Two fixture agents (Coke + Stride) compete side-by-side on the same opportunity stream.
- Engine supports N agents via `runSimulation({ agents, ... })` — not hardcoded to 2.
- Deterministic relevance scoring produces clear differentiation per opportunity.
- Curated (brand × intent) ad templates in `lib/simulation/ad-templates.ts` cover every fixture-agent target intent and render via `pickAd` synchronously on wins.
- HTML/CSS brand-styled AdCards — no real images, no image gen API, no Unsplash, no LLM.
- All ROADMAP success criteria for Phase 2 are demonstrably true on that page.
- Shared `Agent`/`Brand`/`Ad`/`ImageStyle`/`RelevanceScore` types are in `lib/types/agent.ts` ready for Phase 1 to import.
- Live-feed panel is a self-contained component drop-in for Phase 1's dashboard.
- No DB, no WebSockets, no external API keys.
- Total work completes in ~60-90 minutes of focused execution.
</success_criteria>

<output>
Create `.planning/phases/02-live-bidding-simulation/02-01-SUMMARY.md` when done, noting: files created, the shared `Agent`/`Brand`/`Ad`/`ImageStyle`/`RelevanceScore` type signatures for Phase 1 consumption, the `/demo/live` route URL, ad-template coverage (which (brand × intent) entries are present), and any deviations from this plan.
</output>
