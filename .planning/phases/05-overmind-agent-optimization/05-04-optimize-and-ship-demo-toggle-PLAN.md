---
phase: 05-overmind-agent-optimization
plan: 04
type: execute
wave: 3
depends_on:
  - 05-03
files_modified:
  - src/agent/prompts.ts
  - src/agent/decideBid.ts
  - lib/simulation/store.ts
  - components/live-feed/LiveFeedPanel.tsx
  - app/demo/live/page.tsx
  - .planning/phases/05-overmind-agent-optimization/optimizer-run.md
autonomous: false
requirements:
  - OPT-05
must_haves:
  truths:
    - "`/overmind-optimize-agent` has been run and produced an accepted candidate prompt that beats the baseline on the eval (delta ≥ 0.05)."
    - "The accepted prompt is committed to the repo as `optimizedPrompt` in `src/agent/prompts.ts`; `baselinePrompt` is preserved unchanged."
    - "`decideBid` accepts an optional `{ promptVariant: 'baseline' | 'optimized' }` argument; the simulation store exposes a runtime toggle defaulting to `'optimized'`."
    - "The demo page renders a baseline-vs-optimized toggle and a small comparison card showing the before/after score recorded from the optimizer run."
    - "A phase-level note `optimizer-run.md` records the before/after mean scores and the diff-report URL on `console.overmindlab.ai/agents`."
  artifacts:
    - path: "src/agent/prompts.ts"
      provides: "Both baselinePrompt and optimizedPrompt exports"
      exports: ["baselinePrompt", "optimizedPrompt"]
    - path: ".planning/phases/05-overmind-agent-optimization/optimizer-run.md"
      provides: "Before/after scores and console.overmindlab.ai diff report link"
      min_lines: 10
    - path: "components/live-feed/LiveFeedPanel.tsx"
      provides: "Baseline/Optimized toggle UI and comparison card"
      contains: "promptVariant"
  key_links:
    - from: "components/live-feed/LiveFeedPanel.tsx"
      to: "lib/simulation/store.ts"
      via: "setPromptVariant"
      pattern: "promptVariant"
    - from: "lib/simulation/engine.ts"
      to: "src/agent/decideBid.ts"
      via: "decideBid(opp, agent, { promptVariant })"
      pattern: "promptVariant"
---

<objective>
Run the optimizer, ship the accepted prompt as `optimizedPrompt`, and wire a baseline-vs-optimized toggle into the demo so the hackathon presentation can flip between the two and show a measurable score delta.

Purpose: OPT-05 requires `/overmind-optimize-agent` to produce an accepted candidate that beats baseline, the accepted prompt committed, and a before/after score in phase verification notes. The demo angle (per the integration sketch) requires a UI toggle so the audience sees the optimization payoff live.

Output: Optimizer run notes, `optimizedPrompt` committed, `decideBid` accepting a `promptVariant` option, store toggle, demo UI toggle + comparison card.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-overmind-agent-optimization/05-01-SUMMARY.md
@.planning/phases/05-overmind-agent-optimization/05-03-SUMMARY.md
@src/agent/decideBid.ts
@src/agent/prompts.ts
@lib/simulation/store.ts
@components/live-feed/LiveFeedPanel.tsx
@app/demo/live/page.tsx

<interfaces>
From Plan 01:
- `decideBid(opportunity: Opportunity, agentConfig: Agent): Promise<BidDecision>` — to be extended in this plan with optional third arg `{ promptVariant?: "baseline" | "optimized" }`.
- `baselinePrompt: string` exported from `src/agent/prompts.ts`.

From Plan 03:
- `.overmind/agents.toml`, `.overmind/policy.md`, `.overmind/eval-spec.md`, `data/bid-decision-cases.json` are all in place.

