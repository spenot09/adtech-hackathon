---
phase: 05-overmind-agent-optimization
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/agent/decideBid.ts
  - src/agent/prompts.ts
  - lib/simulation/decide.ts
  - lib/simulation/engine.ts
  - package.json
autonomous: true
requirements:
  - OPT-02
must_haves:
  truths:
    - "A single function `decideBid(opportunity, agentConfig)` exists at a stable module path and is the only entrypoint Overmind needs to replay the bid decision."
    - "decideBid uses an OpenAI chat completion to produce {decision, bidAmount, reason}, with rule-based guardrails (blocked categories, max CPC, daily budget) applied as a post-LLM safety pass that can override the LLM."
    - "The simulation engine calls decideBid for every active agent per tick and the resulting object is shape-compatible with the existing `Decision` type."
  artifacts:
    - path: "src/agent/decideBid.ts"
      provides: "decideBid(opportunity, agentConfig) entrypoint + baselinePrompt export"
      exports: ["decideBid", "baselinePrompt", "BidDecision"]
    - path: "src/agent/prompts.ts"
      provides: "baselinePrompt string (system prompt) the optimizer will replace"
      exports: ["baselinePrompt"]
  key_links:
    - from: "lib/simulation/engine.ts"
      to: "src/agent/decideBid.ts"
      via: "import { decideBid } from '@/src/agent/decideBid'"
      pattern: "decideBid\\("
    - from: "src/agent/decideBid.ts"
      to: "openai"
      via: "new OpenAI().chat.completions.create"
      pattern: "chat\\.completions\\.create"
---

<objective>
Refactor the bid decision into a single, replayable entrypoint `decideBid(opportunity, agentConfig)` that Overmind can register, trace, and optimize. The function wraps a single OpenAI chat completion using a `baselinePrompt`, parses the LLM JSON output into `{decision, bidAmount, reason}`, and then runs deterministic safety guardrails (blocked categories, max CPC, daily budget, autonomy mode → manual always returns `review`) as a post-LLM override layer.

Purpose: Overmind needs ONE function with a clean signature as its replay target. The current `decide()` is pure rule-based with no LLM call — this plan introduces the LLM call (the artifact Overmind will optimize) while preserving the existing rule-based safety behavior as a guardrail layer. The engine is rewired to call the new entrypoint.

Output: `src/agent/decideBid.ts`, `src/agent/prompts.ts`, updated engine import. OpenAI added as a runtime dependency.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@lib/types/agent.ts
@lib/simulation/decide.ts
@lib/simulation/engine.ts

<interfaces>
From lib/types/agent.ts:
- `Agent`: { id, name, brand: Brand, goal, dailyBudgetCap, maxCpc, autonomyMode: "manual"|"assisted"|"autonomous", targetIntents: Intent[], blockedCategories: string[], status, spend }
- `Opportunity`: { id, timestamp, query, intent: Intent, category: string, suggestedCpc: number }
- `RelevanceScore`: { matchedKeywords: string[], intentMatched: boolean, score: number }
- `Decision`: { agentId, opportunityId, action: "bid"|"skip"|"block"|"review", bidAmount?, reason, relevance, won?, ad? }

The existing `decide(agent, opp, relevance): Decision` in `lib/simulation/decide.ts` is rule-based and returns synchronously. The engine calls it inside a tick loop.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install openai and create decideBid entrypoint with baseline prompt</name>
  <files>package.json, src/agent/decideBid.ts, src/agent/prompts.ts</files>
  <read_first>package.json, lib/types/agent.ts, lib/simulation/decide.ts</read_first>
  <action>
    Run `npm install openai` (no version pin — use latest). Per OPT-02, create `src/agent/prompts.ts` exporting `baselinePrompt` — a system prompt string that instructs the model to act as a bidding agent and return a strict JSON object `{"decision": "bid"|"skip"|"block"|"review", "bidAmount": number|null, "reason": string}` given an opportunity + agent config. The prompt MUST mention the five policy dimensions verbatim: blocked categories, max CPC, autonomy mode (manual=review, assisted=review for risky/high-value, autonomous=free within rules), target intent match favors bid, ambiguous high-value favors review.

    Create `src/agent/decideBid.ts` exporting:
    - Type `BidDecision = { decision: "bid"|"skip"|"block"|"review"; bidAmount: number | null; reason: string }`.
    - `async function decideBid(opportunity: Opportunity, agentConfig: Agent): Promise<BidDecision>` that:
      1. Lazy-instantiates a module-level `OpenAI` client (only once) using `process.env.OPENAI_API_KEY`.
      2. Calls `client.chat.completions.create` with `model: "gpt-4o-mini"`, `response_format: { type: "json_object" }`, system message = `baselinePrompt`, user message = a JSON.stringified payload of `{ opportunity, agentConfig: { maxCpc, dailyBudgetCap, spend, autonomyMode, targetIntents, blockedCategories, brand: { name, keywords }, goal } }`.
      3. Parses the JSON response into a `BidDecision`. On parse failure, fall back to `{ decision: "review", bidAmount: null, reason: "LLM output unparseable — escalating." }`.
      4. Applies safety guardrails as a post-LLM override (these MUST win against the LLM): if `opportunity.category` is in `agentConfig.blockedCategories` → force `decision="block"`; if `bidAmount` > `agentConfig.maxCpc` → clamp to `agentConfig.maxCpc`; if `agentConfig.spend + bidAmount > agentConfig.dailyBudgetCap` → force `decision="skip"` with budget reason; if `agentConfig.autonomyMode === "manual"` and `decision === "bid"` → force `decision="review"`.
      5. Returns the final `BidDecision`.

    Re-export `baselinePrompt` from `src/agent/decideBid.ts` so the demo toggle (Plan 04) can import both from one path.

    Do NOT remove the existing `lib/simulation/decide.ts` yet — the engine still references its `Decision` shape. The engine rewire happens in Task 2.
  </action>
  <acceptance_criteria>
    - `npm ls openai` lists openai with a resolved version.
    - `src/agent/decideBid.ts` exists and exports `decideBid`, `baselinePrompt`, `BidDecision`.
    - `grep -n "chat.completions.create" src/agent/decideBid.ts` matches exactly one line.
    - `grep -nE "blockedCategories|maxCpc|dailyBudgetCap|autonomyMode|manual" src/agent/decideBid.ts | wc -l` is ≥ 4 (guardrails present).
    - `grep -nE "blocked categories|max CPC|autonomy|target intent|ambiguous high-value" src/agent/prompts.ts | wc -l` is ≥ 5 (all five policy dimensions encoded in baseline prompt).
    - `npm run type-check` passes.
  </acceptance_criteria>
  <done>decideBid is the single LLM-backed entrypoint with deterministic post-LLM safety guardrails; baselinePrompt is exported and ready for Plan 04 to swap.</done>
  <verify>
    <automated>npm run type-check &amp;&amp; test -f src/agent/decideBid.ts &amp;&amp; test -f src/agent/prompts.ts &amp;&amp; grep -q "chat.completions.create" src/agent/decideBid.ts &amp;&amp; grep -q "baselinePrompt" src/agent/decideBid.ts</automated>
  </verify>
