# RouteWitness — Project Blueprint

> **Working title:** RouteWitness. Confirm the final name manually before submission; do not let an AI rename it late in the build.
>
> **Hackathon:** [Life After Code — GitLab Transcend Hackathon](https://gitlab-transcend.devpost.com/)
>
> **Entry path:** Path B — Bring Your Own
>
> **Autonomy category:** Supervised
>
> **Primary prize targets:** Path B Best Supervised Agent; Most Stages Covered; Most Creative
>
> **Deadline:** October 27, 2026 at 13:00 UTC / 18:30 IST
>
> **Existing MIT project:** [AccessGraph](https://github.com/abhijeetnardele24-hash/accessgraph)

## 1. Executive Decision

RouteWitness is a supervised, evidence-first release system for accessibility-sensitive routing software. It wraps the existing AccessGraph application in a GitLab Duo Agent Platform workflow that asks a more important question than “did the tests pass?”:

> **Did this change remove the only usable route for any supported mobility profile, and can we prove the answer before production?**

When a merge request changes a route, barrier, accessibility attribute, routing rule, or user-facing control, RouteWitness automatically:

1. determines which personas and journeys can be affected;
2. asks a GitLab Duo flow to form explicit risk hypotheses and propose counterexamples;
3. runs deterministic baseline-versus-candidate graph analysis;
4. produces the smallest reproducible failing journey when an accessibility invariant breaks;
5. runs targeted unit, property, UI, accessibility, security, and provenance checks;
6. packages and deploys a no-production-traffic candidate revision to Google Cloud Run;
7. validates the deployed revision using the same witness case;
8. creates a human-readable, machine-verifiable Release Receipt tied to the exact commit and artifacts; and
9. waits for one meaningful human decision: approve or reject the evidenced outcome.

The agent proposes, investigates, explains, and can prepare a corrective merge request. Deterministic programs decide whether invariants pass. A human controls production promotion and any change to the guardrails. This is deliberately **supervised**, not falsely “hands-off,” because route accessibility is an outward-facing, safety-relevant decision.

## 2. Research Basis

### 2.1 What the hackathon actually rewards

The challenge is not a general app contest. It asks entrants to automate what happens **after code is written** using the [GitLab Duo Agent Platform](https://docs.gitlab.com/user/duo_agent_platform/), including agents, flows, triggers, and MCP clients where useful. GitLab names nine lifecycle stages: plan, create, verify, package, secure, release, configure, monitor, and govern. Entries are evaluated equally on:

| Criterion | What judges ask | RouteWitness response |
|---|---|---|
| Technological implementation | Is GitLab used deeply for a real, non-trivial post-code workflow? | Custom Duo flows, event triggers, an MCP evidence server, GitLab CI reports, container registry, protected environments, Cloud Run candidate deployment, and traceable release artifacts. |
| Design | Is it a coherent end-to-end workflow rather than disconnected demos? | One continuous MR-to-candidate-to-human-approval journey, with a single Release Receipt as the narrative spine. |
| Potential impact | Is the problem specific, credible, and actually addressed? | Prevents route-data and routing-logic changes from silently stranding users whose constraints are not represented by a generic happy-path test. |
| Innovation / idea | Is the agentic use novel relative to common concepts? | Agents generate risk hypotheses and counterexamples; deterministic graph analysis proves or disproves them. The unit of review is a user journey, not a code diff. |
| Presentation | Does the video visibly prove the automation and its value? | A deliberately seeded “innocent” change breaks the only step-free route, is caught, explained, repaired, redeployed, and approved in under three minutes. |

Stage One is pass/fail: the entry must be viable and reasonably use GitLab Duo Agent Platform. RouteWitness makes Duo central rather than decorative.

Google Cloud deployment is optional but can add up to **0.2 points**. Path B deployment itself is mandatory. Therefore Cloud Run is part of the MVP, not an afterthought.

### 2.2 Rules and non-negotiable requirements

- Use Path B because AccessGraph is an existing MIT-licensed project and the new work is the agentic post-code automation.
- Import the project into the hackathon-provisioned GitLab namespace.
- Keep a visible public GitLab project with source, assets, setup instructions, an MIT `LICENSE`, and public pipeline history.
- Put the MIT license in the GitLab project metadata/About area so it is visibly detected.
- Include the original project URL: `https://github.com/abhijeetnardele24-hash/accessgraph`.
- Clearly document what existed before and what was created during the submission period.
- Build and deploy the new automation and new Cloud Run deployment on or after October 5, 2026.
- Keep the deployed Path B project publicly accessible through approximately November 16, 2026.
- Submit a working-project demonstration video under three minutes on YouTube. Use Public or Unlisted visibility while ensuring judges can play it without sign-in. Do not use copyrighted music or unauthorized third-party marks.
- Use English for submission materials.
- All entrant-created software, documentation, and agent YAML must be MIT-licensed and comply with GitLab Developer Certificate of Origin 1.1. Third-party dependencies must use compatible OSI-approved licenses.
- Freeze the submitted repo, video, and links at the deadline. Continue later work only in a fork or separate branch that does not alter judging evidence.
- Do not claim a stage, feature, test count, environmental saving, accessibility conformance, or deployment state unless a judge can verify it.

### 2.3 Existing-solution landscape and gaps

The obvious hackathon pattern is already crowded: several generic agents review a merge request, fix CI, scan security, and deploy. Current community entries also automate refactoring with a deterministic merge gate. Those are competent but hard to remember because their unit of value is still the code change.

Existing tools cover important fragments:

- GitLab can run Pa11y and surface an accessibility report in a merge request.
- axe and Pa11y identify many page-level accessibility violations but do not prove a domain journey remains reachable.
- visual regression tools compare pixels but do not model whether a wheelchair user lost the only viable path.
- ordinary test-impact selection answers “which tests are related?” rather than “which people can no longer complete their journey?”
- policy-as-code checks known predicates but does not discover a missing counterexample or explain the smallest failure to a reviewer.
- generic AI review can suggest plausible risks but cannot be the final authority for graph reachability or release safety.

RouteWitness fills the gap between DOM accessibility checking and real service accessibility. It combines agent-generated hypotheses with deterministic counterfactual proof and deploy-time replay.

### 2.4 Concepts evaluated

Scores are relative, 1–5, weighted toward the published judging rubric and the remaining build time.

| Concept | Originality | Feasibility | Duo depth | Demo impact | Specific impact | Total / 25 | Decision |
|---|---:|---:|---:|---:|---:|---:|---|
| Generic five-agent DevSecOps conveyor | 2 | 5 | 4 | 3 | 2 | 16 | Rejected: heavily represented and easy to look interchangeable. |
| AI refactoring readiness and auto-merge gate | 2 | 4 | 4 | 3 | 3 | 16 | Rejected: a current entrant already demonstrates this pattern. |
| Autonomous dependency/supply-chain remediator | 3 | 3 | 4 | 3 | 4 | 17 | Rejected: valuable, but security remediation is common and a rushed auto-fix can be unsafe. |
| Carbon-aware pipeline scheduler | 4 | 2 | 4 | 3 | 3 | 16 | Rejected as primary: credible carbon measurement would consume the deadline and weak measurement would hurt trust. |
| **RouteWitness accessibility counterfactual release twin** | **5** | **4** | **5** | **5** | **5** | **24** | **Selected.** It reuses a verified graph engine, creates a memorable failure/recovery story, and makes human control meaningful. |

## 3. Final Selected Project Idea and Product Definition

### 3.1 Problem

A route-planning application can pass unit tests, build successfully, and show zero automated page-accessibility violations while a data or algorithm change still removes the only viable journey for a particular mobility profile. Code reviewers rarely reason across every origin, destination, barrier, persona, and infrastructure state. A production incident may therefore be discovered by the person who is stranded.

### 3.2 Target users

- maintainers of accessible navigation and public-infrastructure software;
- university or municipal digital-service teams;
- release managers responsible for safety- or equity-sensitive route data;
- accessibility engineers who need reproducible evidence rather than an AI assurance;
- open-source maintainers who cannot manually replay every user journey on every merge request.

### 3.3 Real-world use cases

1. A campus map update removes an elevator edge because a building identifier changed.
2. A routing optimization accidentally treats stairs as a soft penalty rather than a hard exclusion.
3. A temporary lift outage makes a destination unreachable for the step-free profile even though the default route still works.
4. A slope or path-width attribute is omitted and the candidate silently falls back to unsafe assumptions.
5. A UI change passes DOM scans but prevents a keyboard user from selecting the accessibility profile needed to obtain a safe route.

### 3.4 One-sentence value proposition

**RouteWitness turns every accessibility-sensitive merge request into a proven before/after journey, a staged deployment, and one informed human release decision.**

### 3.5 Unique kernel

The **Journey Witness** is a minimal, replayable proof consisting of:

- exact baseline and candidate commit SHAs;
- input fixture and data-schema version;
- origin, destination, mobility profile, and active barriers;
- baseline result and candidate result;
- violated invariant and smallest counterexample;
- agent hypothesis plus deterministic verdict;
- relevant test/security/deployment evidence links;
- candidate revision URL and replay result;
- policy version and protected-policy hash;
- human approval identity/time for production promotion.

The witness is canonical JSON plus a readable HTML/Markdown rendering. Hash the canonical JSON with SHA-256. A hash is an integrity checksum, **not** a blockchain or legal attestation.

## 4. Core and Wow-Factor Features

### 4.1 MVP features

1. **MR-aware impact classifier**
   - Detect changes to graph fixtures, route rules, constraint logic, incidents, and relevant UI.
   - Produce a deterministic impact manifest listing affected nodes, edges, profiles, scenarios, and required test families.

2. **GitLab Duo Route Risk Flow**
   - Trigger when an MR is created/marked ready or when the service account is assigned as reviewer, depending on provisioned trigger availability.
   - Read MR diff and the deterministic impact manifest.
   - Generate structured risk hypotheses, likely failure modes, and candidate counterexamples.
   - Never declare a pass; hand hypotheses to deterministic tools.

3. **Counterfactual graph verifier**
   - Compare target-branch baseline with MR candidate over the benchmark matrix.
   - Assert hard invariants: no forbidden edge, no unexplained disconnection, no regression beyond configured debt threshold, deterministic result, complete required attributes.
   - Minimize a failure to the clearest origin/destination/profile/barrier witness.

4. **Protected policy boundary**
   - Store thresholds, schema, and protected benchmark definitions in a guarded directory.
   - Use `CODEOWNERS`, protected branch rules, and a CI job that loads policy from the target branch or verifies an approved policy hash.
   - The agent cannot alter its own judge, silently weaken thresholds, or mark an unverifiable result as passed.

5. **Release Receipt**
   - Generate JSON, Markdown, and HTML artifacts.
   - Render a visual before/after route map and a stage/evidence matrix.
   - Label every statement `MEASURED`, `INFERRED`, `NOT MEASURED`, or `HUMAN APPROVAL REQUIRED`.

6. **Candidate deployment and replay**
   - Build an OCI image, publish to GitLab Container Registry, mirror/use Google Artifact Registry as required by the chosen component, and deploy a tagged Cloud Run revision with no production traffic.
   - Replay the Journey Witness against the candidate URL.
   - Require a manual protected-environment production promotion after all evidence passes.

7. **Visible GitLab lifecycle**
   - MR note containing risk hypotheses and artifact links.
   - GitLab reports for JUnit, coverage, accessibility, dependency/security findings where available.
   - public pipeline history and auditable environments.

### 4.2 Wow-factor features

- **Counterexample minimization:** instead of a 300-case failure dump, show the single journey that proves the regression.
- **Persona blast-radius map:** display which mobility profiles and destinations are affected, not merely which files changed.
- **Agent disagreement surfaced:** show the agent’s initial risk hypothesis beside the deterministic outcome. A plausible but wrong AI conclusion becomes visible, not buried.
- **Candidate replay:** the same witness must pass in source tests and against the deployed Cloud Run revision, closing the gap between CI and runtime.
- **Evidence lineage:** every card links back to the exact job, artifact, commit, policy hash, and deployment revision.
- **Safe corrective branch:** if the candidate fails, the Duo flow may prepare a narrowly scoped corrective MR, but the original MR remains blocked and production promotion stays human-controlled.

### 4.3 Explicit non-goals

- no claim of legal, ADA, WCAG, or safety certification;
- no real campus geometry or personal mobility data in the demo;
- no autonomous production promotion;
- no LLM as the pass/fail oracle;
- no bespoke blockchain, vector database, or multi-cloud abstraction;
- no environmental prize claim unless real, reproducible SCI-compatible measurements are produced;
- no attempt to replace manual screen-reader, mobility, or field testing.

## 5. End-to-End User Flow

1. A maintainer opens an MR that removes or renames a lift-connected edge.
2. The GitLab trigger starts the Route Risk Flow.
3. The read-only analysis agent inspects the MR, project rules, and impact manifest, then posts concise risk hypotheses through a separate limited writer component.
4. The MR pipeline checks provenance and policy integrity, calculates the change impact, and runs targeted tests.
5. The counterfactual verifier finds that the default profile remains connected but the step-free profile loses its only route to the science lab.
6. CI emits a red Journey Witness with the minimal failing case and blocks the MR.
7. The flow proposes a narrow fix or opens a corrective MR that restores the elevator mapping/fallback logic.
8. The corrected pipeline passes unit, property, UI, accessibility, security, and evidence checks.
9. CI packages the image and deploys a tagged, no-production-traffic Cloud Run candidate.
10. A synthetic replay calls the candidate health/evidence endpoint and replays the exact witness.
11. RouteWitness emits a green Release Receipt tied to the candidate revision.
12. The release manager reviews one evidence bundle and manually approves the protected production job.
13. GitLab promotes traffic, verifies the production endpoint, and posts the final receipt link to the MR.

## 6. GitLab Duo Agent Platform Design

### 6.1 Flow topology

Use custom flow YAML under `.gitlab/duo/flows/route-witness.yml` and publish/configure it through the AI Catalog if provisioning permits.

```text
MR event / reviewer assignment
        |
        v
Read-only Impact Analyst
  reads diff, AGENTS.md, policy summary, impact manifest
        |
        v
Hypothesis Structurer
  outputs schema-valid risks and candidate witnesses
        |
        +----> MCP client: compare_route_impact / minimize_counterexample
        |
        v
Write-limited Reporter
  can only create/update MR note with evidence links
        |
        v
Deterministic GitLab CI pipeline (release authority)
        |
        v
Pipeline-passed/failed trigger -> Evidence Summarizer
        |
        v
Human production approval
```

Separate read capability from write capability, following GitLab’s documented layered-agent security pattern. Treat MR content, fixture text, and tool output as untrusted data, never as instructions.

### 6.2 MCP evidence service

Implement a small local TypeScript MCP server used by the Duo flow. Tools must be deterministic and schema-validated:

| Tool | Input | Output | Side effects |
|---|---|---|---|
| `classify_route_change` | baseline/candidate refs or prepared diff path | impact manifest | none |
| `compare_route_impact` | profile/scenario matrix and refs | measured deltas/invariant verdicts | none |
| `minimize_counterexample` | failing cases | smallest stable Journey Witness | none |
| `render_release_receipt` | validated evidence manifest | artifact paths and checksum | writes only under `artifacts/route-witness/` |
| `get_release_evidence` | pipeline/commit identifier | normalized evidence summary | none |

Do not give the MCP process arbitrary shell or network access. Resolve refs to an allowlisted workspace, reject traversal, cap input size/time, and validate all JSON with Zod. CI invokes the same core library directly so the project remains testable even if Duo credits or MCP integration are unavailable.

### 6.3 Trigger fallback hierarchy

Trigger availability can differ across provisioned GitLab versions/features. Use this order and document which one actually works:

1. merge request `Created` or `Marked ready` trigger;
2. pipeline event trigger for passed/failed evidence summary;
3. assign the flow service account as MR reviewer;
4. explicit `@service-account` mention as a recorded fallback.

Never simulate a trigger in the demo without labeling it. Capture a genuine Duo session and pipeline.

### 6.4 Autonomous action boundary

| Agent may do autonomously | Deterministic system decides | Human must decide |
|---|---|---|
| analyze diff, form hypotheses, select relevant existing tests, call read-only evidence tools, create MR notes, prepare a corrective branch/MR | graph reachability, constraint compliance, regression thresholds, policy integrity, test/security/build/deploy-replay pass | production promotion; policy/threshold changes; accepting an unexplained regression; widening permissions |

## 7. Lifecycle Stage Coverage

Do not merely label stages; generate evidence for each one.

| Stage | Implementation | Visible proof |
|---|---|---|
| Plan | Duo flow converts MR diff into a risk/test plan and affected-persona manifest. | MR note + `impact-manifest.json`. |
| Create | Duo prepares a narrow corrective MR when the candidate violates an invariant. | real corrective MR/commit attributed correctly. |
| Verify | Unit, property, graph differential, Playwright, axe/Pa11y, and deployed witness replay. | JUnit, coverage, accessibility report, witness artifact. |
| Package | OCI image built and stored in GitLab Container Registry with commit tag/digest. | registry package and pipeline job. |
| Secure | dependency audit, secret scan, SAST/container scan if available, SBOM/license inventory, prompt-injection boundary tests. | GitLab reports/artifacts with honest availability labels. |
| Release | candidate Cloud Run revision, evidence gate, manual protected production promotion. | GitLab environment and deployment history. |
| Configure | versioned policy/schema plus environment-specific config validated in CI. | policy hash and config-diff artifact. |
| Monitor | health check and post-deploy Journey Witness replay; rollback job if invariant fails. | monitor job, logs, final receipt. |
| Govern | CODEOWNERS, protected policy, least-privilege service account, DCO, traceable approval and evidence retention. | rules/configuration screenshots and receipt fields. |

## 8. Technical Architecture

### 8.1 System view

```text
Developer / Merge Request
        |
        v
GitLab Duo trigger ---> Custom Route Risk Flow ---> restricted MCP evidence tools
        |                         |                         |
        |                         +---- MR risk note <-----+
        v
GitLab CI pipeline
  provenance -> policy integrity -> impact -> tests -> security -> receipt
        |
        v
OCI image / GitLab Container Registry
        |
        v
Google Artifact Registry + Cloud Run tagged candidate (0% production traffic)
        |
        v
deployed witness replay -> protected manual promotion -> production smoke/witness
        |
        v
Release Receipt attached to exact commit, image digest, revision and approver
```

### 8.2 Recommended stack

| Area | Choice | Rationale |
|---|---|---|
| Existing app | React 18, strict TypeScript, Vite, vanilla CSS | Preserve AccessGraph’s small, tested client-side core; avoid framework migration. |
| Domain verifier | TypeScript/Node 22, pure functions, Zod schemas | Reuse graph types, deterministic tests, simple CI execution. |
| Agent platform | GitLab Duo custom flow, triggers, AI Catalog, project `AGENTS.md` | Mandatory sponsor technology and visible agentic orchestration. |
| Tool boundary | Model Context Protocol server in TypeScript | Gives Duo narrow, typed domain tools instead of arbitrary shell power. |
| CI/CD | GitLab CI/CD, child jobs only if necessary, JUnit/coverage/accessibility artifacts | Makes post-code workflow and evidence visible to judges. |
| Testing | Vitest, fast-check for properties, Playwright, `@axe-core/playwright`, GitLab Pa11y template where feasible | Covers deterministic domain invariants and interface behavior. |
| Packaging | Multi-stage Dockerfile, non-root Nginx or small Node static server, OCI image | Reproducible deployment and package-stage evidence. |
| Deployment | Google Cloud Run, Artifact Registry, Workload Identity Federation | Meets Path B deployment, earns bonus eligibility, supports tagged no-traffic revisions. |
| Monitoring | Cloud Run health endpoint, CI post-deploy replay, Cloud Logging | Small, demonstrable runtime proof without a new observability platform. |
| Data | versioned JSON fixtures + JSON Schema/Zod; GitLab artifacts as evidence store | No operational database is needed for a deterministic static app. |

Do not add a database merely to appear complex. The repository, container registry, pipeline artifacts, and Cloud Run revision history already provide the appropriate state systems.

### 8.3 Frontend structure

Preserve the AccessGraph user experience. Add only a judge-facing **Release Evidence** route/panel that consumes a bundled or fetched receipt:

- summary banner: blocked / candidate verified / production approved;
- baseline-versus-candidate route diagram;
- persona blast-radius matrix;
- minimal Journey Witness card;
- nine-stage evidence timeline;
- claim labels (`MEASURED`, `INFERRED`, `NOT MEASURED`);
- links to GitLab jobs/artifacts and Cloud Run revision;
- clear synthetic-data and non-certification disclosure.

Visual direction: civic operations dossier, not a generic AI dashboard. Use AccessGraph’s established typography and restrained civic palette, strong information hierarchy, tabular numerals, accessible focus states, no glassmorphism, no neon, no animated gradient, and no decorative chatbot bubbles.

### 8.4 Backend/automation structure

There is no conventional runtime backend. The automation layer consists of:

- pure domain analysis library shared by CI and MCP;
- CLI commands for impact, comparison, minimization, receipt generation, and deployed replay;
- restricted MCP adapter around those commands;
- CI orchestration and Cloud Run deployment configuration;
- optional minimal `/healthz`, `/version.json`, and `/evidence/latest.json` static/runtime endpoints.

### 8.5 Data model

```ts
type EvidenceStatus = 'MEASURED' | 'INFERRED' | 'NOT_MEASURED' | 'HUMAN_APPROVAL_REQUIRED';

interface ImpactManifest {
  schemaVersion: string;
  baselineSha: string;
  candidateSha: string;
  changedFiles: string[];
  affectedNodeIds: string[];
  affectedEdgeIds: string[];
  affectedProfiles: string[];
  requiredScenarioIds: string[];
  requiredTestFamilies: string[];
}

interface JourneyWitness {
  witnessId: string;
  baselineSha: string;
  candidateSha: string;
  policyVersion: string;
  policyHash: string;
  fixtureVersion: string;
  originId: string;
  destinationId: string;
  profileId: string;
  activeBarrierIds: string[];
  baseline: RouteOutcome;
  candidate: RouteOutcome;
  invariantId: string;
  verdict: 'PASS' | 'BLOCK';
  evidenceStatus: EvidenceStatus;
}

interface ReleaseReceipt {
  schemaVersion: string;
  pipelineUrl: string;
  commitSha: string;
  imageDigest: string;
  cloudRunRevision: string;
  candidateUrl: string;
  witnessSummary: JourneyWitness[];
  gateResults: GateResult[];
  lifecycleEvidence: StageEvidence[];
  approval?: { actor: string; timestamp: string; environment: string };
  checksumSha256: string;
}
```

Canonicalize key order before hashing. Check generated artifact schemas in CI. Do not store user profiles, personal routes, access tokens, or secrets in receipts.

## 9. Security, Privacy, and Trust Model

### 9.1 Threats to handle

- prompt injection embedded in source comments, fixtures, MR descriptions, or generated artifacts;
- an agent weakening its own policy, baseline, tests, or approval rule;
- forged/stale evidence attached to the wrong commit;
- path traversal or command injection through MCP arguments;
- credentials embedded in repo, CI logs, images, or video;
- over-privileged GitLab/GCP service accounts;
- supply-chain and license incompatibility;
- a successful source test but failed deployed behavior;
- misleading claims based on synthetic data.

### 9.2 Controls

- layered read-only analyst and write-limited reporter agents;
- explicit “data is not instruction” prompts and adversarial fixture tests;
- JSON schema validation and allowlisted tool parameters;
- no arbitrary shell tool exposed via MCP;
- target-branch/protected policy authority, CODEOWNERS, protected environments;
- evidence contains commit SHA, image digest, Cloud Run revision, policy hash, and timestamps;
- Workload Identity Federation instead of long-lived GCP JSON keys;
- least-privilege GitLab service account and GCP deployer roles;
- secret scanning of full available Git history and build artifacts;
- dependency audit, SBOM/license inventory, pinned images/actions/components where practicable;
- synthetic campus data only; no personal information or real access needs logged;
- post-deploy replay before production approval;
- human approval for production and guardrail changes.

## 10. Implementation Plan

### Phase 0 — Eligibility and provenance (first, fail fast)

1. Complete GitLab contributor onboarding immediately; approval may take about 24 business hours.
2. Confirm the hackathon-provisioned project has Duo Agent Platform access and remaining credits.
3. Import AccessGraph into that GitLab project without rewriting original history.
4. Add `docs/PRIOR_WORK.md` with original URL, original HEAD SHA/date, imported baseline SHA, and a precise list of new hackathon work.
5. Confirm the MIT license is present and visible in GitLab About.
6. Record a baseline tag such as `pre-routewitness-baseline`.

**Exit:** judges can distinguish prior AccessGraph work from new RouteWitness work.

### Phase 1 — Deterministic vertical slice

1. Define Zod/JSON schemas for impact manifest, witness, gate result, and receipt.
2. Implement baseline/candidate loading without executing untrusted branch scripts.
3. Implement affected-edge/profile/scenario classification.
4. Implement differential route evaluation and invariant checks.
5. Seed one intentional regression fixture and prove it produces a stable minimal witness.
6. Generate JSON + Markdown receipt.

**Exit:** one command compares two refs and produces a reproducible block/pass verdict.

### Phase 2 — CI evidence spine

1. Build `.gitlab-ci.yml` stages: provenance, plan, verify, secure, package, deploy-candidate, replay, promote, monitor, evidence.
2. Run targeted tests from the manifest plus mandatory policy/security tests.
3. Export JUnit, coverage, accessibility, impact, witness, SBOM/license, and receipt artifacts.
4. Add policy integrity checks sourced from target branch/protected hash.
5. Ensure every job fails closed on missing, malformed, stale, skipped, or wrong-SHA evidence.

**Exit:** the intentional regression is visibly blocked in an MR pipeline for the correct domain reason.

### Phase 3 — Duo flow and MCP integration

1. Implement/test restricted MCP tools around the pure domain library.
2. Add project `AGENTS.md` and concise route-risk agent instructions.
3. Configure layered custom flow: reader → hypothesis → tool calls → write-limited MR reporter.
4. Configure the best available real trigger and record its setup.
5. Test prompt injection, malformed tool input, timeout, missing artifact, and exhausted-credit fallback.

**Exit:** a genuine Duo run posts useful, evidence-linked MR analysis without controlling the verdict.

### Phase 4 — Package and Google Cloud candidate

1. Add multi-stage, non-root Dockerfile and health/version endpoints.
2. Build/push an immutable commit-tagged image and capture digest.
3. Configure WIF between GitLab and Google Cloud; document least-privilege roles.
4. Deploy a tagged Cloud Run candidate with no production traffic.
5. Replay the Journey Witness against the tagged candidate URL.
6. Configure a protected/manual promotion job and rollback command.

**Exit:** pipeline shows a verified candidate and one human-controlled production decision; public live URL works.

### Phase 5 — Evidence Board and demo polish

1. Add the Release Evidence UI using authentic receipt data.
2. Add baseline/candidate SVG route comparison and stage timeline.
3. Test responsive layouts, keyboard flow, contrast, overflow, loading/error/empty states.
4. Capture authentic screenshots from the running app and GitLab pipeline.
5. Rehearse the under-three-minute demo on the exact submitted pipeline and URLs.

**Exit:** a judge understands the problem, sees the failure, understands the fix, and verifies the deployment without reading source first.

### Phase 6 — Truth and submission freeze

1. Run the full quality suite once targeted checks are stable.
2. Generate machine-readable final evidence from the current commit—not hand-entered totals.
3. Reconcile README, Devpost copy, screenshots, video, and receipts against the same final evidence.
4. Check all links in a signed-out/private browser.
5. Freeze the submitted commit, pipeline, deployment, video, and Devpost entry.

## 11. Recommended Repository Structure

```text
/
├─ AGENTS.md
├─ LICENSE
├─ README.md
├─ Dockerfile
├─ .gitlab-ci.yml
├─ .gitlab/
│  ├─ duo/
│  │  ├─ flows/route-witness.yml
│  │  ├─ prompts/
│  │  └─ mcp.json
│  ├─ issue_templates/
│  └─ merge_request_templates/
├─ policy/
│  ├─ route-invariants.json
│  ├─ benchmark-scenarios.json
│  ├─ evidence.schema.json
│  └─ README.md
├─ src/                         # existing AccessGraph app
│  ├─ components/
│  ├─ domain/
│  └─ release-evidence/
├─ route-witness/
│  ├─ core/
│  │  ├─ classify.ts
│  │  ├─ compare.ts
│  │  ├─ minimize.ts
│  │  ├─ receipt.ts
│  │  └─ schemas.ts
│  ├─ cli/
│  └─ mcp/
├─ scripts/
│  ├─ verify-provenance.ts
│  ├─ verify-policy-integrity.ts
│  ├─ replay-deployment.ts
│  └─ generate-final-evidence.ts
├─ tests/
│  ├─ unit/
│  ├─ property/
│  ├─ adversarial/
│  ├─ e2e/
│  └─ fixtures/regression-demo/
├─ deploy/
│  ├─ cloud-run/
│  └─ workload-identity/
├─ docs/
│  ├─ PRIOR_WORK.md
│  ├─ ARCHITECTURE.md
│  ├─ THREAT_MODEL.md
│  ├─ DEMO_SCRIPT.md
│  ├─ DEVPOST_SUBMISSION.md
│  ├─ SUBMISSION_CHECKLIST.md
│  └─ assets/
└─ artifacts/                  # generated and gitignored except curated examples
```

## 12. Testing and Acceptance Contract

### 12.1 Required tests

- unit tests for classification, comparison, minimization, canonicalization, and checksum;
- property tests: deterministic output, no forbidden edge in a constrained route, baseline/candidate identity produces zero delta, minimization preserves failure;
- golden regression test for the signature elevator-edge failure;
- schema tests for every evidence artifact;
- adversarial tests for prompt-injection text and malicious paths/oversized inputs;
- CI tests proving missing/stale/wrong-SHA artifacts fail closed;
- Playwright journey for failure → fix → evidence UI;
- automated axe scans plus keyboard/focus/overflow/touch-target assertions;
- container health/version/evidence endpoint tests;
- deployed candidate replay;
- negative control showing an unrelated documentation change does not fabricate route impact.

### 12.2 Evidence rules

- Never hard-code test totals or coverage into documentation.
- Generate `docs/verification-results.json` only after all final jobs pass.
- Each artifact records generator version, schema version, commit SHA, and timestamp.
- A pipeline is not “green” for submission if a required job was skipped.
- Automated accessibility results must be described as automated findings in tested states, not full WCAG compliance.
- Synthetic scenarios must be labeled synthetic everywhere.

### 12.3 Definition of done

- [ ] real GitLab Duo flow run visible;
- [ ] real trigger or explicitly labeled manual fallback visible;
- [ ] deterministic Journey Witness blocks the seeded regression;
- [ ] corrective change produces a passing witness;
- [ ] all required CI evidence exists for the same SHA;
- [ ] OCI image digest is tied to receipt;
- [ ] Cloud Run candidate and production URL are public and replayed;
- [ ] protected human promotion is demonstrated;
- [ ] all nine stage claims link to evidence;
- [ ] README and Devpost copy contain no unsupported claims;
- [ ] under-three-minute video plays signed out;
- [ ] repository public, MIT visible, pipeline history visible;
- [ ] original AccessGraph URL and before/after disclosure present.

## 13. Demo Strategy

### 13.1 Judge takeaway

“A normal pipeline saw a harmless map edit. RouteWitness saw the person it would strand, proved the exact journey, fixed the regression, replayed the proof on a real candidate deployment, and asked a human only for the decision that mattered.”

### 13.2 Target runtime: 2:35, hard maximum 2:55

| Time | Scene | Visual proof | Narration goal |
|---|---|---|---|
| 0:00–0:15 | Human impact hook | Default route works; step-free route becomes disconnected after a tiny edge change. | Establish that passing builds can still strand a user. |
| 0:15–0:32 | MR and trigger | GitLab MR diff and genuine Duo flow session starts. | Show mandatory technology immediately. |
| 0:32–0:58 | Agent reasoning | Concise MR note lists affected profiles and hypotheses. | Explain that the agent decides what to investigate, not what is true. |
| 0:58–1:25 | Deterministic block | Pipeline fails; minimal Journey Witness and before/after map appear. | Deliver the signature “only usable route disappeared” moment. |
| 1:25–1:47 | Correction | Show corrective MR/commit restoring mapping or safe fallback. | Prove useful creation, not merely critique. |
| 1:47–2:12 | Candidate deployment | Green pipeline, image digest, Cloud Run tagged candidate, replay pass. | Close the CI-to-runtime gap and show GCP. |
| 2:12–2:35 | Human governance | Release Receipt, nine stages, protected production approve, live app. | Show supervised autonomy and trustworthy control. |

Use authentic screen recordings and artifacts only. Keep music royalty-free or omit it. Hide tokens, emails, unrelated tabs, IDs not needed for proof, and any account billing details.

### 13.3 Required capture assets

- MR diff containing the intentional accessibility regression;
- genuine Duo flow/session and trigger configuration;
- red pipeline graph and failed witness artifact;
- before/after/minimal counterexample SVG;
- corrective MR or commit;
- green pipeline graph;
- container registry digest;
- Cloud Run tagged candidate and public production revision;
- deployed replay result;
- final Release Receipt and evidence board;
- GitLab project About panel showing MIT license;
- public repo and live URL checked while signed out.

## 14. Devpost Submission Strategy

### Project title

`RouteWitness` (working title; human-confirm before publishing)

### Tagline

`A GitLab Duo release flow that proves who a route change would strand before production.`

### Opening paragraph

Lead with the human consequence and the proof, not a list of frameworks:

> A route change can pass every normal build and still erase the only usable journey for a wheelchair user. RouteWitness turns an AccessGraph merge request into a counterfactual user-journey proof, a verified Cloud Run candidate, and one evidence-backed human release decision.

### Description structure

1. problem and specific audience;
2. 20-second signature scenario;
3. how the Duo flow and deterministic verifier cooperate;
4. before/after transformation of the existing AccessGraph project;
5. evidence for each lifecycle stage;
6. trust boundary and why autonomy is supervised;
7. measured results only;
8. limitations and next step.

### Mandatory URLs/fields

- public GitLab project URL;
- original MIT project URL: `https://github.com/abhijeetnardele24-hash/accessgraph`;
- public Cloud Run URL, live through winner announcement;
- YouTube demo URL under three minutes;
- repository setup and judging instructions;
- explanation of new work performed during submission period;
- selected Path B and Supervised category;
- Google Cloud bonus details and deployment code location;
- Most Stages Covered and Most Creative prize selection if the form allows;
- Environmentally Impactful opt-in only if a valid measurement exists.

## 15. Risks and Fallbacks

| Risk | Early detection | Fallback |
|---|---|---|
| GitLab contributor access delayed | onboarding not approved within expected window | complete deterministic core and CI locally; integrate immediately on access. Submission still requires genuine Duo evidence, so escalate through official Discord rather than faking it. |
| Desired trigger unavailable | trigger UI/event absent | use reviewer assignment or explicit mention; state the exact trigger used. |
| Duo credits exhausted | usage indicator or flow refusal | conserve runs with deterministic local tests; reserve credits for recorded end-to-end runs. Core verifier remains runnable without LLM. |
| MCP integration unstable | schema/tool call fails in a minimal test | have flow consume pre-generated CI JSON and keep direct CLI invocation; do not claim MCP if removed. |
| Agent output nondeterministic | schema failures or inconsistent hypotheses | constrain output schema, temperature/model settings if exposed, and keep verdict outside the LLM. |
| Cloud Run/IAM delay | WIF deploy fails in isolated smoke test | deploy manually once to validate service, then fix automated WIF; Path B still requires deployment and the bonus requires code/public GCP URL. |
| Full nine-stage scope threatens deadline | core failure/fix/candidate flow incomplete at midpoint | cut evidence-board animation, auto-fix, and optional security extras before cutting the core proof. |
| Existing project provenance questioned | unclear commit chronology | tag/import baseline and maintain `PRIOR_WORK.md` with immutable URLs/SHAs. |
| Accessibility overclaim | wording says compliant/certified | automated claim checker rejects “WCAG compliant,” “safe,” “certified,” and unscoped zero-violation language. |
| Video cannot fit under three minutes | rehearsal exceeds 2:55 | remove setup narration, not proof; use on-screen stage labels and tight cuts. |

## 16. MVP Versus Optional Enhancements

### Must ship

- Path B provenance and public MIT GitLab repo;
- one custom Duo flow with a real trigger/fallback invocation;
- deterministic impact comparison and Journey Witness;
- protected policy boundary;
- visible failing and passing pipelines;
- container package;
- Cloud Run candidate deployment and replay;
- human-controlled promotion;
- final receipt, README, screenshots, and sub-three-minute video.

### Add only after MVP is stable

- corrective MR generation;
- richer persona blast-radius visualization;
- pipeline event summarizer flow;
- full SBOM/container scanning when available in provisioned tier;
- route-impact-based test selection benchmark;
- SCI-aligned energy/carbon measurement and environmental prize opt-in;
- AI Catalog publishing beyond project scope.

## 17. Authoritative Sources

- [Hackathon overview, requirements, prizes, and judging](https://gitlab-transcend.devpost.com/)
- [Official rules](https://gitlab-transcend.devpost.com/rules)
- [Official hackathon resources](https://gitlab-transcend.devpost.com/resources)
- [GitLab Duo Agent Platform](https://docs.gitlab.com/user/duo_agent_platform/)
- [GitLab custom flow schema](https://docs.gitlab.com/user/duo_agent_platform/flows/custom_flows_schema/)
- [GitLab flow triggers](https://docs.gitlab.com/user/duo_agent_platform/triggers/)
- [GitLab Agent Platform security guidance](https://docs.gitlab.com/user/duo_agent_platform/security_threats/)
- [GitLab customization and protected instruction guidance](https://docs.gitlab.com/user/duo_agent_platform/customize/)
- [GitLab accessibility testing](https://docs.gitlab.com/ci/testing/accessibility_testing/)
- [GitLab CI report artifact types](https://docs.gitlab.com/ci/yaml/artifacts_reports/)
- [GitLab Cloud Run deployment tutorial](https://docs.gitlab.com/tutorials/create_and_deploy_web_service_with_google_cloud_run_component/)
- [Cloud Run rollouts, no-traffic revisions, and rollback](https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration)
- [Original AccessGraph repository](https://github.com/abhijeetnardele24-hash/accessgraph)

## 18. Final Requirement Coverage Checklist

- [x] Strong Path B candidate identified with existing public MIT source.
- [x] GitLab Duo Agent Platform is essential to the workflow.
- [x] Autonomy level selected and defensible: Supervised.
- [x] Complete, coherent post-code story covers plan through govern.
- [x] Google Cloud deployment is designed into the MVP.
- [x] Original project URL and before/after disclosure are required.
- [x] Public GitLab repo, MIT license, pipeline history, setup instructions, and live URL are accounted for.
- [x] Under-three-minute working demo has a timed plan.
- [x] Security, privacy, prompt injection, permissions, and evidence integrity are addressed.
- [x] UI, backend/automation, data model, integrations, tests, and folder structure are defined.
- [x] MVP is bounded; optional features cannot displace the signature proof.
- [x] Claims are evidence-scoped and synthetic data is disclosed.
- [x] Judge impact is concentrated in one memorable failure-to-proof-to-release sequence.

