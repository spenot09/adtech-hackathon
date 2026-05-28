---
phase: 05-overmind-agent-optimization
plan: 03
type: execute
wave: 2
depends_on:
  - 05-01
  - 05-02
files_modified:
  - .overmind/agents.toml
  - .overmind/policy.md
  - .overmind/eval-spec.md
  - data/bid-decision-cases.json
autonomous: false
requirements:
  - OPT-03
  - OPT-04
must_haves:
  truths:
    - "The bid-decision agent is registered in `.overmind/agents.toml` with `src/agent/decideBid.ts#decideBid` as the entrypoint."
    - "A policy document encodes all six rule sections in plain prose that the optimizer + eval scorer can read."
    - "A hand-crafted dataset of 20–30 opportunity cases exists at `data/bid-decision-cases.json` covering safe / unsafe / ambiguous / high-value mixes."
    - "The eval spec describes how to score a candidate decision against expected_output and against the policy rules."
  artifacts:
    - path: ".overmind/agents.toml"
      provides: "Overmind agent registration pointing at decideBid"
      contains: "decideBid"
    - path: ".overmind/policy.md"
      provides: "Plain-prose encoding of the bid rules"
      min_lines: 25
    - path: ".overmind/eval-spec.md"
      provides: "Eval rubric and scoring methodology"
      min_lines: 15
    - path: "data/bid-decision-cases.json"
      provides: "Hand-crafted dataset of 20–30 cases"
      min_lines: 200
  key_links:
    - from: ".overmind/agents.toml"
      to: "src/agent/decideBid.ts"
      via: "entrypoint path"
      pattern: "decideBid"
    - from: ".overmind/policy.md"
      to: "src/agent/prompts.ts"
      via: "policy dimensions must match baselinePrompt"
      pattern: "max CPC"
---

<objective>
Register the bid-decision agent with Overmind, author the policy + eval spec documents that encode the project's bid rules, and hand-craft the 20–30-case opportunity dataset that the optimizer will score candidates against.

Purpose: OPT-03 requires a policy + eval spec in agreement with the registered agent. OPT-04 requires a hand-crafted dataset with safe / unsafe / ambiguous / high-value mixes. Both are inputs to `/overmind-optimize-agent` (run in Plan 04). The agent registration step uses the Claude Code skill `/overmind-register-agent` which writes `.overmind/agents.toml` based on the `decideBid` entrypoint from Plan 01.

Output: `.overmind/agents.toml`, `.overmind/policy.md`, `.overmind/eval-spec.md`, `data/bid-decision-cases.json`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-overmind-agent-optimization/05-01-SUMMARY.md
@.planning/phases/05-overmind-agent-optimization/05-02-SUMMARY.md
@lib/types/agent.ts
@src/agent/decideBid.ts
@src/agent/prompts.ts

<interfaces>
From `src/agent/decideBid.ts` (Plan 01):
- Entrypoint: `async function decideBid(opportunity: Opportunity, agentConfig: Agent): Promise<BidDecision>`
- `BidDecision = { decision: "bid"|"skip"|"block"|"review"; bidAmount: number | null; reason: string }`

