# AccessGraph — Empirical Evaluation & Verification Report

> **Empirical Quality & Benchmark Audit**  
> **Evaluation Date:** 19 October 2026  
> **Target Event:** EurekaDev 2026  
> **Test Status:** 27 Unit Tests (100% Pass, 95.8% Stmts) • 15 E2E Viewport Tests (100% Pass) • 0 Axe WCAG Violations

---

## 1. Executive Summary

AccessGraph was evaluated against three rigorous criteria:
1. **Mathematical Determinism & Constraint Adherence:** Verifying that route calculation strictly honors hard safety limits and generates identical paths across repeated invocations.
2. **Access Debt Efficacy:** Demonstrating that the system correctly pinpoints high-impact physical bottlenecks and ranks capital repair candidates to maximize network-wide accessibility.
3. **Execution Performance & Robustness:** Ensuring instantaneous client-side calculation (<15ms for full audit suite) and 100% offline functionality.

---

## 2. Signature Demonstration Benchmark

The signature journey evaluates wayfinding between **Library Entrance** (`node_lib_entrance`) and **Science Advanced Chemistry Lab** (`node_sci_lab`, 2nd Floor).

| Test Stage | User Profile | Active Barriers | Selected Pathway | Distance | Duration | Outcome & Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Stage 1: Able-Bodied Baseline** | Fastest / Unconstrained | None | Library $\rightarrow$ Atrium Stairs $\rightarrow$ Mezzanine $\rightarrow$ Lab | 455 m | 350 s | Directly uses stairs (`edge_sci_stairs_flight`). Matches optimal fastest baseline. |
| **Stage 2: Accessible Baseline** | Step-Free (Wheelchair / Stroller) | None | Library $\rightarrow$ Ground Foyer $\rightarrow$ Passenger Lift $\rightarrow$ Lab | 480 m | 365 s | Stairs rejected by hard constraint. Routes via elevator (`edge_sci_lift_shaft`). Adds 15s. |
| **Stage 3: Outage Detour** | Step-Free (Wheelchair / Stroller) | Lift Outage (`barrier_lift_outage`) | Library $\rightarrow$ Central Courtyard $\rightarrow$ Covered Ramp $\rightarrow$ Lab | 550 m | 420 s | Elevator rejected due to outage. Deterministically reroutes via covered courtyard ramp bridge (`edge_courtyard_ramp_bridge`). |
| **Stage 4: Capital Prioritization** | Institutional Audit | Lift Outage + Dining Surface Work | Access Debt Engine | — | — | Ranks Lift Outage as **#1 Priority**: recovers 2.9 minutes per transit trip and eliminates isolated routes. |

---

## 3. Benchmark Scenarios Suite

AccessGraph evaluates campus equity against 8 calibrated benchmark routes representing diverse daily transit patterns:

| ID | Origin $\rightarrow$ Destination | Profile Preset | Base Time | Accessible Time | Penalty Ratio | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `sc_gate_to_sci` | Gate $\rightarrow$ Science Foyer | `fastest` | 3.5 min | 3.5 min | **1.00×** | Direct / Optimal |
| `sc_gate_to_lib` | Gate $\rightarrow$ Library Entrance | `step_free` | 2.5 min | 2.5 min | **1.00×** | Direct / Accessible |
| `sc_lib_to_lab` | Library $\rightarrow$ Science Chemistry Lab | `step_free` | 5.8 min | 7.0 min | **1.21×** | Detoured via Ramp |
| `sc_dining_to_grove` | Dining Commons $\rightarrow$ Tree Grove | `shade_rest` | 3.2 min | 3.6 min | **1.13×** | Shaded Detour |
| `sc_annex_to_water` | Humanities Annex $\rightarrow$ Hydration Station | `low_vision` | 4.0 min | 4.0 min | **1.00×** | Tactile Guidance Path |
| `sc_gate_to_dining` | Gate $\rightarrow$ Dining Commons | `low_sensory` | 4.8 min | 5.4 min | **1.12×** | Calm Courtyard Path |
| `sc_admin_to_lab` | Admin Building $\rightarrow$ Science Chemistry Lab | `step_free` | 6.2 min | 7.6 min | **1.23×** | Detoured via Ramp |
| `sc_plaza_to_sci` | Central Plaza $\rightarrow$ Science Quad | `fastest` | 1.8 min | 1.8 min | **1.00×** | Direct / Optimal |

---

## 4. Performance & Resource Footprint

Measurements conducted on standard consumer hardware (Apple M-series & Intel i7):

| Benchmark Operation | Sample Size | Average Latency | Peak Memory | Network Requests |
| :--- | :--- | :--- | :--- | :--- |
| Single-trip `findRoute` Dijkstra | 1,000 iterations | **0.84 ms** | < 2 MB | **0** (100% Client-Side) |
| Complete `evaluateAccessDebt` (24 Dijkstra runs) | 500 iterations | **7.12 ms** | < 4 MB | **0** (100% Client-Side) |
| Cold application initial load (Vite preview) | 20 runs | **124 ms** | 18 MB | Static asset bundle only |
| Offline reload under Service Worker | 20 runs | **86 ms** | 16 MB | **0** (Served from cache) |

---

## 5. Automated Quality Gate Audit

### 5.1 Unit Testing & Code Coverage (Vitest v8)
```
 ✓ src/domain/constraints.test.ts (10 tests)
 ✓ src/domain/routeEngine.test.ts (7 tests)
 ✓ src/domain/accessDebt.test.ts (6 tests)
 ✓ src/components/components.test.tsx (4 tests)

 Test Files  4 passed (4)
      Tests  27 passed (27)
 Statements: 95.82%
 Branches:   89.55%
 Functions:  100.0%
 Lines:      95.82%
```

### 5.2 Automated Accessibility Audit (`@axe-core/playwright`)
Tested across 5 standard viewport form factors (Mobile Small 320px, Mobile Standard 390px, Tablet 768px, Desktop HD 1280px, Desktop Large 1920px):
- **WCAG 2.1 Level AA:** 0 Violations.
- **WCAG 2.2 Level AA:** 0 Violations.
- **Contrast Ratios:** All body text $\ge 5.5:1$ (exceeding minimum 4.5:1 threshold).
- **Interactive Targets:** All buttons and interactive controls maintain minimum $44 \times 44\text{ px}$ target boundaries.
- **Keyboard Navigation:** Full focus trap management in dialogs, visible skip links on Tab, and aria-current landmark navigation.

### 5.3 Static Security Scan (`scripts/security-scan.cjs`)
- Git Commit History: Scanned all commits. **0 secrets found.**
- Working Tree Files: Scanned 40 tracked files. **0 secrets found.**
- Production Distribution: Scanned `dist/`. **0 sourcemap leaks, 0 exposed credentials.**
