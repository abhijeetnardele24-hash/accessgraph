# Devpost Submission — AccessGraph

> **Event:** EurekaDev 2026  
> **Track:** Coding Track — Problem in the Community  
> **Project Name:** AccessGraph  
> **Tagline:** Constraint-aware campus navigation that turns inaccessible routes into actionable repair priorities.

---

## 🎯 Pitch & Inspiration

For students and campus visitors with physical disabilities, temporary injuries, low vision, or sensory sensitivities, a route optimized only for distance or walking time may still be unusable. Missing accessibility attributes can lead a wheelchair user toward stairs, expose a low-vision traveler to an unguided path, or depend on a lift that is out of service. The *World Health Organization (WHO) World Report on Disability* (2011) and *UNICEF Accessible Infrastructure Guidelines* (2019) discuss physical infrastructure and information barriers affecting participation.

At the same time, university facilities management teams operate with constrained annual maintenance budgets. Without quantitative network data showing which physical bottlenecks cause the greatest collective disruption across daily student journeys, repair scheduling risks becoming reactive rather than systemically optimized.

We built **AccessGraph** to solve both sides of this civic accessibility challenge:
1. **For the Student:** An accessible, private wayfinding engine that reloads and operates offline after first online load, enforcing strict safety constraints (zero stairs, active elevator status, slope limits, surface textures) and optimizing routes across personalized multi-objective cost factors using OpenStreetMap accessibility attributes.
2. **For the University:** An **"Access Debt"** diagnostic engine that quantitatively audits campus infrastructure, measuring the collective time burden imposed on disabled community members and ranking capital repairs by maximum network-wide time and connectivity restored.

---

## 🚀 What It Does

AccessGraph functions as a dual-engine progressive web application:

### 1. Constraint-Aware Accessible Wayfinding
- **5 Tailored Mobility Presets:** Fastest / Unconstrained, Step-Free (Wheelchair / Stroller), Low Vision (Tactile guidance & bright lighting prioritized), Low Sensory (Calm corridors avoiding noisy dining halls), and Shade & Rest (Protected weather paths near rest benches).
- **Custom Profile Editor:** Allows any traveler to customize their exact physical constraints (slope limit, minimum clear path width, stair prohibition, lift requirements, uneven surface exclusion) and soft preference weights with local browser persistence.
- **Hard Constraint Enforcement:** Paths with stairs, impassable barriers, excessive slopes (>6% grade), or narrow doorways (<90cm) are strictly rejected *before* path scoring begins.
- **Deterministic Rationale Explanations:** Every calculated route explains *why* it was chosen and *what* was rejected (e.g. *"The 455m unconstrained shortest route contains stairs and was rejected by the Step-free policy. Elevator outage avoided; rerouted via covered courtyard ramp."*).
- **Multi-Objective Cost Matrix:** Transparent breakdown displaying physical duration, incline profiles, lighting factors, and sensory burden.

### 2. The Access Debt Diagnostic Dashboard
- **Institutional Equity Metric:** Formulates $\text{AccessPenalty} = \text{accessibleRouteTime} / \text{fastestRouteTime}$ across representative benchmark scenarios (averaging 1.22× across connected routes under the default synthetic fixture, reflecting a monotonic increase from 1.17× baseline without active barriers). Disconnected routes are tracked separately without arbitrary numerical distortion.
- **Counterfactual Repair Simulator:** Tests hypothetical repairs for every active facility disruption on campus (such as an elevator motor overhaul or paving stone resurfacing).
- **Prioritized Capital Ranking:** Mathematically ranks maintenance work orders by:
  1. Isolated routes restored ($\Delta \text{Disconnected}$ descending);
  2. Cumulative travel minutes saved across all benchmark scenarios ($\text{MinutesRecovered}$ descending);
  3. Profiles helped count;
  4. Deterministic barrier ID tie-breaker.
- **Interactive Simulation:** Facilities managers can click **"Simulate Fix"** to preview how a hypothetical repair changes routes and the synthetic campus benchmark.

---

## 🛠️ How We Built It

