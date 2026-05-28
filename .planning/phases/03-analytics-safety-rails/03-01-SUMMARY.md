---
phase: 3
plan: 01
subsystem: Analytics & Safety Rails
tags:
  - frontend
  - analytics
  - dashboard
  - safety-rails
requires:
  - 01-01
provides:
  - Analytics tab
  - Seeded Adidas vs New Balance analytics dataset
  - Spend/revenue chart
  - Budget pacing and safety analytics panels
affects:
  - src/app/page.tsx
  - src/components/AnalyticsDashboard.tsx
  - src/lib/analyticsData.ts
  - src/lib/types.ts
tech-stack:
  added: []
  patterns:
    - Local tab state inside the existing app shell
    - Deterministic seeded analytics data
    - Custom SVG chart for MVP analytics visualization
key-files:
  created:
    - src/components/AnalyticsDashboard.tsx
    - src/lib/analyticsData.ts
  modified:
    - .gitignore
    - .planning/ROADMAP.md
    - src/app/page.tsx
    - src/app/globals.css
    - src/components/AgentDashboard.tsx
    - src/components/AgentForm.tsx
    - src/lib/agentStore.ts
    - src/lib/types.ts
key-decisions:
  - Phase 3 analytics is decoupled from Phase 2 and uses seeded deterministic campaign data.
  - The analytics tab compares `Adidas - Fastest Shoes on the planet` and `New Balance - 530`.
  - The page is analytics-only: no bidding feed, bid buttons, auction winner module, or prompt stream.
  - Wide charts and tables use internal scrolling on small screens while the page itself avoids horizontal overflow.
requirements-completed:
  - METRICS-01
  - METRICS-02
  - METRICS-03
  - METRICS-04
  - METRICS-05
  - SAFETY-01
  - SAFETY-02
  - SAFETY-03
  - DASH-03
completed: 2026-05-28
---

# Phase 3 Plan 01: Analytics Tab For Adidas Vs New Balance Demo Summary

Built the Analytics tab for the Adidas vs New Balance running-performance demo. The page follows the ad-platform analytics reference direction with top KPI cards, spend/revenue charting, budget pacing, safety guardrail analytics, campaign performance, and revenue breakdown tables.

## What Changed

- Added analytics campaign types and deterministic seed data for:
  - `Adidas - Fastest Shoes on the planet`
  - `New Balance - 530`
- Added `AnalyticsDashboard` with:
  - Total Spend
  - Revenue
  - ROAS
  - Avg CPC
  - Conversions
  - Budget Remaining
  - Skipped Unsafe
  - Spend and Revenue Over Time chart
  - Budget Pacing panel
  - Safety Guardrails panel
  - Campaign Performance table
  - Revenue Breakdown table
- Added local tab state so the existing sidebar can switch between `Agents` and `Analytics`.
- Preserved the Phase 1 create-agent flow under the `Agents` tab.
- Preserved the current agent edit-flow wiring in the app shell while adding Analytics tab routing.
- Added layout constraints so dense chart/table content stays inside panels on mobile.

## Verification

- `npm run build` passed.
- `npm run lint` passed with no warnings or errors.
- Browser verification against `http://127.0.0.1:3001` passed:
  - Analytics tab is reachable from the sidebar.
  - `Running Performance Campaign Analytics` is visible.
  - `Adidas - Fastest Shoes on the planet` is visible.
  - `New Balance - 530` is visible.
  - KPI cards for spend, revenue, ROAS, average CPC, conversions, budget remaining, and skipped unsafe are visible.
  - `Bids won` is visible in the campaign performance table.
  - `Spend and Revenue Over Time` chart is visible.
  - No `Bid` button exists on the analytics page.
  - No auction winner module exists on the analytics page.
  - Mobile viewport check reported `mobileOverflow=false`.

## Deviations from Plan

- Added `src/app/globals.css` to the touched files to define table utility classes and prevent document-level horizontal overflow.
- Lower analytics tables stack at normal desktop widths and only switch to side-by-side on wider screens, so all columns remain readable in the demo viewport.

## Issues Encountered

- A production server process held `.next` during one build attempt. The generated `.next` directory was cleared after stopping the server, then `npm run build` passed.

## Self-Check: PASSED

All Phase 3 plan success criteria are satisfied.
