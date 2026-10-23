# AccessGraph

<div align="center">

**Constraint-aware campus navigation that turns inaccessible routes into actionable repair priorities.**

[![CI Quality Gate](https://github.com/abhijeetnardele24-hash/accessgraph/actions/workflows/ci.yml/badge.svg)](https://github.com/abhijeetnardele24-hash/accessgraph/actions/workflows/ci.yml)
[![Accessibility: automated Axe audit](https://img.shields.io/badge/Accessibility-Axe%20audit%20%7C%205%20states-164E35.svg)](https://github.com/abhijeetnardele24-hash/accessgraph)
[![Unit Coverage: 94.07%](https://img.shields.io/badge/Coverage-94.07%25%20Statements-1B6494.svg)](https://github.com/abhijeetnardele24-hash/accessgraph)
[![Playwright E2E: 45/45 Passed](https://img.shields.io/badge/Playwright-45%2F45%20Executions%20Passed-164E35.svg)](https://github.com/abhijeetnardele24-hash/accessgraph)
[![Offline: PWA Ready](https://img.shields.io/badge/Offline-PWA%20Service%20Worker-B45309.svg)](https://github.com/abhijeetnardele24-hash/accessgraph)
[![License: MIT](https://img.shields.io/badge/License-MIT-4D5358.svg)](./LICENSE)

[**Live Application**](https://abhijeetnardele24-hash.github.io/accessgraph/) • [**Architecture Specs**](./docs/ARCHITECTURE.md) • [**Data Dictionary**](./docs/DATA_DICTIONARY.md) • [**Evaluation Report**](./docs/EVALUATION.md) • [**Devpost Submission**](./docs/DEVPOST_SUBMISSION.md) • [**Demo Script**](./docs/DEMO_SCRIPT.md)

</div>

---

> **Synthetic Demo Campus Disclosure:** All campus building geometry, path coordinates, and maintenance incident records shown in this repository and demo are **synthetic demonstration fixtures** created for evaluation. Not official university architectural blueprints, certified ADA compliance advice, or medical guidance. No institutional endorsement is implied.

---

## 💡 The Core Problem: The Institutional Accessibility Paradox

Many general-purpose navigation tools prioritize distance and walking time without modeling every user's mobility constraints. For wheelchair users, students with low vision, people with sensory sensitivities, or anyone with a temporary injury, missing accessibility attributes can produce unusable routes: stairs, excessive slopes, or reliance on an out-of-service lift (barriers discussed in the *WHO World Report on Disability*, 2011, and *UNICEF Accessible Infrastructure Guidelines*, 2019).

At the same time, university facilities management operates with constrained maintenance budgets. When institutions lack quantitative network data on which physical bottlenecks cause the greatest collective disruption across daily student journeys, repair scheduling risks becoming reactive rather than systemically optimized.

**AccessGraph bridges this divide with a dual-engine architecture:**
1. **For the Student:** An accessible, private wayfinding engine that reloads and operates offline after first online load, strictly enforces safety constraints (zero stairs, active elevator status, maximum slope, surface texture), and optimizes paths across personalized multi-objective cost factors using OpenStreetMap accessibility attributes.
2. **For the University:** An **"Access Debt"** diagnostic audit engine that quantifies the collective temporal burden imposed on mobility-impaired community members and ranks capital repairs by maximum network-wide travel time recovered and disconnected routes restored.

---

## 🏛️ System Architecture

AccessGraph executes **100% client-side** inside the user's browser runtime. Zero remote API dependencies, zero external tracking scripts, zero telemetry cookies.

<div align="center">
  <img src="./docs/assets/architecture.svg" alt="AccessGraph System Architecture Diagram" width="100%" />
</div>

---

## 📸 Authentic Application Screenshots

All screenshots below are authentic captures from our automated Playwright visual test suite.

### 1. Interactive Wayfinding Planner (Default Fastest Route)
*Under the unconstrained Fastest profile between the Library Entrance and Science Advanced Lab, the engine utilizes the atrium stairs (455m, 6 minutes). Every route displays an accessible schematic SVG map, turn-by-turn itinerary, and multi-objective cost breakdown.*

<div align="center">
  <img src="./docs/assets/screenshots/01-wayfinding-planner.png" alt="AccessGraph Desktop Wayfinding Planner showing optimal route" width="100%" />
</div>

---

### 2. Step-Free Constraint Enforcement & Ramp Detour Proof
*When the user selects the "Step-Free (Wheelchair / Stroller)" profile while the Science Complex passenger elevator is out of service, the hard constraint filter strictly rejects both the stairs and the lift. The deterministic Dijkstra engine reroutes the student through the courtyard and across the covered elevated ramp bridge.*

<div align="center">
  <img src="./docs/assets/screenshots/02-step-free-reroute.png" alt="AccessGraph Step-Free Reroute via Courtyard Ramp Bridge" width="100%" />
</div>

---

### 3. The Access Debt Diagnostic Dashboard & Prioritized Repairs
*The institutional view audits 8 deterministic synthetic benchmark scenarios. The counterfactual repair simulator identifies that resolving the Science Complex Lift Outage recovers 2.9 minutes per student transit trip, ranking it as the #1 capital intervention. Clicking **"Simulate Fix"** immediately tests the resolution live.*

<div align="center">
  <img src="./docs/assets/screenshots/03-access-debt-dashboard.png" alt="AccessGraph Access Debt Diagnostic Dashboard with Ranked Repairs" width="100%" />
</div>

---

### 4. Responsive Mobile Experience (iPhone 14 / 390px Viewport)
*Full responsive capability across touchscreens with 44px minimum interactive targets, keyboard navigation, and complete offline PWA service worker support.*

<div align="center">
  <img src="./docs/assets/screenshots/04-mobile-planner.png" alt="AccessGraph Mobile Viewport Navigation on 390px screen" width="380px" />
</div>

---

## ⚡ The 75-Second Signature Demonstration

Judges and evaluators can verify the entire end-to-end innovation in under 75 seconds:

```
[1. Default State]
Origin: Library Entrance ─── Destination: Science Lab (Floor 2) ─── Profile: Fastest
Result: Direct route (455m, 6 min) using central stairs (edge_sci_stairs_flight).
                   ↓
[2. Step-Free Profile Selected]
User switches to "Step-Free (Wheelchair / Stroller)" preset.
Result: Stairs rejected by policy. Active incident flags Science Lift Outage.
Reroutes deterministically via covered courtyard ramp bridge (550m, 7 min).
                   ↓
[3. Deterministic Proof Inspection]
Route Inspector explicitly verifies:
"The 455m unconstrained shortest route contains stairs and was rejected by the Step-free policy.
 Elevator outage avoided; rerouted via covered courtyard ramp."
                   ↓
[4. Access Debt Diagnostics Opened]
User clicks "Access Debt Diagnostic" in the header navigation.
Average Access Ratio: 1.22× with active barriers (vs 1.17× baseline without barriers, proving strict monotonicity).
Prioritized Repair Candidates Table ranks Lift Outage as #1 Capital Priority.
                   ↓
[5. Interactive Counterfactual Repair Simulated]
User clicks "Simulate Fix" on Candidate #1.
The lift is hypothetically repaired: average transit debt falls and time is recovered live.
                   ↓
[6. Offline Resilience Verified]
User toggles browser offline.
The installed Service Worker passed automated offline reload testing after an initial online load, maintaining local routing execution.
```

---

## 🔬 Algorithmic Foundations

### 1. Hard Constraint Filtering (`src/domain/constraints.ts`)
Potential path edges are evaluated against the traveler's physical mobility boundaries before scoring:

$$\text{Valid}(e, P, B, t) = \begin{cases}
\text{False} & \text{if } e \in B_{\text{active}}(t) \text{ and barrier is impassable} \\
\text{False} & \text{if } P.\text{noStairs} \land e.\text{mode} = \text{"stairs"} \\
\text{False} & \text{if } P.\text{requireWorkingLift} \land e.\text{mode} = \text{"lift"} \land e \in B_{\text{lift}}(t) \\
\text{False} & \text{if } P.\text{maxSlopePct} \land e.\text{slopePct} > P.\text{maxSlopePct} \\
\text{False} & \text{if } P.\text{minWidthCm} \land e.\text{widthCm} < P.\text{minWidthCm} \\
\text{False} & \text{if } P.\text{excludeUneven} \land e.\text{surface} = \text{"uneven"} \\
\text{True} & \text{otherwise}
\end{cases}$$

### 2. Multi-Objective Soft Cost Function (`src/domain/routeEngine.ts`)
Valid edges are scored using a normalized weighted sum tailored to the active profile:

$$C(e, P) = w_{\text{time}} \cdot \frac{T_e}{60} + w_{\text{slope}} \cdot \frac{S_e}{10} + w_{\text{light}} \cdot (2 - L_e) + w_{\text{sensory}} \cdot N_e + w_{\text{heat}} \cdot (2 - H_e) + w_{\text{rest}} \cdot R_e + P_{\text{barrier}}$$

### 3. Deterministic 4-Key Dijkstra Tie-Breaking
Standard Dijkstra implementations produce non-deterministic path flipping when multiple detours share equal durations. AccessGraph enforces a strict lexicographical 4-key priority queue:

$$\text{Key}(u) = \langle C(u), \; T_{\text{sec}}(u), \; D_{\text{meters}}(u), \; \text{pathKey}(u) \rangle$$

### 4. Access Debt Network Evaluation (`src/domain/accessDebt.ts`)
Quantifies equity across $S$ campus benchmark journeys:

$$\text{AccessPenalty}(s) = \frac{T_{\text{accessible}}(s)}{T_{\text{fastest}}(s)} \quad (\text{for connected routes})$$

Disconnected routes are tracked separately in `disconnectedCount` without arbitrary numerical distortion. Capital repair candidates are ranked deterministically by:
1. Isolated routes restored ($\Delta \text{Disconnected}$ descending);
2. Total travel minutes saved across scenarios ($\text{MinutesRecovered}$ descending);
3. Profiles helped count descending;
4. Barrier ID tie-breaker.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Architecture** | React 18 + TypeScript (Strict) | Pure functional components, strict domain type safety |
| **Styling & Design** | Vanilla CSS Design Tokens | Civic wayfinding palette, high contrast, zero CSS framework bloat |
| **Schematic Graphics** | Custom Accessible SVG | Scalable campus topology, multi-floor waypoints, clear routes |
| **Persistence** | Browser `localStorage` | Private local incident logs and user profile preferences |
| **Offline Architecture** | Service Worker (`public/sw.js`) | Offline navigation fallback and asset caching |
| **Unit Testing** | Vitest 2.1 + v8 coverage | 36 unit/component tests, 94.07% statement coverage |
| **E2E & Accessibility** | Playwright + `@axe-core/playwright` | 9 distinct test specs across 5 viewports (45 total executions); Axe found 0 violations in 5 tested states |
| **Security Auditing** | Custom Node.js Security Scanner | Full Git history streaming scan for secret leaks |

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- Node.js `v20.0.0` or `v22.0.0` or higher
- npm `v9.0.0` or higher

```bash
# 1. Clone repository
git clone https://github.com/abhijeetnardele24-hash/accessgraph.git
cd accessgraph

# 2. Install dependencies cleanly
npm ci

# 3. Start local development server
npm run dev
# -> Open http://localhost:5173/

# 4. Build optimized production bundle
npm run build

# 5. Preview production build locally
npm run preview
# -> Open http://localhost:4173/
```

---

## 🧪 Verification & Quality Gate Commands

Every quality gate can be verified locally through npm scripts:

```bash
# Static TypeScript typecheck (zero errors)
npm run typecheck

# Code quality and style linting
npm run lint

# Run unit and component tests with v8 code coverage
npm test

# Run multi-viewport Playwright E2E & Axe accessibility audit (45 executions)
npm run test:e2e

# Run reproducible routing and Access Debt performance benchmarks
npm run benchmark

# Verify metric synchronization and evidence artifacts
npm run evidence:check

# Run production security & secret leak scanner
npm run security-scan

# Run high-severity dependency audit
npm run audit
```

### CI Verification Matrix
| Quality Check | Tool | Threshold / Criteria | Result |
| :--- | :--- | :--- | :--- |
| **Type Safety** | `tsc --noEmit` | 0 TypeScript errors | **PASS** (0 errors) |
| **Code Quality** | `eslint` | 0 ESLint errors/warnings | **PASS** (0 warnings) |
| **Unit Test Suite** | Vitest v8 | $\ge 85\%$ lines, $\ge 80\%$ branches | **PASS** (94.07% stmts, 89.4% branches, 36/36 tests) |
| **E2E Viewports** | Playwright | 320px, 390px, 768px, 1280px, 1920px | **PASS** (45/45 executions) |
| **Accessibility Audit** | `@axe-core/playwright` | Automated Axe rules across 5 states | **PASS** (0 detected violations; focus, touch targets & overflow additionally tested) |
| **Performance Benchmarks** | `scripts/run-benchmarks.ts` | 1,000 Dijkstra runs + 200 audits | **PASS** (0.020ms Dijkstra median, 0.555ms audit median on the recorded test host) |
| **Evidence & Metric Check** | `scripts/check-evidence.ts` | Monotonicity + JSON artifact sync | **PASS** (1.165x $\rightarrow$ 1.223x debt) |
| **Secret Scanning** | `scripts/security-scan.cjs` | Full Git history + working tree | **PASS** (0 secrets found) |
| **Dependency Audit** | `npm audit` | 0 high/critical vulnerabilities | **PASS** (0 vulnerabilities) |
| **Bundle Size** | Vite Manual Chunks | Minimal footprint (<250KB gzip) | **PASS** (~74.8KB gzip total, including HTML/CSS/JS) |

---

## 🔒 Privacy & Operational Boundaries

1. **Zero Cloud Telemetry:** AccessGraph does not transmit user coordinates, profile choices, or incident records to any remote server or cloud database.
2. **Zero Analytics / Advertising:** No third-party tracking scripts, cookies, or tracking beacons exist in the codebase.
3. **Emergency Disclaimers:** AccessGraph is an assistive wayfinding prototype. In an emergency (fire, earthquake, evacuation), always follow designated physical illuminated exit signs and official campus emergency protocols.
4. **Synthetic Data Disclosure:** All campus waypoints, buildings, and maintenance incident records are simulated fixtures constructed for EurekaDev 2026 evaluation. No real university affiliation or endorsement is implied.

---

## 📄 Complete Documentation Suite

- [**System Architecture (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md): Mathematical formulations and algorithmic specifications.
- [**Data Dictionary (`docs/DATA_DICTIONARY.md`)**](./docs/DATA_DICTIONARY.md): Comprehensive schema specifications for all domain entities.
- [**Empirical Evaluation (`docs/EVALUATION.md`)**](./docs/EVALUATION.md): Benchmark scenario results and performance benchmarks.
- [**Privacy & Limitations (`docs/PRIVACY_AND_LIMITATIONS.md`)**](./docs/PRIVACY_AND_LIMITATIONS.md): Client-side privacy guarantees and disclosures.
- [**Devpost Submission (`docs/DEVPOST_SUBMISSION.md`)**](./docs/DEVPOST_SUBMISSION.md): Complete copy-paste submission writeup.
- [**3:29 Demo Video**](https://youtu.be/LwGtuFbr2i4): End-to-end product walkthrough covering constrained routing, Access Debt repair simulation, offline reload behavior, and verified engineering evidence.
- [**Video Script (`docs/DEMO_SCRIPT.md`)**](./docs/DEMO_SCRIPT.md): Timed narration and recording guide used for the final demonstration video.
- [**Submission Checklist (`docs/SUBMISSION_CHECKLIST.md`)**](./docs/SUBMISSION_CHECKLIST.md): Final submission readiness verification.
- [**Build Work Log (`docs/BUILD_LOG.md`)**](./docs/BUILD_LOG.md): Chronological development milestones.

---

## ⚖️ License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more details.

**Author:** Abhijeet Nardele • EurekaDev 2026
