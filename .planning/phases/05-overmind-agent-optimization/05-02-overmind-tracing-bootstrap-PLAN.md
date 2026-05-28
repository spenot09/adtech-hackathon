---
phase: 05-overmind-agent-optimization
plan: 02
type: execute
wave: 2
depends_on: ["05-01"]
files_modified:
  - package.json
  - instrumentation.ts
  - next.config.js
  - .env.example
  - README.md
autonomous: true
requirements:
  - OPT-01
user_setup:
  - service: overmind
    why: "Tracing SDK requires an API key to publish traces to the Overmind console."
    env_vars:
      - name: OVERMIND_API_KEY
        source: "Overmind console -> Settings -> API Keys"
    dashboard_config: []
must_haves:
  truths:
    - "On Next.js server start, the Overmind tracing SDK initializes exactly once with appName='agentbid-studio' and the OpenAI provider registered."
    - "After init, every OpenAI chat completion (including those from decideBid in Plan 01) is auto-traced — no per-call wrapping is required."
    - "`.env.example` documents OVERMIND_API_KEY and OPENAI_API_KEY so a fresh clone can run the demo after one fill-in."
  artifacts:
    - path: "instrumentation.ts"
      provides: "Next.js instrumentation hook that boots Overmind tracing on server start"
      exports: ["register"]
    - path: ".env.example"
      provides: "Documented env var template"
      contains: "OVERMIND_API_KEY"
  key_links:
    - from: "instrumentation.ts"
      to: "@overmind-lab/trace-sdk"
      via: "new OvermindClient(...).initTracing(...)"
      pattern: "initTracing"
    - from: "next.config.js"
      to: "instrumentation hook"
      via: "experimental.instrumentationHook = true"
      pattern: "instrumentationHook"
---

<objective>
Install `@overmind-lab/trace-sdk` and initialize Overmind tracing at Next.js server bootstrap via the `instrumentation.ts` hook. After this plan ships, every OpenAI call made by `decideBid` (Plan 01) is automatically traced to the Overmind console with inputs, outputs, latency, tokens, and cost — no further code changes per call.

Purpose: OPT-01 requires production traces visible at `console.overmindlab.ai`. Next.js 14's `instrumentation.ts` hook is the canonical server-bootstrap location; using it ensures init runs exactly once per server process, before any route handlers.

Output: SDK installed, `instrumentation.ts` registered, env var documented, Next.js config flag enabled. Plan 01 and Plan 02 are independent (no shared files) so they execute in parallel in Wave 1; their effects compose in Plan 03.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@package.json
@next.config.js

<interfaces>
From the Overmind JS/TS SDK (validated facts, see planning_context):
- `OvermindClient({ apiKey, appName })`
- `client.initTracing({ enableBatching: boolean, enabledProviders: { openai: OpenAIClass } })`
- After `initTracing`, importing and using `OpenAI` from `"openai"` anywhere in the process is auto-instrumented.

Next.js 14 instrumentation hook:
- File: `instrumentation.ts` at project root, exports `async function register()`.
- Requires `experimental.instrumentationHook = true` in `next.config.js`.
- Runs once at server start, before request handlers.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Overmind trace SDK and enable Next.js instrumentation hook</name>
  <files>package.json, next.config.js</files>
  <read_first>package.json, next.config.js</read_first>
  <action>
    Run `npm install @overmind-lab/trace-sdk`. Update `next.config.js` to enable the instrumentation hook by adding (or merging into existing config) `experimental: { instrumentationHook: true }`. Preserve any existing config keys — only add the experimental block. Do NOT change anything else.
  </action>
  <acceptance_criteria>
    - `npm ls @overmind-lab/trace-sdk` lists the package with a resolved version.
    - `grep -n "instrumentationHook" next.config.js` matches and the value is `true`.
    - `npm run build` passes.
  </acceptance_criteria>
  <done>SDK is on disk and Next.js will invoke `instrumentation.ts#register` on server start.</done>
  <verify>
    <automated>npm ls @overmind-lab/trace-sdk &amp;&amp; grep -q "instrumentationHook" next.config.js &amp;&amp; npm run build</automated>
  </verify>
</task>