- **Frontend & Core Engine:** React 18, TypeScript (strict mode), and modern Vanilla CSS tokens with zero heavy CSS framework bloat.
- **Graph Routing Engine:** Custom deterministic Dijkstra algorithm with a strict 4-key lexicographical tie-breaker (`[Cost, Duration, Distance, pathKey]`) preventing path flipping across edge shuffles.
- **Interactive Schematic Map:** Hand-crafted accessible SVG campus topology modeling a synthetic academic complex with multi-floor waypoints, courtyards, library, dining commons, and courtyard ramp bridge.
- **Offline & Persistence:** Service Worker implementation (`sw.js`) with cache-first navigation fallback and local browser storage (`localStorage`) for custom profiles and simulated barriers.
- **Testing & Quality Assurance:**
  - **Vitest v8:** 36 unit and component tests achieving **94.07% statement coverage**, **89.40% branch coverage**, and **100% function coverage**.
  - **Playwright & `@axe-core/playwright`:** 9 distinct end-to-end definitions across 5 viewports (320px to 1920px, 45 total executions); Axe detected **0 violations** across 5 tested interaction states. Keyboard focus, touch targets, and overflow have additional assertions.
  - **Security Scanner:** Custom streaming scanner verifying full Git commit history and production dist bundles for zero credential leaks.
  - **Benchmark Harness:** Committed reproducible benchmark script (`scripts/run-benchmarks.ts`); the recorded test-host run measured 0.020ms median single-route latency and 0.555ms median 8-scenario Access Debt audit latency. Timing varies by host.

---

## 🧗 Challenges We Ran Into

1. **Multi-Story Elevation Transitions:** Modeling vertical movement (stairs vs. hydraulic elevators vs. exterior ramp bridges) within a 2D schematic graph required careful node height calibration and directional edge logic to prevent invalid elevator skips.
2. **Deterministic Route Selection:** Equal-cost routes can flip when graph edge lists are shuffled. Our explicit lexicographical comparison, including a deterministic path key, produces stable output in repeated and randomized-edge-order tests.
3. **Automated Accessibility Coverage:** We added high-contrast tokens, dialog focus trapping, Escape dismissal, opener focus restoration, landmark navigation, minimum touch-target checks, and Axe scans. Axe detected no violations in the five tested states; this is automated evidence, not a claim of complete manual accessibility certification.

---

## 🏆 Accomplishments We're Proud Of

- **Under 75-Second Deterministic Proof:** Demonstrating in under 75 seconds how an elevator outage immediately forces a deterministic reroute via a covered ramp bridge, and how the Access Debt dashboard flags that exact elevator as the #1 repair priority.
- **Local-First Privacy Boundary:** Routing and Access Debt calculations execute in the browser with no application telemetry or third-party tracking scripts. The committed benchmark measured sub-millisecond median calculation time on the test host; performance varies by device.
- **Comprehensive Quality Gates:** 36 Vitest tests and 45 Playwright E2E browser executions with 0 Axe violations.

---

## 💡 What We Learned

We learned that campus accessibility is not merely a signage or routing challenge; it is fundamentally an **information asymmetry and resource allocation problem**. By translating the daily physical struggle of disabled travelers into quantifiable minutes and restored transit connections, we can give university administrators the objective data needed to justify accessibility capital investments.

---

## 🔮 What's Next for AccessGraph

- **Facilities Work-Order Integration:** Connecting the Access Debt engine directly to campus maintenance platforms (e.g. ARCHIBUS, Maximo, ServiceNow) to automatically ingest real-time elevator telemetry.
- **Dynamic Solar Shadow Modeling:** Utilizing real-time solar azimuth and campus building heights to dynamically compute shaded paths as the sun moves throughout the day.
- **Indoor Positioning via BLE:** Integrating low-power Bluetooth beacons for turn-by-turn indoor wayfinding in complex academic complexes.

---

## 🔗 Links & Resources
- **GitHub Repository:** [https://github.com/abhijeetnardele24-hash/accessgraph](https://github.com/abhijeetnardele24-hash/accessgraph)
- **Live Demo / Deployment:** [https://abhijeetnardele24-hash.github.io/accessgraph/](https://abhijeetnardele24-hash.github.io/accessgraph/)
- **Demo Video:** `PUBLIC_DEMO_VIDEO_URL_REQUIRED` *(Pending recording under 4 minutes)*
- **License:** MIT License