</task>

<task type="auto">
  <name>Task 2: Rewire simulation engine to call decideBid and adapt to async</name>
  <files>lib/simulation/engine.ts, lib/simulation/decide.ts</files>
  <read_first>lib/simulation/engine.ts, lib/simulation/decide.ts, src/agent/decideBid.ts (from Task 1)</read_first>
  <action>
    Per OPT-02, the engine must use `decideBid` as the bid-decision entrypoint so Overmind's traces correspond to actual production calls. Update `lib/simulation/engine.ts`:
    - Import `decideBid` and `BidDecision` from `@/src/agent/decideBid`.
    - The per-agent block inside `tick()` becomes async: `await decideBid(opp, agent)` produces a `BidDecision`. Adapt it into the engine's existing `Decision` shape by attaching `agentId`, `opportunityId`, `relevance` (computed via existing `scoreRelevance`), and mapping `decision` → `action`, `bidAmount` → `bidAmount` (omit if null), `reason` → `reason`. Win-rate simulation and ad attachment logic is unchanged.
    - Change `tick()` to `async function tick()`. Use `await Promise.all` for the per-agent loop so all agents decide in parallel for a given opportunity (matches existing semantics — one opportunity per tick, all agents react). The `setTimeout(tick, delay)` scheduling still works with async (Promise rejection should be caught with `.catch(err => console.error("tick failed", err))` to avoid unhandled rejections halting the timer).
    - Keep `lib/simulation/decide.ts` on disk but mark it deprecated with a top-of-file comment `// DEPRECATED: replaced by src/agent/decideBid.ts in Phase 5. Retained for reference until removed.` — do not delete (a future cleanup phase will).
  </action>
  <acceptance_criteria>
    - `grep -n "decideBid" lib/simulation/engine.ts` matches at least one import and one call site.
    - `grep -n "from \"@/lib/simulation/decide\"" lib/simulation/engine.ts` returns zero results (old import removed).
    - `grep -n "async function tick" lib/simulation/engine.ts` matches.
    - `grep -n "DEPRECATED" lib/simulation/decide.ts` matches (top-of-file marker present).
    - `npm run type-check` passes.
    - `npm run build` passes (Next.js build succeeds).
  </acceptance_criteria>
  <done>The engine drives every bid decision through `decideBid`; Overmind will see every production tick as a trace once Plan 02 initializes tracing.</done>
  <verify>
    <automated>npm run type-check &amp;&amp; npm run build &amp;&amp; grep -q "decideBid" lib/simulation/engine.ts &amp;&amp; ! grep -q "from \"@/lib/simulation/decide\"" lib/simulation/engine.ts</automated>
  </verify>
</task>

</tasks>

<verification>
- `src/agent/decideBid.ts` and `src/agent/prompts.ts` exist and export the documented symbols.
- The simulation engine calls `decideBid` and no longer imports from `lib/simulation/decide.ts`.
- `npm run type-check` and `npm run build` both succeed.
- Existing simulation behavior is preserved end-to-end: blocked categories still block, max CPC still caps, daily budget still stops bidding, manual autonomy still escalates — all enforced by the post-LLM guardrail layer regardless of what the LLM returns.
</verification>

<success_criteria>
A single async function `decideBid(opportunity, agentConfig): Promise<BidDecision>` is the only LLM-call entrypoint for bid decisions. The simulation engine uses it. The baseline prompt encoding all five policy dimensions is exported separately so Plan 04 can flip between baseline and optimized.
</success_criteria>

<output>
Create `.planning/phases/05-overmind-agent-optimization/05-01-SUMMARY.md` when done. Include the final `decideBid` signature and the `baselinePrompt` first/last 80 chars so downstream plans can reference them.
</output>