<task type="auto">
  <name>Task 2: Create instrumentation.ts that boots Overmind with the OpenAI provider</name>
  <files>instrumentation.ts</files>
  <read_first>next.config.js (after Task 1), package.json</read_first>
  <action>
    Create `instrumentation.ts` at the repo root exporting `async function register()`. Inside `register()`, gate the body on `process.env.NEXT_RUNTIME === "nodejs"` (the hook is invoked in both edge and nodejs runtimes — Overmind only supports node). Inside the gate:
    1. Dynamically `await import("openai")` and `await import("@overmind-lab/trace-sdk")` (dynamic imports keep the edge runtime tree-shake clean).
    2. If `process.env.OVERMIND_API_KEY` is missing, log a single warning `[overmind] OVERMIND_API_KEY not set — tracing disabled` and `return` (do not throw — the dev server should still boot without the key).
    3. Construct `new OvermindClient({ apiKey: process.env.OVERMIND_API_KEY, appName: "agentbid-studio" })`.
    4. Call `client.initTracing({ enableBatching: true, enabledProviders: { openai: OpenAI } })`.
    5. Log `[overmind] tracing initialized (appName=agentbid-studio)`.

    The whole body should be wrapped in `try/catch` that logs `[overmind] init failed: ${err}` and returns — tracing failure must never crash the app.
  </action>
  <acceptance_criteria>
    - `instrumentation.ts` exists at repo root.
    - `grep -n "export async function register" instrumentation.ts` matches.
    - `grep -n "appName: \"agentbid-studio\"" instrumentation.ts` matches.
    - `grep -nE "enabledProviders|initTracing" instrumentation.ts | wc -l` is ≥ 2.
    - `grep -n "NEXT_RUNTIME" instrumentation.ts` matches (edge guard present).
    - `npm run type-check` passes.
    - `npm run build` passes.
  </acceptance_criteria>
  <done>Next.js boots the Overmind tracing client once per server process; without the env var the server still starts (warns instead of crashes).</done>
  <verify>
    <automated>npm run type-check &amp;&amp; npm run build &amp;&amp; grep -q "agentbid-studio" instrumentation.ts &amp;&amp; grep -q "initTracing" instrumentation.ts</automated>
  </verify>
</task>

<task type="auto">
  <name>Task 3: Document OVERMIND_API_KEY and OPENAI_API_KEY in .env.example and README</name>
  <files>.env.example, README.md</files>
  <read_first>README.md</read_first>
  <action>
    Create `.env.example` (or overwrite if present — it's not currently in the repo) with two documented lines:
    - `OPENAI_API_KEY=` with a one-line comment explaining it's required for the bid-decision LLM call.
    - `OVERMIND_API_KEY=` with a one-line comment explaining it's required to publish traces to `console.overmindlab.ai`; if absent, the server boots but tracing is disabled.

    Append a `## Local Setup` section to `README.md` (after the existing pitch sections) with three steps: (1) `cp .env.example .env.local`, (2) fill in both keys, (3) `npm install && npm run dev`. Keep it under 10 lines total.
  </action>
  <acceptance_criteria>
    - `grep -n "OVERMIND_API_KEY" .env.example` matches.
    - `grep -n "OPENAI_API_KEY" .env.example` matches.
    - `grep -n "## Local Setup" README.md` matches.
    - `grep -n ".env.local" README.md` matches.
  </acceptance_criteria>
  <done>A fresh clone has a clear setup path for both keys; OVERMIND_API_KEY is no longer tribal knowledge.</done>
  <verify>
    <automated>test -f .env.example &amp;&amp; grep -q "OVERMIND_API_KEY" .env.example &amp;&amp; grep -q "OPENAI_API_KEY" .env.example &amp;&amp; grep -q "Local Setup" README.md</automated>
  </verify>
</task>

</tasks>

<verification>
- `@overmind-lab/trace-sdk` and `openai` (added in Plan 01, may be added here if Plan 01 hasn't merged yet — npm install is idempotent) are both in `package.json`.
- `instrumentation.ts` initializes the Overmind client with `appName: "agentbid-studio"` and registers OpenAI as a provider.
- `next.config.js` has `experimental.instrumentationHook = true`.
- `.env.example` documents both keys.
- `npm run build` passes.
- (Manual confirmation in Plan 04 verification notes: with a real `OVERMIND_API_KEY` set, traces appear in the Overmind console after one tick of the simulation.)
</verification>

<success_criteria>
After this plan ships, no further per-call code is needed for tracing. Every OpenAI call made by `decideBid` is automatically captured. OPT-01 is satisfied: tracing SDK is initialized at app bootstrap.
</success_criteria>

<output>
Create `.planning/phases/05-overmind-agent-optimization/05-02-SUMMARY.md` when done. Note the exact `instrumentation.ts` register() signature and confirm `experimental.instrumentationHook = true` is set.
</output>
