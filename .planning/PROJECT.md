# AgentBid Studio

## What This Is

A buy-side dashboard for brands to create AI bidding agents that compete for conversational ad inventory in LLM channels. Advertisers configure an agent with a goal, budget, safety rules, and autonomy level, then watch it bid on chat-native ad opportunities in real time — generating sponsored answers, tracking spend, and escalating risky decisions to a human.

## Core Value

A convincing live demo of bounded autonomous bidding: an agent that wins safe bids, skips/blocks unsafe ones, and escalates risky high-value placements to a human — all visible on one dashboard.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Brand can create and configure a bidding agent (name, brand, goal, budget cap, max CPC, autonomy mode, blocked categories)
- [ ] Dashboard shows live agent status (active / paused / needs review), spend progress, remaining budget
- [ ] Simulated stream of conversational ad opportunities flows into the agent
- [ ] Agent makes a visible decision per opportunity (bid / skip / block / review) with intent detection and reason
- [ ] Successful bids produce a plain-text sponsored response (generated ad)
- [ ] Analytics panel updates live: spend, remaining budget, impressions, bids won, clicks, conversions, avg CPC, ROAS, skipped unsafe placements
- [ ] Safety controls enforce daily budget cap, max CPC, blocked categories, autonomy mode, pause/kill switch
- [ ] Human approval queue surfaces risky/high-value bids with approve/reject/edit-copy actions and a decision log

### Out of Scope

- Real ad exchange or publisher integrations — demo prioritizes convincing simulation over wired infrastructure
- Real payments or billing — spend is simulated against the configured cap
- Multi-tenant auth / user management — single-user demo
- Card-style ad preview — only if time permits (stretch goal, not required for demo)
- Persistent storage beyond the demo session — in-memory or local store is fine

## Context

- **Hackathon:** Built for the "Ad Infrastructure for AI" hackathon in London, 2026-05-28. Track: *Buy-Side Agents*.
- **Time budget:** ~4 hours from start to demo.
- **Core question driving the build:** When can an agent autonomously bid and spend inside LLM channels, and when should a human review the decision?
- **Audience:** Hackathon judges and attendees — the build must read as a credible buy-side product, not a toy.

## Constraints

- **Timeline:** ~4 hours total — every scope decision favors demo impact over engineering depth.
- **Demo over infrastructure:** Simulated bidding stream and simulated ad exchange — no real integrations.
- **Single-user demo:** No auth, no multi-tenant concerns.
- **Stack:** Undecided; pick whatever ships a polished interactive dashboard fastest (likely Next.js + Tailwind + an in-memory event loop).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prioritize convincing demo over real ad infrastructure | 4-hour build; judges evaluate the agent UX, not exchange wiring | — Pending |
| Use coarse phase granularity (3-5 phases) | Short hackathon timeline; minimize planning overhead | — Pending |
| Skip pre-build domain research | Domain is well understood by the builder; time better spent on the build | — Pending |
| Demo flow drives priority: dashboard → bidding → ad → analytics → safety → human approval | Each step builds on the previous and the demo narrative depends on this order | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-28 after initialization*
