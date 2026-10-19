# AccessGraph — EurekaDev 2026 Submission Readiness Checklist

> **Target Event:** EurekaDev 2026 (Coding Track / Problem in the Community)  
> **Deadline:** 20 October 2026, 5:00 PM CDT (21 Oct 2026, 3:30 AM IST)  
> **Engineering Status:** Complete & Fully Verified via Automated Gates  
> **Submission Status:** Pending External Media Recording & Form Entry

---

## 1. Verified Engineering Gates (100% Passed)

- [x] **Static Type Safety:** `npm run typecheck` exits code `0` with 0 errors (`tsc --noEmit`).
- [x] **Code Quality Linting:** `npm run lint` exits code `0` with 0 warnings (`eslint src tests scripts`).
- [x] **Unit & Component Testing:** `npm test` runs 36 tests in Vitest v8; all 36 pass with **94.07% statement coverage** and **97.61% function coverage**.
- [x] **Deterministic Route Engine:** Dijkstra tie-breaking verified across 20 randomized edge shuffles with `pathKey` preservation.
- [x] **Barrier Lifecycle Enforcement:** Effective barriers respect `startsAt` and `expiresAt` time boundaries across past, active, and future windows.
- [x] **Custom Profile Editor:** Modal controls hard constraints (slope %, width, stairs, lifts, uneven surfaces) and soft weights with local storage persistence and active UI indicator.
- [x] **Dialog Accessibility & Focus Trapping:** Add Barrier and Custom Profile dialogs strictly cycle focus via Tab and Shift+Tab, close on Escape, and restore focus to opener.
- [x] **Deterministic E2E Verification:** 9 distinct test definitions across 5 viewports (45 total executions) verified via Playwright (`tests/e2e/accessibility.spec.ts`) with 100% pass rate.
- [x] **Automated Accessibility Compliance:** Automated `@axe-core/playwright` audit asserts **0 WCAG 2.1 AA / 2.2 AA violations** across all 5 interaction states (Default Planner, Step-free, Strict No-Route, Modal Focus Traps, Access Debt Dashboard).
- [x] **Service Worker Offline Caching:** Real Service Worker navigation and asset serving verified offline under simulated network disconnection.
- [x] **Security & Secret Scanner:** `npm run security-scan` scans full Git commit history, working tree, and `dist/` bundle: **0 secrets found**.
- [x] **Dependency Security Audit:** `npm run audit` (`npm audit --omit=dev --audit-level=high`) reports **0 high/critical vulnerabilities**.
- [x] **Production Bundle Optimization:** `npm run build` completes cleanly, chunked into vendor, icons, and core bundle (total gzip ~63 KB).
- [x] **Authentic High-Resolution Screenshots:**
  - `docs/assets/screenshots/01-wayfinding-planner.png` (Desktop 1440x900 3-column layout with optimal fastest route).
  - `docs/assets/screenshots/02-step-free-reroute.png` (Step-free reroute via covered ramp with deterministic proof callout).
  - `docs/assets/screenshots/03-access-debt-dashboard.png` (Access debt scorecard, ranked repair candidates table with Simulate Fix, and benchmark matrix).
  - `docs/assets/screenshots/04-mobile-planner.png` (Mobile viewport 390x844 stacked view).
- [x] **Vector Architecture Diagram:** Authoritative vector architecture diagram committed at `docs/assets/architecture.svg`.
- [x] **Benchmark Results & Metrics:** Committed reproducible benchmark outputs at `docs/evaluation-results.json` and `docs/benchmark-metrics.json`.
- [x] **Honest Disclosures & Primary Sources:** All campus topology labeled as a **Synthetic Demo Campus**; WHO (2011), UNICEF (2019), and OSM attributes cited.

---

## 2. Pending External Assets & Actions

- [ ] **Record Product Demo Video:** Record real walkthrough of under 4 minutes following `docs/DEMO_SCRIPT.md`.
- [ ] **Upload Public Demo Video:** Upload video to YouTube/Vimeo and replace placeholder:
  - Video URL: `PUBLIC_DEMO_VIDEO_URL_REQUIRED`
- [ ] **Join Official Hackathon Discord:** Join EurekaDev 2026 participant server and register handle.
- [ ] **Devpost Form Completion:** Populate all Devpost submission fields using `docs/DEVPOST_SUBMISSION.md`.
  - Track: Coding Track — Problem in the Community
  - Project Title: AccessGraph
  - Repository URL: `https://github.com/abhijeetnardele24-hash/accessgraph`
  - Demo Link: `https://abhijeetnardele24-hash.github.io/accessgraph/`
- [ ] **Preview Links & Assets:** Preview all Markdown links, screenshot embeds, and deployment URL before final submission.

---

## 3. Final Submission Confirmation

- [ ] **Submit Devpost Entry:** Click submit on Devpost before the deadline (20 Oct 2026, 5:00 PM CDT / 21 Oct 2026, 3:30 AM IST).
- [ ] **Save Confirmation Proof:** Record public Devpost project URL and confirmation receipt timestamp.
