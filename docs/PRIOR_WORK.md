# Prior Work Provenance — RouteWitness / AccessGraph

> **Hackathon:** Life After Code — GitLab Transcend Hackathon  
> **Entry path:** Path B — Bring Your Own  
> **Autonomy category:** Supervised

## Original Project

| Field | Value |
|---|---|
| Project name | AccessGraph |
| Repository | https://github.com/abhijeetnardele24-hash/accessgraph |
| License | MIT |
| Original HEAD SHA | `a85d644148a774412eac65feadb93c7d9f9cb595` |
| Original HEAD date | 2026-10-22 (per GitHub; EurekaDev submission) |
| Original README description | Constraint-aware campus navigation that turns inaccessible routes into actionable repair priorities. |

## Import Record

| Field | Value |
|---|---|
| Import method | `git init` + `git remote add origin` + `git fetch` + `git checkout` preserving full commit history |
| Baseline tag | `pre-routewitness-baseline` |
| Baseline tag SHA | `a85d644148a774412eac65feadb93c7d9f9cb595` |
| Mirror clone | `.git-mirror-accessgraph/` (bare, full history) |
| Import date | 2026-10-22 |

## Before / After — What Existed vs. What Was Added

### Existed in AccessGraph (prior work — NOT new hackathon work)

| Component | Description |
|---|---|
| `src/domain/routeEngine.ts` | Deterministic Dijkstra route finder with hard-constraint enforcement |
| `src/domain/constraints.ts` | Hard-constraint checker (stairs, lift, slope, width, barriers) |
| `src/domain/accessDebt.ts` | Access debt analysis and repair candidate ranking |
| `src/domain/profiles.ts` | Mobility profile definitions (step-free, low-sensory, custom) |
| `src/domain/types.ts` | Full TypeScript type system for campus graph, routes, barriers |
| `src/data/demoCampus.ts` | Synthetic demo campus graph data (labeled `isSyntheticDemo: true`) |
| `src/data/scenarios.ts` | Benchmark scenario definitions |
| `src/components/` | React UI components (CampusMap, RouteControls, RouteInspector, AccessDebtDashboard) |
| `src/services/storage.ts` | IndexedDB persistence |
| `tests/` | Vitest unit tests, Playwright E2E |
| `scripts/` | Benchmark, evidence-check, security-scan utilities |

### Created during hackathon submission period (new RouteWitness work)

> All items below were created on or after October 22, 2026 and constitute the new RouteWitness agentic release-automation layer.

| Component | Description |
|---|---|
| `route-witness/core/schemas.ts` | Zod schemas for ImpactManifest, JourneyWitness, GateResult, StageEvidence, ReleaseReceipt |
| `route-witness/core/classify.ts` | MR-aware impact classifier |
| `route-witness/core/compare.ts` | Counterfactual graph verifier |
| `route-witness/core/minimize.ts` | Minimal counterexample reducer |
| `route-witness/core/receipt.ts` | Release Receipt generator (JSON + Markdown) |
| `route-witness/cli/` | CLI commands for all core operations |
| `route-witness/mcp/` | Restricted MCP server (TypeScript, Zod-validated, no arbitrary shell) |
| `.gitlab-ci.yml` | Full CI/CD pipeline (provenance → plan → verify → secure → package → deploy → promote → monitor) |
| `.gitlab/duo/` | Custom GitLab Duo Agent Platform flow (route-witness.yml, prompts, mcp.json) |
| `policy/` | Protected route invariants, benchmark scenarios, evidence schema |
| `src/release-evidence/` | Release Evidence UI panel (added to AccessGraph frontend) |
| `Dockerfile` | Multi-stage, non-root OCI image |
| `deploy/` | Cloud Run and Workload Identity Federation configuration |
| `docs/PRIOR_WORK.md` | This file |
| `docs/ARCHITECTURE.md` | System architecture |
| `docs/THREAT_MODEL.md` | Security and trust model |
| `docs/GITLAB_DUO_SETUP.md` | Duo flow/trigger/MCP setup |
| `docs/GOOGLE_CLOUD_DEPLOYMENT.md` | WIF and Cloud Run deployment steps |
| `docs/EVIDENCE_MODEL.md` | Evidence labeling and lifecycle model |
| `docs/DEMO_SCRIPT.md` | Timed demo storyboard |
| `docs/DEVPOST_SUBMISSION.md` | Polished Devpost field copy |
| `docs/SUBMISSION_CHECKLIST.md` | Final submission checklist |

## Truthfulness Notes

- All route and campus data used in demos is **synthetic** (`isSyntheticDemo: true` in dataset). No real campus geometry or personal mobility data is used.
- SHA-256 checksums in release receipts are **integrity checksums**, not blockchain or legal attestations.
- Automated accessibility results are reported as automated findings in tested states — not as WCAG conformance claims.
- The original AccessGraph project was created for EurekaDev 2026. RouteWitness wraps it in a GitLab Duo release-automation layer for GitLab Transcend 2026.
