# Devpost Submission — AccessGraph

> **Event:** EurekaDev 2026  
> **Track:** Coding Track — Problem in the Community  
> **Project Name:** AccessGraph  
> **Tagline:** Constraint-aware campus navigation that turns inaccessible routes into actionable repair priorities.

---

## 🎯 Pitch & Inspiration

Every semester, millions of university students navigate sprawling campuses to attend lectures, access labs, and participate in community life. But for students with physical disabilities, mobility impairments, temporary injuries, low vision, or sensory sensitivities, conventional navigation tools are fundamentally broken. Mainstream mapping apps optimize strictly for able-bodied walking speed or Euclidean distance—leading wheelchair users directly into flight-of-stairs dead ends, forcing students with visual impairments onto unguided pathways, or stranding travelers in front of out-of-service elevators with zero alternative recourse.

At the same time, university facilities management teams operate with constrained annual maintenance budgets. They are forced to prioritize repairs based on whoever sends the loudest complaint email, rather than where an intervention will provide the greatest systemic mobility relief.

We built **AccessGraph** to solve both sides of this civic accessibility challenge:
1. **For the Student:** An accessible, private, 100% offline-capable wayfinding engine that enforces strict safety constraints (zero stairs, verified working lifts, slope limits) and optimizes routes across personalized multi-objective cost factors.
2. **For the University:** An "Access Debt" diagnostic engine that quantitatively audits campus infrastructure, measuring the collective time burden imposed on disabled community members and ranking capital repairs by maximum network-wide time and connectivity restored.

---

## 🚀 What It Does

AccessGraph functions as a dual-engine progressive web application:

### 1. Constraint-Aware Accessible Wayfinding
- **5 Tailored Mobility Presets:** Fastest / Unconstrained, Step-Free (Wheelchair / Stroller), Low Vision (Tactile guidance & bright lighting prioritized), Low Sensory (Calm corridors avoiding loud echo-chambers), and Shade & Rest (Protected weather paths near benches).
- **Hard Constraint Enforcement:** Paths with stairs, impassable barriers, excessive slopes (>8% grade), or narrow doorways (<90cm) are strictly rejected *before* path scoring begins.
- **Deterministic Rationale Explanations:** Every calculated route explains *why* it was chosen and *what* was rejected (e.g. *"The 455m unconstrained shortest route contains stairs and was rejected by the Step-free policy. Rerouted via passenger lift."*).
- **Multi-Objective Cost Matrix:** Transparent breakdown displaying physical duration, incline penalties, lighting factors, and sensory burden.

### 2. The Access Debt Diagnostic Dashboard
- **Institutional Equity Metric:** Formulates `accessPenalty = accessibleRouteTime / fastestRouteTime` across representative campus benchmark scenarios.
- **Counterfactual Repair Simulator:** Tests hypothetical repairs for every active facility disruption on campus (such as an elevator motor overhaul or paving stone resurfacing).
- **Prioritized Capital Ranking:** Mathematically ranks maintenance work orders by:
  $$\text{Impact Score} = (100 \times \text{Disconnected Routes Restored}) + \text{Cumulative Minutes Recovered}$$
- **Interactive Simulation:** Facilities managers can click **"Simulate Fix"** to immediately preview how a repair restores campus connectivity in real-time.

---

## 🛠️ How We Built It

- **Frontend & Core Engine:** React 18, TypeScript (strict mode), and modern Vanilla CSS tokens with zero heavy UI frameworks.
- **Graph Routing Engine:** Custom deterministic Dijkstra algorithm with a strict 4-key lexicographical tie-breaker (`[Cost, Duration, Distance, NodeID]`) preventing route oscillation.
- **Interactive Schematic Map:** Hand-crafted accessible SVG campus topology modeling Ashoka University's multi-level Science Complex, Central Plaza, Library, Dining Commons, and Courtyard Ramp Bridge.
- **Offline & Persistence:** Service Worker implementation (`sw.js`) with stale-while-revalidate caching and local browser storage (`localStorage`).
- **Testing & Quality Assurance:**
  - **Vitest v8:** 27 unit and component tests achieving **95.82% statement coverage** and **100% function coverage**.
  - **Playwright & `@axe-core/playwright`:** 15 automated end-to-end test scenarios across 5 distinct viewports (320px to 1920px), asserting **0 WCAG 2.2 AA violations**.
  - **Security Scanner:** Custom streaming scanner verifying full Git history and production dist bundles for zero credential leaks.

---

## 🧗 Challenges We Ran Into

1. **Multi-Story Elevation Transitions:** Modeling vertical movement (stairs vs. hydraulic elevators vs. exterior ramp bridges) within a 2D schematic graph required careful node height calibration and directional edge logic to prevent invalid elevator skips.
2. **Deterministic Route Selection:** Standard priority queues often suffer from arbitrary tie-breaking when two detours share identical durations. Implementing our 4-key lexicographical comparison guaranteed deterministic consistency across all operating systems.
3. **Automated WCAG 2.2 AA Compliance:** Meeting strict Level AA standards required meticulous attention to color contrast (achieving $\ge 5.5:1$ on all interactive states), keyboard focus trapping in dialogs, visible skip links, and ensuring that scrollable table containers are keyboard-focusable for screen-reader users.

---

## 🏆 Accomplishments We're Proud Of

- **Under 75-Second Deterministic Proof:** Demonstrating in under 75 seconds how an elevator outage immediately forces a deterministic reroute via a covered ramp bridge, and how the Access Debt dashboard flags that exact elevator as the #1 repair priority.
- **100% Client-Side Privacy:** Zero server telemetry, zero third-party trackers, zero cookies. All computations execute locally in ~2ms.
- **Comprehensive Quality Gates:** 100% passing test suite across both Vitest and Playwright with automated accessibility auditing.

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
- **GitHub Repository:** [github.com/abhijeetnardele24-hash/accessgraph](https://github.com/abhijeetnardele24-hash/accessgraph)
- **Live Demo / Deployment:** GitHub Pages
- **License:** MIT License
