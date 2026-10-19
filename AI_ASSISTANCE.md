# AI Assistance & Verification Disclosure

> In accordance with EurekaDev 2026 rules regarding transparency, AI assistance, and academic integrity, this document describes the role of artificial intelligence in the design, development, and verification of **AccessGraph**.

---

## 1. Scope of AI Assistance

AccessGraph was developed through interactive human-AI pair programming using Antigravity (Google DeepMind). AI was employed as an engineering collaborator for:

1. **Architecture Formulation & Algorithmic Design**:
   - Assisting in modeling the two-phase routing pipeline: hard constraint edge-filtering followed by multi-objective soft cost optimization.
   - Formalizing the mathematical definition of **Access Debt** (`accessPenalty = accessibleRouteTime / fastestRouteTime`) and candidate repair ranking.

2. **Code Implementation**:
   - Generating typed TypeScript definitions (`CampusNode`, `CampusEdge`, `RouteProfile`, `Barrier`, `RouteResult`).
   - Implementing deterministic Dijkstra/A* graph traversal with multi-attribute tie-breaking.
   - Drafting accessible React UI components, SVG map coordinates, and high-contrast color tokens tested against WCAG contrast ratios.

3. **Automated Testing & Quality Gates**:
   - Drafting unit test scenarios covering edge cases (lift outages, step-free rejection, maximum slopes, tie-breaks).
   - Writing Playwright end-to-end browser specifications and automated `@axe-core/playwright` accessibility audits across multiple viewports.

---

## 2. Builder Direction & Verification Protocol

The project was conceptualized, directed, and iteratively verified by the human builder:

- **Human Direction & Architectural Scope**: Formulated problem framing around institutional Access Debt, selected the domain constraints, designed the synthetic campus benchmark topology, and defined strict requirements for local privacy, deterministic tie-breaking, and reproducible quality gates.
- **Algorithmic Correctness**: Validated that soft preferences never override hard constraints and that identical inputs yield byte-for-byte deterministic outputs across edge orderings.
- **Truthful Evidence**: Confirmed that all campus maps, barrier incidents, and repair scenarios are strictly synthetic demonstrations. No false claims of real campus deployment, certified ADA compliance advice, or external user tracking.
- **Accessibility & UX**: Verified interactive states, keyboard navigation, focus management (Tab/Shift+Tab trapping and Escape close), mobile touch targets ($\ge 44\text{px}$), and automated Axe audit results (0 violations across 5 tested states). No manual screen-reader evaluations are claimed beyond automated accessibility scan assertions and accessible DOM/ARIA attributes.
- **Execution & Security**: Ran complete local test suites (`typecheck`, `lint`, `test`, `benchmark`, `evidence:check`, `build`, `security-scan`, `audit`, `test:e2e`) and verified CI runs on GitHub Actions.
