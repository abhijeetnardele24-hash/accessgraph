# Devpost Submission — RouteWitness

> **Hackathon:** Life After Code — GitLab Transcend Hackathon  
> **Entry Path:** Path B — Bring Your Own (Built on [AccessGraph](https://github.com/abhijeetnardele24-hash/accessgraph))  
> **Autonomy Category:** Supervised (Human-in-the-loop production gate)  
> **Prizes Targeted:** Path B Best Supervised Agent, Most Stages Covered, Most Creative, Google Cloud Bonus  
> **Project Name:** RouteWitness  
> **Tagline:** A GitLab Duo release flow that proves who a route change would strand before production.

---

## 🎯 Pitch & Inspiration

A route-planning application can pass every normal build, compile cleanly, and show zero automated page-level accessibility violations while a data or algorithm edit still silently erases the only viable journey for a wheelchair user.

Code reviewers cannot manually cross-reference every origin, destination, elevation transition, barrier, and mobility profile against thousands of campus edges. When an elevator identifier is renamed or stairs are accidentally treated as a soft cost penalty rather than a hard constraint, the failure is often discovered by the person who is stranded.

We built **RouteWitness** to answer a more important question than *"did the tests pass?"*:

> **"Did this change remove the only usable route for any supported mobility profile, and can we prove the answer before production?"**

---

## 🚀 What It Does

RouteWitness wraps routing software in a supervised **GitLab Duo Agent Platform** release twin that automatically turns every merge request into a proven before/after journey, a deployed candidate revision, and an informed human release decision.

### 1. GitLab Duo Route Risk Flow
- **Event Triggered:** Fires automatically when a merge request is opened, marked ready, or reviewed.
- **Layered Security Architecture:** A **Read-Only Impact Analyst** inspects the diff and calls the Model Context Protocol (MCP) tool `classify_route_change`. It treats all MR text and comments as untrusted data.
- **Risk Hypotheses:** A **Risk Hypothesis Generator** emits structured, falsifiable hypotheses (e.g. *"Elevator edge rename in Science Foyer risks severing the only step-free path to Science Lab for wheelchair users"*).
- **Zero LLM Oracle Risk:** The agent proposes and explains; **pure, deterministic TypeScript code determines the PASS or BLOCK verdict**.

### 2. Counterfactual Invariant Verification & Minimal Counterexample
- Compares target-branch baseline (`main`) against the MR candidate across a protected benchmark scenario matrix.
- Evaluates hard invariants: `INV-01` (No Unexplained Disconnection), `INV-02` (No Forbidden Edge Traversal), `INV-03` (Deterministic Tie-Breaking), `INV-04` (Complete Route Attributes).
- **Minimal Counterexample Reducer:** Instead of a 300-case failure dump, RouteWitness isolates the single, simplest journey proving the regression (Origin, Destination, Profile, and Violated Invariant) to post directly to the MR.

### 3. Google Cloud Run Candidate Deployment & Replay
- Every candidate build packages an immutable OCI container and deploys a tagged Google Cloud Run revision receiving **0% production traffic**.
- The pipeline replayed the exact Journey Witness against the candidate container's live HTTP endpoints (`/healthz`, `/version.json`).
- **Supervised Human Release Gate:** Production promotion remains a protected, explicit human maintainer decision in GitLab CI.

### 4. Release Receipt Evidence Bundle
- Emits a machine-readable JSON and human-readable Markdown Release Receipt.
- Binds commit SHA, container image digest, Cloud Run revision, policy hash, and a SHA-256 integrity checksum.

---

## 🏛️ Path B Provenance & Before vs. After

RouteWitness is entered under **Path B (Bring Your Own)**, building upon our existing MIT-licensed campus navigation engine, **AccessGraph**. Full provenance is recorded in [`docs/PRIOR_WORK.md`](./docs/PRIOR_WORK.md):

- **Original Project:** [AccessGraph](https://github.com/abhijeetnardele24-hash/accessgraph) (MIT License, Baseline SHA: `a85d644148a774412eac65feadb93c7d9f9cb595`).
- **Prior Work (AccessGraph):** Client-side Dijkstra routing engine, accessibility profiles, campus topology fixtures, and access debt diagnostic dashboard.
- **New Hackathon Work (RouteWitness):**
  1. Pure TypeScript RouteWitness verification core (`route-witness/core/`): schemas, impact classifier, counterfactual verifier, minimal counterexample reducer, and receipt generator.
  2. Model Context Protocol (MCP) Server (`route-witness/mcp/server.ts`): stdio JSON-RPC 2.0 interface exposing schema-validated domain tools to Duo.
  3. Custom GitLab Duo Flow (`.gitlab/duo/flows/route-witness.yml` and prompts).
  4. 10-Stage GitLab CI Pipeline (`.gitlab-ci.yml`) covering provenance through governance.
  5. Multi-stage non-root container packaging (`Dockerfile` and `server.cjs`).
  6. Google Cloud Run deployment scripts and Workload Identity Federation (WIF) setup (`deploy/`).
  7. Judge-facing Release Evidence UI (`src/release-evidence/ReleaseEvidenceBoard.tsx`).
  8. Protected policy boundary and CODEOWNERS rules (`policy/`, `CODEOWNERS`).

---

## 🌐 GitLab Nine-Stage Lifecycle Evidence

| Stage | Implementation | Visible Evidence Artifact | Evidence Status |
|---|---|---|---|
| **Plan** | Duo Flow triggers `classify_route_change` to identify affected edges & profiles. | `artifacts/route-witness/impact-manifest.json` | `MEASURED` |
| **Create** | Duo generates minimal counterexample; prepares corrective commit/MR. | `artifacts/route-witness/minimal-witness.json` | `MEASURED` |
| **Verify** | Vitest 55 tests passed (94.07% coverage) + Playwright Axe audit across viewports. | Vitest JUnit report + Coverage + Golden test | `MEASURED` |
| **Package** | Multi-stage Dockerfile built and pushed to GitLab Container Registry. | OCI Image with SHA tag and captured digest | `MEASURED` |
| **Secure** | Dependency audit (`npm audit`) + Secret scan (`security-scan.cjs`). | 0 high/critical vulnerabilities, 0 leaked secrets | `MEASURED` |
| **Release** | Tagged candidate revision deployed to Google Cloud Run (0% traffic). | Cloud Run candidate revision URL | `MEASURED` |
| **Configure** | Target-branch protected policy & CODEOWNERS governance. | `policy/route-invariants.json` + `CODEOWNERS` | `MEASURED` |
| **Monitor** | Candidate `/healthz` probe and deployed Journey Witness replay. | `scripts/replay-deployment.ts` | `MEASURED` |
| **Govern** | Supervised manual production promotion & tamper-evident Release Receipt. | `artifacts/route-witness/release-receipt.json` | `HUMAN APPROVAL REQUIRED` |

---

## ☁️ Google Cloud Bonus Track Implementation

RouteWitness fully implements Google Cloud deployment:
- **Workload Identity Federation (WIF):** Authenticates GitLab CI to Google Cloud IAM keylessly via OIDC (`deploy/workload-identity/setup-wif.sh`), eliminating committed service-account JSON keys.
- **Tagged Candidate Isolation:** Deployments to Cloud Run utilize `--tag "rev-$CI_COMMIT_SHORT_SHA" --no-traffic`, ensuring zero production user impact during pre-release replay.
- **Dedicated Container Probes:** `server.cjs` implements `/healthz` container probes, `/version.json` commit reflection, and `/evidence/latest.json` receipt serving.

---

## 🔒 Disclosures & Limitations

1. **Synthetic Campus Topology:** All campus layouts, barrier positions, and building geometries in RouteWitness are synthetic demonstrations labeled `isSyntheticDemo: true`.
2. **Integrity Checksums vs Legal Claims:** The SHA-256 checksum on the Release Receipt verifies artifact integrity and execution lineage. It is **not** a blockchain proof, digital signature, or legal ADA/WCAG compliance guarantee.
3. **Automated Accessibility Finding:** Automated Axe tests reported 0 violations across 5 states; this is machine-tested evidence, not a replacement for manual screen-reader or user mobility testing.

---

## 🔗 Links & Resources

- **Public GitLab Repository:** `https://gitlab.com/abhijeetnardele24-hash/accessgraph`
- **Original Prior-Work GitHub Repository:** [https://github.com/abhijeetnardele24-hash/accessgraph](https://github.com/abhijeetnardele24-hash/accessgraph)
- **Prior Work Provenance Document:** [`docs/PRIOR_WORK.md`](./docs/PRIOR_WORK.md)
- **Google Cloud Deployment Guide:** [`docs/GOOGLE_CLOUD_DEPLOYMENT.md`](./docs/GOOGLE_CLOUD_DEPLOYMENT.md)
- **GitLab Duo Setup Guide:** [`docs/GITLAB_DUO_SETUP.md`](./docs/GITLAB_DUO_SETUP.md)
- **License:** MIT License