Dataset case shape (validated from planning_context):
`{ "input": { "opportunity": {...}, "agentConfig": {...} }, "expected_output": { "decision": "bid|skip|block|review", "bidAmount": number|null, "reasonCategory": string } }`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Hand-craft the 20–30-case bid-decision dataset</name>
  <files>data/bid-decision-cases.json</files>
  <read_first>lib/types/agent.ts, src/agent/decideBid.ts, src/agent/prompts.ts, lib/simulation/opportunities.ts, lib/simulation/fixtures.ts</read_first>
  <action>
    Per OPT-04, create `data/bid-decision-cases.json` as a JSON array of 26 cases (within the 20–30 range). Each element has shape `{ "input": { "opportunity": Opportunity, "agentConfig": Agent }, "expected_output": { "decision": "bid"|"skip"|"block"|"review", "bidAmount": number|null, "reasonCategory": string } }`. Pull plausible intents/categories from `lib/simulation/opportunities.ts` and plausible agent configs from `lib/simulation/fixtures.ts`.

    Distribution (must hit each bucket):
    - 6 safe-bid cases: target-intent match, suggestedCpc well under maxCpc, not blocked, autonomy=autonomous or assisted → `decision: "bid"`, reasonCategory `"safe_bid"`.
    - 5 blocked-category cases: opportunity.category in blockedCategories → `decision: "block"`, `"blocked_category"`.
    - 4 over-max-CPC cases: suggestedCpc > maxCpc → `decision: "skip"`, `"over_max_cpc"`.
    - 3 over-budget cases: spend + suggestedCpc > dailyBudgetCap → `decision: "skip"`, `"over_budget"`.
    - 3 low-relevance cases: intent not in targetIntents and keyword mismatch → `decision: "skip"`, `"low_relevance"`.
    - 2 manual-mode cases: autonomyMode="manual", otherwise safe → `decision: "review"`, `"manual_mode"`.
    - 3 ambiguous high-value cases: suggestedCpc ≥ 90% of maxCpc, target intent match, autonomyMode="assisted" → `decision: "review"`, `"high_value_escalation"`.

    Total = 26. Each case must have a unique `input.opportunity.id` like `case-001`...`case-026`. Validate it parses before finalizing.
  </action>
  <acceptance_criteria>
    - `data/bid-decision-cases.json` exists and parses as JSON.
    - Case count is in [20, 30].
    - All seven reasonCategory values appear at least once: `safe_bid`, `blocked_category`, `over_max_cpc`, `over_budget`, `low_relevance`, `manual_mode`, `high_value_escalation`.
    - Every case has `input.opportunity`, `input.agentConfig`, and `expected_output.decision` populated.
  </acceptance_criteria>
  <done>Dataset is ready for the optimizer to consume; every reason category is represented.</done>
  <verify>
    <automated>node -e "const c=JSON.parse(require('fs').readFileSync('data/bid-decision-cases.json','utf8'));if(c.length<20||c.length>30)process.exit(1);const r=new Set(c.map(x=>x.expected_output.reasonCategory));for(const k of ['safe_bid','blocked_category','over_max_cpc','over_budget','low_relevance','manual_mode','high_value_escalation'])if(!r.has(k))process.exit(2);for(const x of c)if(!x.input||!x.input.opportunity||!x.input.agentConfig||!x.expected_output||!x.expected_output.decision)process.exit(3)"</automated>
  </verify>
</task>

