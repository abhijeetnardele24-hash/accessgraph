# RouteWitness — GitLab Transcend Hackathon Submission Checklist

> **Hackathon:** Life After Code — GitLab Transcend Hackathon  
> **Entry Path:** Path B — Bring Your Own (AccessGraph)  
> **Autonomy Category:** Supervised (Human-in-the-loop production gate)  
> **Deadline:** October 27, 2026 at 13:00 UTC / 18:30 IST

---

## 1. Verified Engineering Gates (100% Passed)

- [x] **Static Type Safety:** `npm run typecheck` exits code `0` with 0 errors (`tsc --noEmit`).
- [x] **Production Build:** `npm run build` completes cleanly in under 2 seconds.
- [x] **Unit & Domain Tests:** `npm test` runs 72 tests in Vitest v8; all 72 pass with **82.13% expanded statement coverage** across domain, RouteWitness core, and MCP modules.
- [x] **Golden Regression Proof:** `tests/unit/routeWitness.golden.test.ts` passes (19/19 tests) proving deterministic detection and minimal counterexample generation for the signature lift-edge regression.
- [x] **Provenance & License Verification:** `npm run verify:provenance` confirms MIT license and `docs/PRIOR_WORK.md` mapping to baseline SHA `a85d644148a774412eac65feadb93c7d9f9cb595`.
- [x] **Protected Policy Integrity:** `npm run verify:policy` confirms SHA-256 integrity hash of `policy/` directory files (`d3a24931583bfe582863058b7ec3ad354ac32c24c4ca0e3273c6507cb78ec588`).
- [x] **Deterministic CLI Suite:** `witness:classify`, `witness:compare`, `witness:minimize`, and `witness:receipt` execute deterministically with zero errors.
- [x] **Model Context Protocol (MCP) Server:** `route-witness/mcp/server.ts` tested over stdio JSON-RPC 2.0 with strict Zod validation and local path boundaries.
- [x] **GitLab Duo Flow:** `.gitlab/duo/flows/route-witness.yml` and agent prompts configured with layered read-only analyst, hypothesis, and write-limited reporter.
- [x] **Full 10-Stage GitLab CI Pipeline:** `.gitlab-ci.yml` configured covering provenance, plan, verify, secure, package, deploy-candidate, replay, promote, monitor, and evidence.
- [x] **Multi-Stage Container Runtime:** `Dockerfile` and `server.cjs` provide non-root production runtime with dedicated `/healthz`, `/version.json`, and `/evidence/latest.json` endpoints.
- [x] **Google Cloud Run Scripts:** Keyless Workload Identity Federation (`setup-wif.sh`) and tagged candidate deployment (`deploy.sh`) ready.
- [x] **Release Evidence UI:** Interactive `ReleaseEvidenceBoard.tsx` integrated into the React navigation tabs with simulated regression toggle.
- [x] **Security & Secret Scanner:** `npm run security-scan` reports 0 leaked secrets across Git history and build bundles.
- [x] **Dependency Security Audit:** `npm run audit` reports 0 high/critical vulnerabilities.
- [x] **Machine-Readable Final Evidence:** `docs/verification-results.json` generated from active commit and verified metrics.

---

## 2. External Actions & Submission Verification

- [ ] **Import to GitLab Namespace:** Push repository to the hackathon-provisioned GitLab project namespace.
- [ ] **Record Demo Video (< 3 minutes):** Walk through signature scenario:
  1. 0:00–0:15: Human impact hook (step-free route).
  2. 0:15–0:35: GitLab MR opened & Duo flow trigger.
  3. 0:35–1:00: Duo Risk Hypothesis & MCP classification.
  4. 1:00–1:25: Deterministic BLOCK verdict & minimal counterexample.
  5. 1:25–1:45: Corrective commit & passing pipeline.
  6. 1:45–2:15: Tagged Cloud Run candidate revision deploy & live replay.
  7. 2:15–2:35: Supervised human production promotion & Release Receipt.
- [ ] **Submit Devpost Entry:** Copy content from `docs/DEVPOST_SUBMISSION.md`.