From existing simulation store (`lib/simulation/store.ts`):
- A pub/sub store exposing `simulationStore.agents`, `simulationStore.emit()`, etc. Extend with `promptVariant` state + setter.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Run /overmind-optimize-agent and capture the diff report</name>
  <files>src/agent/prompts.ts, .planning/phases/05-overmind-agent-optimization/optimizer-run.md</files>
  <read_first>.overmind/agents.toml, .overmind/policy.md, .overmind/eval-spec.md, data/bid-decision-cases.json, src/agent/prompts.ts</read_first>
  <action>
    Per OPT-05, invoke the Claude Code skill `/overmind-optimize-agent` from within the repo. The skill runs the optimize loop in parallel git worktrees and writes a diff report at `console.overmindlab.ai/agents`.

    Required inputs (confirm before launching the skill): `OVERMIND_API_KEY` and `OPENAI_API_KEY` are set; `.overmind/agents.toml` registers `decideBid`; the dataset and policy/eval-spec are in place.

    After the skill completes:
    1. Open the diff report URL. Identify the accepted candidate prompt.
    2. Add it to `src/agent/prompts.ts` as `export const optimizedPrompt = \`...\``. DO NOT modify `baselinePrompt` — both must coexist.
    3. Create `.planning/phases/05-overmind-agent-optimization/optimizer-run.md` containing:
       - The diff report URL.
       - Baseline mean score.
       - Optimized mean score.
       - Delta (must be ≥ 0.05; if not, re-run with more candidates or note the failure for the human checkpoint).
       - Per-`reasonCategory` score breakdown (baseline vs optimized).
       - Date of the run.

    If the optimizer fails to produce a candidate that beats baseline by ≥ 0.05 after a reasonable number of attempts, still commit `optimizedPrompt` as the best candidate and flag the gap in the human checkpoint — do not fabricate scores.
  </action>
  <acceptance_criteria>
    - `grep -n "optimizedPrompt" src/agent/prompts.ts` matches.
    - `grep -n "baselinePrompt" src/agent/prompts.ts` still matches (preserved).
    - `.planning/phases/05-overmind-agent-optimization/optimizer-run.md` exists and contains the strings `Baseline mean score`, `Optimized mean score`, `Delta`, and a `console.overmindlab.ai` URL.
    - `npm run type-check` passes.
  </acceptance_criteria>
  <done>The accepted candidate is committed; before/after scores and the diff report URL are recorded for verification notes.</done>
  <verify>
    <automated>npm run type-check &amp;&amp; grep -q "optimizedPrompt" src/agent/prompts.ts &amp;&amp; grep -q "baselinePrompt" src/agent/prompts.ts &amp;&amp; grep -q "Baseline mean score" .planning/phases/05-overmind-agent-optimization/optimizer-run.md &amp;&amp; grep -q "Optimized mean score" .planning/phases/05-overmind-agent-optimization/optimizer-run.md &amp;&amp; grep -q "console.overmindlab.ai" .planning/phases/05-overmind-agent-optimization/optimizer-run.md</automated>
  </verify>
</task>

<task type="auto">
  <name>Task 2: Add promptVariant option to decideBid and a runtime toggle in the store</name>
  <files>src/agent/decideBid.ts, lib/simulation/store.ts, lib/simulation/engine.ts</files>
  <read_first>src/agent/decideBid.ts, src/agent/prompts.ts, lib/simulation/store.ts, lib/simulation/engine.ts</read_first>
  <action>
    Extend `decideBid` to accept an optional third arg: `decideBid(opportunity, agentConfig, opts?: { promptVariant?: "baseline" | "optimized" })`. Default `promptVariant` to `"optimized"`. Inside the function, pick the system-prompt string by variant: `baselinePrompt` when `"baseline"`, `optimizedPrompt` when `"optimized"`. The rest of the function (LLM call, JSON parse, guardrails) is unchanged.

    Extend `lib/simulation/store.ts`:
    - Add state `promptVariant: "baseline" | "optimized"` (default `"optimized"`).
    - Add `setPromptVariant(v)` that updates state and calls `emit()` so subscribers re-render.
    - Expose `promptVariant` in whatever shape subscribers already consume from the store.

    Update `lib/simulation/engine.ts`: when calling `decideBid`, pass `{ promptVariant: simulationStore.promptVariant }`.

    These changes must not break the existing engine tick loop or type-check.
  </action>
  <acceptance_criteria>
    - `grep -n "promptVariant" src/agent/decideBid.ts` matches.
    - `grep -n "optimizedPrompt" src/agent/decideBid.ts` matches.
    - `grep -nE "promptVariant|setPromptVariant" lib/simulation/store.ts | wc -l` ≥ 2.
    - `grep -n "promptVariant" lib/simulation/engine.ts` matches.
    - `npm run type-check` passes.
    - `npm run build` passes.
  </acceptance_criteria>
  <done>The engine drives every decision through the variant currently selected in the store; switching the toggle takes effect on the next tick.</done>
  <verify>
    <automated>npm run type-check &amp;&amp; npm run build &amp;&amp; grep -q "promptVariant" src/agent/decideBid.ts &amp;&amp; grep -q "promptVariant" lib/simulation/store.ts &amp;&amp; grep -q "promptVariant" lib/simulation/engine.ts</automated>
  </verify>
</task>