<task type="auto">
  <name>Task 2: Author policy.md and eval-spec.md</name>
  <files>.overmind/policy.md, .overmind/eval-spec.md</files>
  <read_first>src/agent/prompts.ts, src/agent/decideBid.ts, data/bid-decision-cases.json</read_first>
  <action>
    Per OPT-03, create two prose documents under `.overmind/`. Both must agree with the rules encoded in `src/agent/prompts.ts` and the guardrail layer in `src/agent/decideBid.ts` — if they drift the optimizer will optimize toward the wrong target.

    `.overmind/policy.md` — six H2 sections:
    - `## Blocked Categories`: when `opportunity.category` is in `agentConfig.blockedCategories`, decision MUST be `block`. Hard rule.
    - `## Max CPC Ceiling`: `bidAmount` MUST be ≤ `agentConfig.maxCpc`. Hard rule.
    - `## Daily Budget Cap`: if `agentConfig.spend + bidAmount` > `agentConfig.dailyBudgetCap`, decision MUST be `skip`. Hard rule.
    - `## Autonomy Mode`: `manual` → ALL bids become `review`; `assisted` → risky / high-value bids become `review`; `autonomous` → bid freely within other rules.
    - `## Target Intent Match`: opportunities whose `intent` is in `agentConfig.targetIntents` favor `bid`. Soft rule.
    - `## Ambiguous High-Value`: when `suggestedCpc` ≥ 90% of `maxCpc` AND intent match is borderline, prefer `review`. Soft rule.

    `.overmind/eval-spec.md` — four H2 sections:
    - `## Scoring`: exact-match on `decision` is the primary metric (1.0 correct, 0 incorrect). If `decision === "bid"`, +0.25 bonus when `bidAmount` is within ±20% of `agentConfig.maxCpc * 0.7` (or the case's expected bidAmount if provided).
    - `## Hard-Rule Violations`: any candidate that violates a hard rule on a case scores 0 for that case regardless of other factors.
    - `## Aggregation`: mean score across the dataset; report a per-`reasonCategory` breakdown.
    - `## Baseline vs Candidate`: the harness runs both `baselinePrompt` and the candidate prompt across the same dataset; accept the candidate only if mean score beats baseline by ≥ 0.05.
  </action>
  <acceptance_criteria>
    - `.overmind/policy.md` exists with all six H2 headings present.
    - `.overmind/eval-spec.md` exists with all four H2 headings present.
    - `wc -l .overmind/policy.md` ≥ 25.
    - `wc -l .overmind/eval-spec.md` ≥ 15.
  </acceptance_criteria>
  <done>Policy + eval spec are committed and aligned with the dataset's reason categories and the baseline prompt's policy dimensions.</done>
  <verify>
    <automated>test -f .overmind/policy.md &amp;&amp; test -f .overmind/eval-spec.md &amp;&amp; [ "$(grep -cE '^## (Blocked Categories|Max CPC Ceiling|Daily Budget Cap|Autonomy Mode|Target Intent Match|Ambiguous High-Value)' .overmind/policy.md)" = "6" ] &amp;&amp; [ "$(grep -cE '^## (Scoring|Hard-Rule Violations|Aggregation|Baseline vs Candidate)' .overmind/eval-spec.md)" = "4" ]</automated>
  </verify>
</task>

<task type="auto">
  <name>Task 3: Run /overmind-register-agent to generate .overmind/agents.toml</name>
  <files>.overmind/agents.toml</files>
  <read_first>src/agent/decideBid.ts, .overmind/policy.md, .overmind/eval-spec.md</read_first>
  <action>
    Per OPT-02 / OPT-03, invoke the Claude Code skill `/overmind-register-agent` from within the repo. The skill discovers the agent entrypoint and writes `.overmind/agents.toml`. When the skill prompts for the entrypoint, point it at `src/agent/decideBid.ts` with exported symbol `decideBid` and input shape `{ opportunity: Opportunity, agentConfig: Agent }`, output shape `BidDecision`.

    After the skill completes, verify `.overmind/agents.toml` references `decideBid` and `src/agent/decideBid.ts`. If the skill emits any cross-reference fields for policy/dataset paths, fill them with `.overmind/policy.md`, `.overmind/eval-spec.md`, `data/bid-decision-cases.json`.

    Do NOT hand-edit the structure of `.overmind/agents.toml` beyond filling in the paths above — let the skill own the format.
  </action>
  <acceptance_criteria>
    - `.overmind/agents.toml` exists.
    - `grep -n "decideBid" .overmind/agents.toml` matches.
    - `grep -n "src/agent/decideBid" .overmind/agents.toml` matches.
  </acceptance_criteria>
  <done>The agent is registered with Overmind; the optimizer in Plan 04 can find the replay target.</done>
  <verify>
    <automated>test -f .overmind/agents.toml &amp;&amp; grep -q "decideBid" .overmind/agents.toml &amp;&amp; grep -q "src/agent/decideBid" .overmind/agents.toml</automated>
  </verify>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Plan 03 has produced: a 26-case hand-crafted dataset under `data/`, a policy doc + eval spec under `.overmind/`, and an `.overmind/agents.toml` registration emitted by `/overmind-register-agent`.</what-built>
  <how-to-verify>
    1. Open `data/bid-decision-cases.json` and skim 3–4 cases per bucket — confirm the opportunity/agentConfig fields look realistic (not placeholders) and the expected decisions match the bucket rules.
    2. Open `.overmind/policy.md` and confirm each rule reads cleanly in prose (an LLM optimizer will read this).
    3. Open `.overmind/eval-spec.md` and confirm the scoring rules are unambiguous.
    4. Open `.overmind/agents.toml` and confirm the entrypoint points at the right symbol/path.
  </how-to-verify>
  <resume-signal>Type "approved" or list issues to fix before Plan 04 runs the optimizer.</resume-signal>
</task>

</tasks>

<verification>
- `data/bid-decision-cases.json` is valid JSON, has 20–30 cases, covers all seven reason categories.
- `.overmind/policy.md` and `.overmind/eval-spec.md` exist with all required H2 sections.
- `.overmind/agents.toml` registers `decideBid` at `src/agent/decideBid.ts`.
- Human checkpoint approves the artifacts before Plan 04 runs the optimizer.
</verification>

<success_criteria>
OPT-03 and OPT-04 are satisfied: policy + eval spec encode the bid rules in agreement with the registered agent; a hand-crafted 20–30-case dataset under `data/` covers the required mix; the agent is registered in `.overmind/agents.toml` pointing at `decideBid`.
</success_criteria>

<output>
Create `.planning/phases/05-overmind-agent-optimization/05-03-SUMMARY.md` when done. Include the final case count and per-bucket breakdown; quote the entrypoint stanza from `.overmind/agents.toml`.
</output>
