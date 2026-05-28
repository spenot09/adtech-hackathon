---
phase: quick
plan: 260528-rxy
subsystem: ui
tags: [next.js, react, tailwind, simulation, animation]

requires: []
provides:
  - Nike + New Balance fixture agents replacing Coke/Stride
  - Pre-scripted ad templates for nike.running, nike.fitness, nb.shopping, nb.fitness
  - Three deterministic demo scenarios (athletic, street-style, irrelevant)
  - WalkthroughPanel component with sequential animated reveals
  - /demo/live page wired to WalkthroughPanel
affects: [demo, live-feed, fixtures, ad-templates]

tech-stack:
  added: []
  patterns:
    - "Deterministic demo scenarios: fully pre-scripted DemoScenario objects, no runtime engine"
    - "Sequential reveal animation: useEffect chained timeouts with opacity/translate-y transitions"
    - "Auto-advance with CSS progress bar: width 3s linear transition driven by autoAdvancing state"

key-files:
  created:
    - lib/simulation/demo-scenarios.ts
    - components/live-feed/WalkthroughPanel.tsx
  modified:
    - lib/simulation/fixtures.ts
    - lib/simulation/ad-templates.ts
    - app/demo/live/page.tsx

key-decisions:
  - "Deterministic scenarios over runtime engine — demo must be predictable and repeatable"
  - "WalkthroughPanel reads from FIXTURE_AGENTS for brand colors, not from store/hooks"
  - "Auto-advance CSS progress bar uses state-driven width transition, not ref manipulation"

requirements-completed: []

duration: 15min
completed: 2026-05-28
---

# Quick: Nike + New Balance Demo Walkthrough Summary

**Replaced Coke/Stride with Nike and New Balance, created three pre-scripted bidding scenarios, and built WalkthroughPanel with animated sequential decision reveals on /demo/live**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-05-28T19:11:00Z
- **Completed:** 2026-05-28T19:26:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Nike and New Balance fixture agents with brand colors, keywords, and budget config
- Four ad templates (nike.running, nike.fitness, nb.shopping, nb.fitness) with styled gradients
- Three fully deterministic demo scenarios: Nike wins athletic, NB wins street style, both skip finance
- WalkthroughPanel component with 800ms staggered decision reveals, 3s auto-advance, and scenario pill navigation
- /demo/live updated to use WalkthroughPanel with refreshed heading and subtitle

## Task Commits

1. **Task 1: Replace fixtures and add ad templates** - `ab251db` (feat)
2. **Task 2: Create demo-scenarios data module** - `65ad870` (feat)
3. **Task 3: Build WalkthroughPanel and wire /demo/live page** - `bab1216` (feat)

## Files Created/Modified
- `lib/simulation/fixtures.ts` - Replaced Coke/Stride with Nike (id: nike) and New Balance (id: nb)
- `lib/simulation/ad-templates.ts` - Replaced coke/stride keys with nike/nb templates
- `lib/simulation/demo-scenarios.ts` - DEMO_SCENARIOS array with 3 typed DemoScenario entries
- `components/live-feed/WalkthroughPanel.tsx` - Client component: sequential reveals, auto-advance, controls
- `app/demo/live/page.tsx` - Replaced LiveFeedPanel with WalkthroughPanel, updated heading/subtitle

## Decisions Made
- Used deterministic pre-scripted scenarios instead of runtime engine to ensure reliable demo performance
- WalkthroughPanel pulls agent display data from FIXTURE_AGENTS directly, avoiding store dependencies
- Auto-advance progress bar implemented via CSS width transition driven by autoAdvancing boolean state

## Deviations from Plan

None - Tasks 1 and 2 were already committed when execution started. Task 3 completed the remaining work exactly as specified.

## Issues Encountered
None.

## Known Stubs
None - all three scenarios have fully specified opportunity and decision data including ad templates for winning bids.

## Self-Check: PASSED

All five files exist and TypeScript compiles clean (tsc --noEmit passes with no output).
Commits ab251db, 65ad870, bab1216 all present in git log.

---
*Phase: quick*
*Completed: 2026-05-28*
