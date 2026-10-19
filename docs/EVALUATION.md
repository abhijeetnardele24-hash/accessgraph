# AccessGraph — Empirical Evaluation & Verification Report

> **Empirical Quality & Benchmark Audit**  
> **Evaluation Date:** 19 October 2026  
> **Target Event:** EurekaDev 2026 (Coding Track / Problem in the Community)  
> **Verification Status:** 36 Unit/Component Tests (100% Pass, 94.07% Stmts, 89.4% Branches) • 9 Distinct E2E Test Definitions across 5 Viewports (45 Total Executions, 100% Pass) • 0 Axe Violations in 5 Tested States

---

## 1. Executive Summary

AccessGraph was evaluated against three rigorous criteria:
1. **Mathematical Determinism & Constraint Adherence:** Verifying that route calculation strictly honors hard safety limits (zero stairs on step-free, maximum slope thresholds, clear path width, barrier evaluation time windows) and generates identical paths across repeated invocations and randomized edge ordering.
2. **Access Debt Efficacy:** Demonstrating that the system correctly pinpoints high-impact physical bottlenecks and ranks capital repair candidates to maximize network-wide accessibility and travel time recovery.
3. **Execution Performance & Robustness:** Providing client-side calculation (median single-route latency of 0.022ms; median 8-scenario audit latency of 0.561ms). The installed Service Worker passed automated offline reload testing after an initial online load.

---

## 2. Theoretical Grounding & Primary Standards

AccessGraph grounds its multi-objective routing and Access Debt metrics in authoritative international accessibility standards:
- **World Health Organization (WHO):** *World Report on Disability* (2011) documents physical infrastructure and transit disparities as compounding systemic barriers to higher education and civic life.
- **UNICEF:** *Accessible and Inclusive Infrastructure Guidelines* (2019) emphasizes the necessity of step-free paths, maximum 6% ramp inclinations, tactile paving guidance, and multi-modal sensory accommodation.
- **OpenStreetMap (OSM) Accessibility Attributes:** Graph edges model standardized properties (`incline`, `surface`, `tactile_paving`, `kerb`, `wheelchair`, `lit`, `indoor`).
- **W3C WCAG 2.2 Level AA Evaluation:** Automated Axe scans detected zero violations in the five tested application states; keyboard focus, touch targets, and responsive overflow are additionally covered by Playwright assertions.

---

## 3. Signature Demonstration Benchmark

The signature journey evaluates wayfinding between **Library Entrance** (`node_lib_entrance`) and **Science Advanced Chemistry Lab** (`node_sci_lab`, 2nd Floor).

| Test Stage | User Profile | Active Barriers | Selected Pathway | Distance | Duration | Outcome & Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Stage 1: Able-Bodied Baseline** | Fastest / Unconstrained | None | Library $\rightarrow$ Atrium Stairs $\rightarrow$ Mezzanine $\rightarrow$ Lab | 455 m | 350 s (5m 50s) | Directly uses stairs (`edge_sci_stairs_flight`). Matches optimal fastest baseline. |
| **Stage 2: Accessible Baseline** | Step-Free (Wheelchair / Stroller) | None | Library $\rightarrow$ Ground Foyer $\rightarrow$ Passenger Lift $\rightarrow$ Lab | 480 m | 365 s (6m 05s) | Stairs rejected by hard constraint. Routes via elevator (`edge_sci_lift_shaft`). Adds 15s. |
| **Stage 3: Outage Detour** | Step-Free (Wheelchair / Stroller) | Lift Outage (`barrier_lift_outage`) | Library $\rightarrow$ Central Courtyard $\rightarrow$ Covered Ramp $\rightarrow$ Lab | 570 m | 450 s (7m 30s) | Elevator rejected due to outage. Deterministically reroutes via covered courtyard ramp (`edge_courtyard_ramp_f2`). |
| **Stage 4: Capital Prioritization** | Institutional Audit | Lift Outage + Dining Surface Work | Access Debt Engine | — | — | Ranks Lift Outage as **#1 Priority**: recovers 2.9 minutes per transit trip and eliminates mobility bottleneck. |

---

## 4. Benchmark Scenarios Suite (Synthetic Demo Campus)

AccessGraph evaluates campus equity against 8 deterministic synthetic benchmark routes representing diverse daily transit patterns across a synthetic campus fixture (`docs/evaluation-results.json`):