<task type="auto">
  <name>Task 3: Add baseline/optimized toggle + comparison card to the demo UI</name>
  <files>components/live-feed/LiveFeedPanel.tsx, app/demo/live/page.tsx</files>
  <read_first>components/live-feed/LiveFeedPanel.tsx, app/demo/live/page.tsx, lib/simulation/store.ts, .planning/phases/05-overmind-agent-optimization/optimizer-run.md</read_first>
  <action>
    In `components/live-feed/LiveFeedPanel.tsx`, add a small control row above the feed with two segmented-button options labeled "Baseline" and "Overmind-optimized". Selecting one calls `simulationStore.setPromptVariant("baseline" | "optimized")`. The active variant is highlighted.

    Adjacent to the toggle, render a comparison card showing the two scores recorded in `optimizer-run.md`. These can be hardcoded as constants in this component (read once during this task from `optimizer-run.md` and inlined) — no need to parse the markdown at runtime. The card shows: "Baseline: X.XX  Optimized: Y.YY  Delta: +Z.ZZ".

    If `app/demo/live/page.tsx` needs to expose anything new (e.g. a section heading mentioning the toggle), update the header copy to mention "Toggle Baseline vs Overmind-optimized to compare." — keep it under one line.

    Styling: match existing Tailwind dark theme used in the panel.
  </action>
  <acceptance_criteria>
    - `grep -nE "Baseline|Overmind-optimized" components/live-feed/LiveFeedPanel.tsx | wc -l` ≥ 2.
    - `grep -n "setPromptVariant" components/live-feed/LiveFeedPanel.tsx` matches.
    - `grep -nE "Delta|Baseline:|Optimized:" components/live-feed/LiveFeedPanel.tsx | wc -l` ≥ 2 (comparison card present).
    - `npm run build` passes.
  </acceptance_criteria>
  <done>The demo page has a working toggle and a visible before/after score card.</done>
  <verify>
    <automated>npm run build &amp;&amp; grep -q "setPromptVariant" components/live-feed/LiveFeedPanel.tsx &amp;&amp; grep -q "Overmind-optimized" components/live-feed/LiveFeedPanel.tsx</automated>
  </verify>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Plan 04 has run `/overmind-optimize-agent`, committed `optimizedPrompt`, wired a `promptVariant` toggle through `decideBid` → engine → store → demo UI, and added a comparison card with the before/after scores. `optimizer-run.md` records the diff-report URL.</what-built>
  <how-to-verify>
    1. Run `npm run dev` with both `OPENAI_API_KEY` and `OVERMIND_API_KEY` set in `.env.local`.
    2. Open the demo page (`/demo/live`).
    3. Confirm the "Baseline / Overmind-optimized" toggle is visible and the comparison card shows the recorded scores.
    4. Click "Baseline" — within one tick the live feed should reflect baseline-style decisions (use the trace view on console.overmindlab.ai to confirm the request body is using `baselinePrompt`).
    5. Click "Overmind-optimized" — confirm the next traces use `optimizedPrompt`.
    6. Open `console.overmindlab.ai/agents` and confirm the diff report URL in `optimizer-run.md` resolves and shows the accepted candidate.
    7. Confirm the recorded Delta ≥ 0.05; if not, decide whether to re-run the optimizer or accept the gap with a note in the SUMMARY.
  </how-to-verify>
  <resume-signal>Type "approved" or describe what to fix.</resume-signal>
</task>

</tasks>

<verification>
- `optimizedPrompt` is exported from `src/agent/prompts.ts`; `baselinePrompt` is preserved.
- `decideBid` accepts a `promptVariant` option, defaulting to `"optimized"`.
- The simulation store exposes `promptVariant` + `setPromptVariant`; the engine passes it through.
- The demo UI shows a toggle and a comparison card with the recorded baseline/optimized scores.
- `optimizer-run.md` records baseline score, optimized score, delta, and a diff-report URL on `console.overmindlab.ai`.
- `npm run build` passes.
- Human-verified end-to-end: live demo flips between variants and traces appear in the Overmind console.
</verification>

<success_criteria>
OPT-05 is satisfied: `/overmind-optimize-agent` ran to completion, produced an accepted candidate, the optimized prompt is committed alongside the preserved baseline, before/after scores are recorded in the verification notes, and the demo UI flips between variants for the hackathon presentation.
</success_criteria>

<output>
Create `.planning/phases/05-overmind-agent-optimization/05-04-SUMMARY.md` when done. Include the final baseline score, optimized score, delta, and the diff-report URL. Confirm the toggle works end-to-end.
</output>
