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
   - Drafting accessible React UI components, SVG map coordinates, and WCAG-compliant color systems.

3. **Automated Testing & Quality Gates**:
   - Drafting exhaustive unit test scenarios covering all edge cases (lift outages, step-free rejection, maximum slopes, tie-breaks).
   - Writing Playwright end-to-end browser specifications and automated `@axe-core/playwright` accessibility audits.

---

## 2. Builder Verification & Human Oversight

Every line of code, documentation statement, and test suite was verified by the builder:

- **Algorithmic Correctness**: Validated that soft preferences never override hard constraints and that identical inputs yield byte-for-byte deterministic outputs.
- **Truthful Evidence**: Confirmed that all campus maps, barrier incidents, and repair scenarios are strictly synthetic demonstrations. No false claims of real campus deployment, real disability certifications, or external user tracking.
- **Accessibility & UX**: Tested interactive states, keyboard navigation, focus management, screen-reader text equivalence, and high-contrast color tokens.
- **Execution & Security**: Ran complete local test suites (`typecheck`, `test:coverage`, `test:e2e`, `build`, `security-scan`, `audit`) and verified CI runs on GitHub Actions.
