# AgentBid Studio

Buy-side dashboard for brands creating AI bidding agents for conversational ad inventory.

The product idea: advertisers should be able to give an agent a campaign goal, budget, safety rules, and autonomy level, then watch it bid on chat-native ad opportunities in real time. The agent can generate sponsored answers, track spend and performance, and escalate risky decisions to a human before money is committed.

## Hackathon Context

Built for the ad infrastructure for AI hackathon in London, 28 May 2026.

Track focus: **Buy-Side Agents**.

Core question: when can an agent autonomously bid and spend inside LLM channels, and when should a human review the decision?

## MVP

The 4-hour version should prioritize a convincing demo over real ad infrastructure.

### Dashboard

- Campaign / agent name
- Brand and campaign goal
- Budget cap and max CPC
- Autonomy mode: manual, assisted, or autonomous
- Live status: active, paused, or needs review
- Spend progress and remaining budget

### Bidding

- Simulated stream of conversational ad opportunities
- Intent detection for each prompt
- Agent decision: bid, skip, block, or review
- Bid amount and reason

### Generated Ad

- Plain-text sponsored response for successful bids
- Optional card-style preview if time allows

### Analytics

- Spend
- Remaining budget
- Impressions
- Bids won
- Clicks
- Conversions
- Average CPC
- ROAS
- Skipped unsafe placements

### Safety Controls

- Daily budget cap
- Max CPC
- Blocked categories
- Autonomy mode
- Pause / kill switch

### Human Intervention

- Approval queue for risky or high-value bids
- Actions: approve, reject, or edit ad copy
- Decision log showing why the agent escalated

## Priority Order

Priority is still undecided.

Candidate order discussed so far:

1. Dashboard
2. Bidding
3. Generated ad format, plain text or app-style card
4. Analytics
5. Dashboard safety controls
6. Human intervention

## Demo Flow

1. Create a travel brand bidding agent.
2. Set budget, max CPC, target intents, blocked categories, and autonomy level.
3. Start the live bidding simulation.
4. Show the agent bidding on safe travel prompts.
5. Show the agent skipping or blocking unsafe prompts.
6. Show one risky prompt escalated for human approval.
7. Show analytics updating as simulated events run.

## One-Line Pitch

AgentBid Studio lets brands create bounded bidding agents for AI chat inventory, with spend caps, policy rules, live bidding decisions, generated ads, analytics, and human approval for risky placements.

## Local Setup

1. Copy the example env file: `cp .env.example .env.local`
2. Fill in `OPENAI_API_KEY` (required for LLM-backed bid decisions)
3. Fill in `OVERMIND_API_KEY` (optional — enables tracing at console.overmindlab.ai)
4. Install dependencies and start the dev server: `npm install && npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)