| Scenario ID | Origin $\rightarrow$ Destination | Profile Preset | Fastest Base | Accessible Time | Penalty Ratio | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `scen_lib_to_lab_wheelchair` | Library Entrance $\rightarrow$ Science Lab | `step_free` | 5.8 min | 7.5 min | **1.29×** | Accessible Detour |
| `scen_gate_to_lab_wheelchair` | Main Campus Gate $\rightarrow$ Science Lab | `step_free` | 7.1 min | 8.8 min | **1.24×** | Accessible Detour |
| `scen_admin_to_lab_wheelchair` | Administration $\rightarrow$ Science Lab | `step_free` | 5.7 min | 7.3 min | **1.29×** | Accessible Detour |
| `scen_humanities_to_lab_wheelchair` | Humanities Annex $\rightarrow$ Science Lab | `step_free` | 7.3 min | 8.9 min | **1.23×** | Accessible Detour |
| `scen_gate_to_lib_low_vision` | Main Campus Gate $\rightarrow$ Library | `low_vision` | 3.3 min | 4.8 min | **1.46×** | Accessible Detour |
| `scen_courtyard_to_dining_shade` | Central Plaza $\rightarrow$ Dining Commons | `shade_rest` | 1.9 min | 1.9 min | **1.00×** | Direct / Optimal |
| `scen_gate_to_sci_low_sensory` | Main Campus Gate $\rightarrow$ Science Foyer | `low_sensory` | 5.7 min | 5.7 min | **1.00×** | Direct / Optimal |
| `scen_dining_to_lab_step_free` | Dining Commons $\rightarrow$ Science Lab | `step_free` | 6.0 min | 7.7 min | **1.28×** | Accessible Detour |

### Summary Statistics
- **Total Scenarios Evaluated:** 8
- **Disconnected Routes:** 0 (all benchmark routes have feasible paths under default synthetic fixture)
- **Baseline Access Penalty (No Outages):** **1.165×** (~1.17× across all 8 deterministic synthetic benchmark routes)
- **Active Outages in Default Fixture:** 2 (`barrier_lift_outage`, `barrier_dining_repair`)
- **Active Access Penalty:** **1.223×** (~1.22× across all 8 deterministic synthetic benchmark routes; verified strict monotonic increase $1.223 > 1.165$)
- **Top Repair Candidate:** `barrier_lift_outage` (Rank 1, +2.9 min recovered for Step-Free profile)

---

## 5. Reproducible Performance Benchmark Metrics

Metrics measured via committed benchmark harness (`scripts/run-benchmarks.ts`), saved to `docs/benchmark-metrics.json`:

| Benchmark Operation | Sample Size | Mean Latency | Median Latency | p95 Latency | Memory & Network |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Single-trip `findRoute` (Dijkstra + soft scoring) | 1,000 iterations | **0.027 ms** | **0.022 ms** | **0.044 ms** | 100% Client-Side, 0 Network requests |
| Complete `evaluateAccessDebt` (8 scenarios + ranking) | 200 iterations | **0.608 ms** | **0.561 ms** | **0.897 ms** | 100% Client-Side, 0 Network requests |

*Environment: Node.js v24.11.1, Windows x64, 13th Gen Intel Core i5-13420H.*

---

## 6. Automated Quality Gate Audit

### 6.1 Unit & Component Testing (Vitest v8)
```
 ✓ src/domain/constraints.test.ts (13 tests)
 ✓ src/domain/routeEngine.test.ts (11 tests)
 ✓ src/domain/accessDebt.test.ts (6 tests)
 ✓ src/components/components.test.tsx (6 tests)

 Test Files  4 passed (4)
      Tests  36 passed (36)
 Statements: 94.07%
 Branches:   89.40%
 Functions:  100.00%
 Lines:      94.07%
```

### 6.2 Automated Accessibility & E2E Verification (`@axe-core/playwright`)
Evaluated across 5 viewport projects (Mobile Small 320px, Mobile Standard 390px, Tablet 768px, Desktop HD 1280px, Desktop Large 1920px):
- **Distinct Test Definitions:** 9 distinct E2E specifications
- **Total Executions:** 45 browser test runs
- **Automated Accessibility Testing:** Automated Axe scans detected zero violations in the five tested application states; keyboard focus, touch targets, and responsive overflow are additionally covered by Playwright assertions.
- **Contrast Ratios:** All body text $\ge 5.5:1$ (exceeding WCAG 4.5:1 threshold).
- **Interactive Targets:** All buttons maintain minimum $44 \times 44\text{ px}$ target boundaries.
- **Focus Management:** Full dialog Tab/Shift+Tab cycle, Escape close, and opener focus restoration verified.
- **Service Worker:** The installed Service Worker passed automated offline reload testing after an initial online load.

### 6.3 Security Audit (`scripts/security-scan.cjs` & `npm audit`)
- **Git Commit History:** Scanned full history. **0 secrets found.**
- **Working Tree Files:** Scanned all tracked files. **0 secrets found.**
- **Production Distribution:** Scanned `dist/`. **0 sourcemap leaks, 0 exposed credentials.**
- **NPM Security Audit:** `npm audit --omit=dev --audit-level=high` reported **0 high/critical vulnerabilities.**
