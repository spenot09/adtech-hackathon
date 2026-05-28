---
quick_id: 260528-rxy
slug: nike-nb-demo-walkthrough
task: Nike + New Balance step-by-step demo walkthrough
date: 2026-05-28
---

<objective>
Replace the Coke/Stride fixture agents with Nike and New Balance, add pre-scripted ad templates for both brands, and redesign /demo/live to a three-scenario walkthrough with animated sequential reveals instead of the continuous random stream.

Purpose: Make the live demo page a polished, deterministic showpiece — three distinct moments that prove the bidding logic (Nike wins athletic, NB wins street style, both skip irrelevant) rather than random ticker noise.

Output:
- lib/simulation/fixtures.ts — Nike + New Balance FIXTURE_AGENTS
- lib/simulation/ad-templates.ts — nike.running, nike.fitness, nb.shopping, nb.fitness templates added
- lib/simulation/demo-scenarios.ts — DEMO_SCENARIOS array (3 fully pre-scripted scenarios)
- app/demo/live/page.tsx — walkthrough UI replacing LiveFeedPanel
- components/live-feed/WalkthroughPanel.tsx — new client component: scenario reveal with animation + controls
</objective>

<task type="auto">
  <name>Task 1: Replace fixtures and add ad templates</name>
  <files>lib/simulation/fixtures.ts, lib/simulation/ad-templates.ts</files>
  <action>
Rewrite lib/simulation/fixtures.ts entirely. Replace the Coke + Stride FIXTURE_AGENTS with the two new agents below. Keep the cloneFixtureAgents() export unchanged in signature.

Nike agent:
  id: "nike"
  name: "Nike Performance Bidder"
  brand: { name: "Nike", color: "#111111", voice: "Bold, athletic, motivational — Just Do It energy", designGuidelines: "Black/white, clean sans, speed and motion", keywords: ["run", "athletic", "sport", "performance", "marathon", "training", "workout", "gym", "race", "sprint"] }
  goal: "Win athletic and running-focused placements"
  dailyBudgetCap: 600, maxCpc: 5.50
  autonomyMode: "autonomous"
  targetIntents: ["fitness", "running", "shopping", "travel-booking"]
  blockedCategories: ["medical", "gambling", "politics"]
  status: "paused", spend: 0

New Balance agent:
  id: "nb"
  name: "New Balance Bidder"
  brand: { name: "New Balance", color: "#CF3A2C", voice: "Authentic, crafted, heritage street style", designGuidelines: "Red/grey, heritage feel, craftsmanship cues", keywords: ["shoes", "sneakers", "street", "casual", "walking", "style", "comfort", "everyday", "fashion"] }
  goal: "Win street-style and casual footwear placements"
  dailyBudgetCap: 400, maxCpc: 4.00
  autonomyMode: "autonomous"
  targetIntents: ["shopping", "fitness", "running", "general-question"]
  blockedCategories: ["medical", "gambling", "politics"]
  status: "paused", spend: 0

In lib/simulation/ad-templates.ts, replace the "coke" and "stride" keys with "nike" and "nb". Keep the same AD_TEMPLATES structure (Record of brand ID → Record of intent → Ad).

nike templates (source: "template" on all):
  running: headline "Run further. Win more.", body "Nike performance running shoes — engineered for marathon pace.", cta "Shop running", imageStyle: { background: "linear-gradient(135deg, #111 0%, #333 100%)", iconEmoji: "🏃", accentShape: "wave", motionHint: "float" }
  fitness: headline "Train harder.", body "Nike training gear built for athletes who don't quit.", cta "Shop training", imageStyle: { background: "linear-gradient(135deg, #111 0%, #555 100%)", iconEmoji: "💪", accentShape: "burst", motionHint: "pulse" }

