# AgentBid Studio — Roadmap

**Granularity:** coarse
**Mode:** mvp (vertical slices — each phase ships an end-to-end demoable capability)
**Coverage:** 24/24 v1 requirements mapped; 4/4 v2 Overmind requirements deferred

## North Star

End-to-end demo flow (DEMO-01): create a travel-brand agent → configure → start simulation → see safe bids won, unsafe skipped, one risky bid escalated → analytics update live.

## Post-MVP North Star

AgentBid Studio can become a production-grade agent control plane by sending bidding-agent traces to Overmind for supervision, anomaly review, regression-aware optimization, and eventual fine-tuning loops.

## Phases

- [ ] **Phase 1: Agent Studio Shell** — Dashboard scaffold with agent CRUD and configuration form
- [ ] **Phase 2: Live Bidding Simulation** — Opportunity stream, agent decisions, generated ads visible in the feed
- [ ] **Phase 3: Analytics & Safety Rails** — Live metrics panel and enforced safety controls (budget cap, max CPC, blocked categories, pause)
- [ ] **Phase 4: Human-in-the-Loop & Demo Polish** — Approval queue, decision log, autonomy modes, and end-to-end demo run
- [ ] **Phase 5: Overmind Agent Supervision** - Production tracing, anomaly review, and optimizer-ready datasets for bidding-agent improvement

## Phase Details

### Phase 1: Agent Studio Shell
**Goal:** User can create, configure, and view bidding agents on a dashboard that looks like a credible buy-side product.
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** AGENT-01, AGENT-02, AGENT-03, AGENT-04, AGENT-05, DASH-01
**Success Criteria** (what must be TRUE):
  1. User can open the app and see a dashboard listing configured agents with name, brand, and status.
  2. User can launch a "create agent" form and submit name, brand, goal, daily budget cap, max CPC, autonomy mode (manual/assisted/autonomous), target intents, and blocked categories.
  3. A newly created agent appears in the dashboard list with status "paused" (not yet running).
  4. Agent configuration persists across navigation within the session (in-memory store is fine).
**Plans:**
  - 01-01: App Shell And Agent Configuration Dashboard (Wave 1)
**UI hint:** yes

### Phase 2: Live Bidding Simulation
**Goal:** User can start an agent and watch it make visible bid/skip decisions on a live stream of conversational ad opportunities, with generated ad copy for wins.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** BID-01, BID-02, BID-03, BID-04, BID-05, AD-01, AD-02, DASH-02
**Success Criteria** (what must be TRUE):
  1. User can start a configured agent and see its status flip to "active" with spend progress and remaining budget updating on the dashboard.
  2. A live feed renders a continuous stream of conversational ad opportunities, each tagged with a detected intent (e.g., travel-booking, finance-advice).
  3. For each opportunity, the agent displays a decision (bid / skip / block / review) with a bid amount (when bidding) and a short human-readable reason.
  4. Each winning bid renders a plain-text sponsored response inline in the feed, tailored to the opportunity.
  5. Bid outcomes (won/lost) deduct from the agent's budget and update spend in real time.
**Plans:** TBD
**UI hint:** yes

### Phase 3: Analytics & Safety Rails
**Goal:** User can see live analytics for an agent and trust that safety rules (budget cap, max CPC, blocked categories, pause/kill) are actually enforced.
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** METRICS-01, METRICS-02, METRICS-03, METRICS-04, METRICS-05, SAFETY-01, SAFETY-02, SAFETY-03, DASH-03
**Success Criteria** (what must be TRUE):
  1. An analytics panel shows spend, remaining budget, impressions, bids won, clicks, conversions, average CPC, ROAS, and count of skipped unsafe placements — all updating live as the simulation runs.
  2. When the daily budget cap is reached, the agent stops bidding and its status reflects the cap hit.
  3. The agent never submits a bid above the configured max CPC, even when opportunities request higher amounts.
  4. Opportunities matching a blocked category are visibly skipped/blocked in the feed with a reason, and the skipped count increments.
  5. User can pause and resume any agent from the dashboard; pausing immediately halts new bids.
**Plans:**
  - 03-01: Analytics Tab For Adidas Vs New Balance Demo (Wave 1)
**UI hint:** yes

### Phase 4: Human-in-the-Loop & Demo Polish
**Goal:** User can review risky/high-value bids in an approval queue, autonomy modes govern when escalation happens, and the full end-to-end demo narrative runs cleanly.
**Mode:** mvp
**Depends on:** Phase 3
**Requirements:** SAFETY-04, HUMAN-01, HUMAN-02, HUMAN-03, DEMO-01
**Success Criteria** (what must be TRUE):
  1. Autonomy mode visibly governs behavior: manual escalates all bids, assisted escalates risky/high-value ones, autonomous bids freely within rules.
  2. Risky or high-value bids land in an approval queue instead of executing, with the agent's status reflecting "needs review."
  3. User can approve, reject, or edit the ad copy on a queued bid; approved bids then execute and appear in the live feed.
  4. A decision log records each escalation's reason and the human's resolution (approved/rejected/edited).
  5. The full demo flow runs end-to-end without intervention beyond the scripted human approval: create travel-brand agent → start simulation → see safe bids won, unsafe skipped, one risky bid escalated and resolved → analytics reflect the run.
**Plans:** TBD
**UI hint:** yes

### Phase 5: Overmind Agent Supervision
**Goal:** AgentBid Studio emits enough structured agent telemetry for Overmind to supervise bidding behavior, catch anomalous decisions, and support future optimizer/fine-tuning workflows.
**Mode:** production-readiness
**Depends on:** Phase 4
**Requirements:** OBS-01, OBS-02, OBS-03, OBS-04
**Success Criteria** (what must be TRUE):
  1. Real LLM calls used for intent/risk scoring or generated ad copy are instrumented with Overmind's JS/TS tracing SDK on the server side.
  2. Each bid decision is represented as a traceable workflow with campaign config, opportunity prompt, policy checks, decision, bid amount, generated ad, and human-review outcome where applicable.
  3. The app exposes clear deployment configuration for `OVERMIND_API_KEY`, deployment environment, and provider keys without making Overmind required for the local hackathon demo.
  4. A small evaluation dataset and policy description exist so the bidding agent can later be registered with the Overmind optimizer.
**Plans:** TBD
**UI hint:** optional

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Agent Studio Shell | 1/1 | Planned | - |
| 2. Live Bidding Simulation | 0/0 | Not started | - |
| 3. Analytics & Safety Rails | 0/1 | Planned | - |
| 4. Human-in-the-Loop & Demo Polish | 0/0 | Not started | - |
| 5. Overmind Agent Supervision | 0/0 | Deferred | - |
