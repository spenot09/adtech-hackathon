# AgentBid Studio — Requirements

## v1 Requirements

### Agent Configuration

- [ ] **AGENT-01**: User can create a bidding agent with a campaign/agent name and brand
- [ ] **AGENT-02**: User can set a campaign goal (free-text intent / objective) for the agent
- [ ] **AGENT-03**: User can set a daily budget cap and a max CPC for the agent
- [ ] **AGENT-04**: User can choose an autonomy mode: manual, assisted, or autonomous
- [ ] **AGENT-05**: User can specify target intents and blocked categories per agent

### Dashboard

- [ ] **DASH-01**: Dashboard lists configured agents with name, brand, and current status (active / paused / needs review)
- [ ] **DASH-02**: Dashboard shows live spend progress and remaining budget per agent
- [ ] **DASH-03**: User can pause and resume an agent from the dashboard (kill switch)

### Bidding Simulation

- [ ] **BID-01**: A simulated stream of conversational ad opportunities is generated continuously while an agent is active
- [ ] **BID-02**: Each opportunity is tagged with a detected intent (e.g., travel-booking, finance-advice, medical, etc.)
- [ ] **BID-03**: The agent produces a visible decision per opportunity: bid, skip, block, or review
- [ ] **BID-04**: Each decision includes the bid amount (when bidding) and a short human-readable reason
- [ ] **BID-05**: Bid outcomes (won/lost) update budget and metrics in real time

### Generated Ad

- [ ] **AD-01**: For each successful bid, the system generates a plain-text sponsored response tailored to the opportunity
- [ ] **AD-02**: The generated ad is displayed inline with the winning bid in the live feed

### Analytics

- [ ] **METRICS-01**: Analytics panel shows spend and remaining budget per agent
- [ ] **METRICS-02**: Analytics panel shows impressions, bids won, clicks, and conversions
- [ ] **METRICS-03**: Analytics panel shows average CPC and ROAS
- [ ] **METRICS-04**: Analytics panel shows count of skipped unsafe placements
- [ ] **METRICS-05**: Analytics update live as the simulation runs

### Safety Controls

- [ ] **SAFETY-01**: Agent enforces the daily budget cap and stops bidding when reached
- [ ] **SAFETY-02**: Agent enforces max CPC — never bids above the configured ceiling
- [ ] **SAFETY-03**: Agent automatically skips/blocks opportunities matching blocked categories
- [ ] **SAFETY-04**: Autonomy mode governs decision behavior (manual = always escalate, assisted = escalate risky, autonomous = bid freely within rules)

### Human Intervention

- [ ] **HUMAN-01**: Risky or high-value bids land in an approval queue instead of executing
- [ ] **HUMAN-02**: User can approve, reject, or edit ad copy on queued bids
- [ ] **HUMAN-03**: A decision log records why the agent escalated each queued bid and the human's resolution

### Demo Flow

- [ ] **DEMO-01**: End-to-end demo flow works: create travel-brand agent → configure → start simulation → see safe bids won, unsafe skipped, one risky bid escalated → see analytics update live

### Agent Optimization (Overmind)

- [ ] **OPT-01**: Overmind tracing SDK is initialized at app bootstrap; every bid-decision LLM call emits a trace (inputs, outputs, latency, tokens, cost) visible in the Overmind console
- [ ] **OPT-02**: The bid-decision agent is registered in `.overmind/agents.toml` with a single, replayable entrypoint that takes an opportunity + agent config and returns `{decision, bidAmount, reason}`
- [ ] **OPT-03**: A policy document and eval spec encode the bid rules (blocked categories, max CPC, autonomy modes, target intents, escalation) and are kept in agreement with the registered agent
- [ ] **OPT-04**: A dataset of 20–30 hand-crafted opportunities (safe / unsafe / ambiguous / high-value) lives under the agent's `data/` dir with `input` and `expected_output` per case
- [ ] **OPT-05**: `/overmind-optimize-agent` produces an accepted candidate that beats baseline on the eval; the optimized prompt is committed and a before/after score is recorded

## v2 Requirements (deferred)

- Card-style rich ad preview alongside the plain-text response
- Multiple concurrent agents bidding against each other in the same simulated stream
- Configurable simulation tempo / opportunity volume controls
- Export of decision log and analytics as CSV/JSON

## Out of Scope

- Real ad exchange or publisher integrations — demo prioritizes convincing simulation over wired infrastructure
- Real payments or billing — spend is simulated against the configured cap
- Multi-tenant auth / user management — single-user demo
- Persistent storage beyond the demo session — in-memory or local store is sufficient
- Production-grade observability, monitoring, or rate limiting — not needed for a 4-hour demo

## Traceability

| Requirement | Phase |
|-------------|-------|
| AGENT-01 | Phase 1 |
| AGENT-02 | Phase 1 |
| AGENT-03 | Phase 1 |
| AGENT-04 | Phase 1 |
| AGENT-05 | Phase 1 |
| DASH-01 | Phase 1 |
| BID-01 | Phase 2 |
| BID-02 | Phase 2 |
| BID-03 | Phase 2 |
| BID-04 | Phase 2 |
| BID-05 | Phase 2 |
| AD-01 | Phase 2 |
| AD-02 | Phase 2 |
| DASH-02 | Phase 2 |
| METRICS-01 | Phase 3 |
| METRICS-02 | Phase 3 |
| METRICS-03 | Phase 3 |
| METRICS-04 | Phase 3 |
| METRICS-05 | Phase 3 |
| SAFETY-01 | Phase 3 |
| SAFETY-02 | Phase 3 |
| SAFETY-03 | Phase 3 |
| DASH-03 | Phase 3 |
| SAFETY-04 | Phase 4 |
| HUMAN-01 | Phase 4 |
| HUMAN-02 | Phase 4 |
| HUMAN-03 | Phase 4 |
| DEMO-01 | Phase 4 |
| OPT-01 | Phase 5 |
| OPT-02 | Phase 5 |
| OPT-03 | Phase 5 |
| OPT-04 | Phase 5 |
| OPT-05 | Phase 5 |