nb templates (source: "template" on all):
  shopping: headline "Style that lasts.", body "New Balance — crafted for the streets, built for every day.", cta "Shop sneakers", imageStyle: { background: "linear-gradient(135deg, #CF3A2C 0%, #8B1A10 100%)", iconEmoji: "👟", accentShape: "circle", motionHint: "shimmer" }
  fitness: headline "Comfort where it counts.", body "New Balance — performance meets heritage.", cta "Find your fit", imageStyle: { background: "linear-gradient(135deg, #CF3A2C 0%, #444 100%)", iconEmoji: "🏅", accentShape: "diamond" }
  </action>
  <verify>
    <automated>cd /Users/spencercollins/Code/adtech-hackathon && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>TypeScript compiles clean. lib/simulation/fixtures.ts exports FIXTURE_AGENTS with ids "nike" and "nb". AD_TEMPLATES has "nike" and "nb" keys with the specified intent entries. No references to "coke" or "stride" remain in these two files.</done>
</task>

<task type="auto">
  <name>Task 2: Create demo-scenarios data module</name>
  <files>lib/simulation/demo-scenarios.ts</files>
  <action>
Create lib/simulation/demo-scenarios.ts. Export a typed DEMO_SCENARIOS array of DemoScenario objects. Define the DemoScenario type inline in this file:

  type DemoScenario = {
    id: string
    label: string
    opportunity: Opportunity
    decisions: { nike: Decision; nb: Decision }
  }

All three scenarios are fully deterministic — no runtime scoring, no engine involvement.

Scenario 1 — Athletic context:
  id: "athletic", label: "Athletic Context"
  opportunity: { id: "demo-opp-1", timestamp: Date.now(), query: "What's the best shoe for running a marathon in under 4 hours?", intent: "running", category: "footwear", suggestedCpc: 3.50 }
  decisions.nike: { agentId: "nike", opportunityId: "demo-opp-1", action: "bid", bidAmount: 5.28, reason: "96% relevance — bidding $5.28. Running performance is core territory.", relevance: { matchedKeywords: ["run", "marathon"], intentMatched: true, score: 0.96 }, won: true, ad: AD_TEMPLATES["nike"]!["running"]! }
  decisions.nb: { agentId: "nb", opportunityId: "demo-opp-1", action: "bid", bidAmount: 2.80, reason: "70% relevance — bidding $2.80. Running shoes are in range.", relevance: { matchedKeywords: ["shoes"], intentMatched: false, score: 0.70 }, won: false }

Scenario 2 — Street style context:
  id: "street-style", label: "Street Style Context"
  opportunity: { id: "demo-opp-2", timestamp: Date.now(), query: "Looking for classic sneakers that go with anything — everyday street style", intent: "shopping", category: "footwear", suggestedCpc: 2.80 }
  decisions.nb: { agentId: "nb", opportunityId: "demo-opp-2", action: "bid", bidAmount: 3.88, reason: "97% relevance — bidding $3.88. Street and casual footwear is our core.", relevance: { matchedKeywords: ["sneakers", "street", "casual", "style", "everyday"], intentMatched: true, score: 0.97 }, won: true, ad: AD_TEMPLATES["nb"]!["shopping"]! }
  decisions.nike: { agentId: "nike", opportunityId: "demo-opp-2", action: "bid", bidAmount: 2.48, reason: "45% relevance — bidding $2.48. Footwear adjacency but not performance territory.", relevance: { matchedKeywords: ["shoes"], intentMatched: true, score: 0.45 }, won: false }

Scenario 3 — Irrelevant context:
  id: "irrelevant", label: "Irrelevant Context"
  opportunity: { id: "demo-opp-3", timestamp: Date.now(), query: "Can you recommend a good accountant for small business taxes?", intent: "finance-advice", category: "finance", suggestedCpc: 2.20 }
  decisions.nike: { agentId: "nike", opportunityId: "demo-opp-3", action: "skip", reason: "Low relevance: Nike keywords don't match finance-advice.", relevance: { matchedKeywords: [], intentMatched: false, score: 0.04 }, won: false }
  decisions.nb: { agentId: "nb", opportunityId: "demo-opp-3", action: "skip", reason: "Low relevance: New Balance keywords don't match finance-advice.", relevance: { matchedKeywords: [], intentMatched: false, score: 0.03 }, won: false }

Import Opportunity, Decision, Ad from "@/lib/types/agent".
Import AD_TEMPLATES from "@/lib/simulation/ad-templates".
Export DEMO_SCENARIOS and the DemoScenario type.
  </action>
  <verify>
    <automated>cd /Users/spencercollins/Code/adtech-hackathon && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>TypeScript compiles clean. DEMO_SCENARIOS has exactly 3 entries. Each scenario has a fully typed opportunity and two fully typed decisions keyed by "nike" and "nb".</done>
</task>

<task type="auto">
  <name>Task 3: Build WalkthroughPanel and wire /demo/live page</name>
  <files>components/live-feed/WalkthroughPanel.tsx, app/demo/live/page.tsx</files>
  <action>
Create components/live-feed/WalkthroughPanel.tsx as a "use client" component. It imports DEMO_SCENARIOS and FIXTURE_AGENTS to get agent brand colors and names — it does NOT use the simulation engine, store, or hooks.

State:
  - activeIndex: number (0–2)
  - revealedDecisions: number (0 = only opportunity shown, 1 = nike revealed, 2 = both revealed)
  - autoAdvancing: boolean

Reveal sequence per scenario:
  1. Scenario card appears: opportunity block visible, both decision columns hidden (opacity-0 translate-y-2)
  2. After 800ms: nike decision column fades in (opacity-100 translate-y-0 transition-all duration-500)
  3. After another 800ms: nb decision column fades in
  4. After both revealed: start 3s auto-advance timer (not on last scenario). Show a progress bar draining width from 100% to 0% over 3s using CSS transition: width 3s linear.
  5. "Next" button always available to skip timer and advance.
  6. On final scenario: show "Restart" button instead of Next after both decisions revealed.

On advance: increment activeIndex, reset revealedDecisions to 0, cancel timer, begin new reveal sequence via useEffect watching activeIndex.

Animation classes:
  - Hidden: "opacity-0 translate-y-2"
  - Revealed: "opacity-100 translate-y-0 transition-all duration-500"
  - Opportunity block on scenario change: starts hidden, fades in over 300ms

Layout:
  - Top: three pill buttons (scenario indicator). Active: "bg-white text-gray-900", inactive: "bg-gray-700 text-gray-300". Clicking jumps to that scenario.
  - Scenario card: rounded-xl border border-gray-700 bg-gray-900 p-5 mt-4
    - Top row: intent badge (colored), category badge, suggestedCpc label
    - Query: italic text-gray-300 text-sm mt-2 mb-4
    - Two-column grid (grid grid-cols-2 gap-4): left = nike, right = nb
    - Each column: agent name + brand color dot header, action badge (BID=blue, SKIP=gray, BLOCK=red, REVIEW=amber), bid amount if present, WON/LOST pill, relevance bar (width = score*100%, filled with brand color), reason text (text-xs text-gray-400), AdCard if decision.ad is set
  - Progress bar (auto-advance indicator): h-0.5 bg-gray-700 rounded mt-4 with inner div
  - Controls row: flex justify-between items-center mt-4 — "Next →" button (disabled if last scenario and both revealed), "Restart" button (only when on last scenario and both revealed and not auto-advancing)

For agent display (name, brand.color), look up from FIXTURE_AGENTS: const agent = FIXTURE_AGENTS.find(a => a.id === agentId).

Import AdCard from "@/components/live-feed/AdCard".

Update app/demo/live/page.tsx:
  - Remove LiveFeedPanel import, add WalkthroughPanel import
  - Replace <LiveFeedPanel /> with <WalkthroughPanel />
  - Update h1 to "AgentBid Studio — Live Bidding Demo"
  - Update subtitle to "Nike and New Balance compete across three live scenarios."
  </action>
  <verify>
    <automated>cd /Users/spencercollins/Code/adtech-hackathon && npx tsc --noEmit 2>&1 | head -40</automated>
  </verify>
  <done>TypeScript compiles clean. /demo/live renders WalkthroughPanel with three scenario pills, animated reveals, and Next/Restart controls.</done>
</task>
