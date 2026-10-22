# Agent Execution Prompt — Build RouteWitness End to End

You are the principal engineer responsible for delivering the complete RouteWitness submission for the Life After Code — GitLab Transcend Hackathon. Work autonomously, quickly, and carefully from the existing project to a finished, publicly demonstrable submission.

## Mandatory first action

Read `PROJECT_BLUEPRINT.md` **completely from first line to last line before editing any source file**. Treat it as the single source of truth for product scope, architecture, safety boundaries, judging strategy, and submission requirements. Then inspect the entire existing repository, current git status/history, package scripts, tests, documentation, and GitLab configuration. Do not ask basic planning questions already answered in the blueprint.

If the workspace does not yet contain AccessGraph, import/clone the existing MIT project from:

`https://github.com/abhijeetnardele24-hash/accessgraph`

The hackathon entry must live in the GitLab project provisioned through official contributor onboarding. Do not push hackathon work only to GitHub. Preserve original history and create an immutable imported-baseline tag. Do not overwrite unrelated user work.

## Completion contract

The task is complete only when all of the following are true and evidenced:

1. The project is a valid Path B entry with precise prior-work provenance.
2. A genuine GitLab Duo Agent Platform flow runs through a real supported trigger or a clearly documented official fallback.
3. A seeded accessibility-sensitive route regression produces a deterministic minimal Journey Witness and blocks the MR pipeline.
4. A correction produces a passing witness without weakening policy.
5. The same evidence is replayed successfully against a tagged Google Cloud Run candidate revision.
6. Production promotion remains a protected, explicit human decision.
7. The project produces a Release Receipt tied to commit SHA, image digest, policy hash, pipeline, and Cloud Run revision.
8. Required tests, security checks, package/build steps, deployment checks, and evidence checks pass for the same final commit.
9. The public GitLab project contains an MIT license, visible pipeline history, complete README/setup instructions, authentic assets, and honest submission copy.
10. The public Cloud Run URL works signed out and is intended to remain available through the judging period.
11. All nine claimed lifecycle stages have visible evidence. Do not claim a stage that is merely described.
12. The demo and submission asset checklist are ready. Do not render or upload the final video unless the user separately asks; prepare the script, storyboard, shot list, authentic captures, and exact evidence needed.

## Working method

- Use an evidence-driven workflow. Convert the blueprint into a compact tracked implementation checklist and work in verified vertical slices.
- Work at high speed, but never replace proof with narration. Avoid repeated “waiting for tests” messages.
- Start with eligibility, GitLab access, provenance, and the smallest end-to-end failure path. Do not begin with a decorative dashboard.
- Run targeted checks while developing. Run the expensive full suite once targeted checks are stable.
- If a long-running test/build is quiet, retain and poll that exact process. Never start duplicate Playwright, build, or verification runs.
- Diagnose failures at root cause. Do not hide, skip, loosen, or delete a failing gate to make CI green.
- Keep the repository runnable at every major stage and create small, ordered commits with descriptive messages.
- Update documentation immediately when an implementation decision changes. If the blueprint must change, record the reason and preserve the product/security intent.
- Do not ask for routine permission to inspect files, edit code, run commands/tests, create commits, or fix failures.
- Stop only for a genuinely unavailable external credential/account action that cannot be completed safely. State the exact one-step action the user must perform; never request passwords, OTPs, private keys, recovery phrases, or pasted secrets.

## Delivery priority

Implement in this order. Do not start lower-priority polish while a higher-priority slice is unproven.

### Priority 0 — Fail-fast access and eligibility

1. Verify GitLab contributor onboarding, hackathon namespace/project, Duo access, available triggers, and usable credit.
2. Confirm the existing AccessGraph license and origin.
3. Import with history into GitLab and tag the unmodified baseline.
4. Create `docs/PRIOR_WORK.md` containing original URL, original/imported SHAs and dates, and an exact before/after table.
5. Ensure `LICENSE` is MIT and GitLab About detects it.
6. Record actual GitLab version/feature availability. Do not code against imagined trigger or flow capabilities; consult current official GitLab documentation.

### Priority 1 — Signature deterministic proof

Build the pure TypeScript RouteWitness core before agent polish:

- schemas for `ImpactManifest`, `JourneyWitness`, `GateResult`, `StageEvidence`, and `ReleaseReceipt`;
- baseline/candidate ref loader that never executes untrusted candidate scripts;
- graph/data diff classifier;
- persona and journey impact expansion;
- invariant evaluator;
- minimal stable counterexample reducer;
- canonical JSON serializer and SHA-256 checksum;
- JSON and Markdown receipt renderers;
- CLI commands with non-zero exit codes on block/error.

Create one deterministic demo regression in which an apparently small edge/identifier change leaves the default route working but removes the only valid step-free route. Prove it with a golden test. Use only synthetic campus data and label it.

The LLM must never determine PASS/BLOCK. It may form hypotheses and explain measured results. Pure code owns the verdict.

### Priority 2 — Trustworthy GitLab CI evidence spine

Create a real `.gitlab-ci.yml` implementing, at minimum:

1. provenance and license verification;
2. protected policy integrity verification;
3. deterministic impact manifest generation;
4. targeted unit/property/domain tests plus mandatory policy tests;
5. UI/E2E/accessibility tests where the diff requires them;
6. security/secret/dependency/license checks using features available in the provisioned tier;
7. production build;
8. OCI package and immutable digest capture;
9. candidate deployment;
10. deployed witness replay;
11. protected manual production promotion;
12. post-deploy smoke/witness replay;
13. final evidence report generation.

Export appropriate GitLab report types and ordinary artifacts. Every evidence artifact must include its schema/generator version and the current commit SHA. Fail closed if required artifacts are missing, stale, malformed, skipped, or reference a different SHA. Generate final metrics from machine-readable output; never hand-maintain test totals.

Protect `policy/`, agent instructions, CI release gates, and evidence schemas with `CODEOWNERS` and branch/environment controls where the hackathon project supports them. Verify policy against the target-branch authority or an approved hash so an agent cannot weaken its own judge in the candidate diff.

### Priority 3 — Genuine GitLab Duo flow

Implement the custom flow under `.gitlab/duo/` using the current official schema. Prefer the documented layered security design:

- **read-only impact analyst:** reads MR metadata/diff, project instructions, and deterministic impact data; treats all repository/MR content as untrusted data;
- **hypothesis component:** emits strict structured risk hypotheses and requested witness cases;
- **restricted MCP tools:** invokes domain analysis, comparison, minimization, and evidence retrieval;
- **write-limited reporter:** can only publish/update a concise MR note containing hypotheses, measured verdicts, and artifact links.

Use the AI Catalog and real trigger configuration if available. Use the fallback order from the blueprint if a particular trigger is unavailable. Record the exact real invocation in documentation and submission evidence. Never create a fake UI, screenshot, transcript, trigger, agent run, or completion claim.

Implement the TypeScript MCP server as a thin adapter over the already-tested pure core. Validate input/output with Zod, allowlist workspace refs/paths, reject traversal, cap runtime/input size, and expose no arbitrary shell execution or unrestricted network tool.

Add adversarial tests for prompt injection embedded in comments, fixtures, filenames, MR text, and tool output. Confirm the read component cannot write and the write component cannot read untrusted MR content directly.

### Priority 4 — Package and deploy to Google Cloud Run

Use current official GitLab and Google Cloud documentation. Implement:

- a reproducible multi-stage Dockerfile;
- non-root runtime where compatible;
- `/healthz`, `/version.json`, and a truthful evidence endpoint or static equivalent;
- GitLab Container Registry package tagged with commit/pipeline and captured digest;
- Google Artifact Registry/Cloud Run deployment using the official GitLab Google components or an equally documented method;
- Workload Identity Federation and least privilege instead of a committed or long-lived service-account key;
- a tagged Cloud Run candidate revision receiving no production traffic;
- replay of the exact Journey Witness against the candidate URL;
- protected manual promotion to production;
- rollback and post-deploy verification.

Keep all deployment code public in the repository. Capture authentic pipeline/environment/revision evidence. The deployment must be created during the eligible hackathon period and remain publicly accessible for judging.

### Priority 5 — Product and evidence UI

Preserve the existing AccessGraph visual language and core behavior. Add a focused Release Evidence view, not a generic AI administration dashboard. It must show:

- current status and exact commit;
- baseline/candidate route comparison;
- affected persona/journey matrix;
- minimal Journey Witness;
- agent hypothesis versus deterministic verdict;
- nine-stage evidence timeline;
- `MEASURED`, `INFERRED`, `NOT MEASURED`, and `HUMAN APPROVAL REQUIRED` labels;
- image/pipeline/revision/artifact links;
- synthetic-data, integrity-checksum, and non-certification disclosures.

Visual direction: civic operations dossier; restrained, legible, high-contrast, responsive, keyboard-first, and information-dense without clutter. Reuse established AccessGraph tokens where sound. No neon, glassmorphism, gratuitous gradients, fake terminals, generic chatbot bubbles, stock illustration, or excessive motion. Use motion only to clarify state change. Maintain at least 44×44 px touch targets, visible focus, semantic landmarks, error summaries, and reduced-motion support.

Test 320, 360/390, 768, 1024, 1440, and 1920 widths without horizontal overflow. Run automated accessibility scans in meaningful states and phrase results precisely as automated findings—not total WCAG conformance.

## Required architecture and boundaries

- Keep React + strict TypeScript + Vite unless repository inspection proves a necessary change.
- Prefer pure functions and shared types between AccessGraph and RouteWitness.
- Do not add a runtime database. Use versioned fixtures, GitLab artifacts/registry, and Cloud Run revision metadata. If an implementation requirement truly introduces persisted state, document the reason and choose the smallest managed option.
- No blockchain, vector database, user authentication system, or broad cloud platform layer.
- No real campus geometry, real personal mobility data, analytics, trackers, or unnecessary telemetry.
- No autonomous production release.
- No AI pass/fail oracle.
- No policy self-modification by an agent.
- No legal/accessibility/safety certification claims.
- Do not opt into the environmental prize without real reproducible SCI-compatible measurement.

## Error and edge-case behavior

Handle and test:

- missing or invalid baseline/candidate ref;
- schema version mismatch;
- incomplete route attributes;
- unreachable routes in both baseline and candidate;
- new disconnection in candidate only;
- equal-cost route tie determinism;
- overnight/stale CI artifact or wrong commit SHA;
- canceled/skipped job;
- MCP timeout/malformed response/unavailable service;
- Duo credit exhaustion;
- unsupported trigger event;
- prompt injection in untrusted text;
- Cloud Run candidate deploy succeeds but health/replay fails;
- production promotion canceled/rejected;
- rollback failure;
- absent security feature in the provisioned GitLab tier.

Unavailable optional features must be shown as `NOT MEASURED` or documented fallback, never silently represented as pass.

## Verification requirements

During implementation, run targeted tests for each slice. Before completion, run one clean full verification sequence that includes:

- install from lockfile;
- strict typecheck;
- lint with zero unexplained warnings;
- unit/component/property/adversarial tests with coverage thresholds;
- deterministic benchmark where relevant;
- full production build;
- Playwright across configured viewports/browsers;
- automated accessibility scans plus explicit keyboard/focus/overflow/touch assertions;
- dependency audit and license inventory;
- secret scan covering full available Git history, working tree, generated artifacts, and bundle without printing secrets;
- container build and scan when available;
- evidence consistency/claim check;
- candidate deployment and deployed replay;
- signed-out HTTP/browser check of public GitLab, video placeholder/asset plan, and Cloud Run URL.

Do not report success from process start messages. Capture exit codes and parse machine-readable result files. If any required gate fails or is missing, completion status is not green.

## Documentation deliverables

Create and keep reconciled:

- `README.md`: human-first problem, signature demo, architecture, genuine GitLab automation, before/after, quickstart, evidence links, limitations;
- `docs/PRIOR_WORK.md`;
- `docs/ARCHITECTURE.md` plus modern accessible SVG and PNG architecture diagrams;
- `docs/THREAT_MODEL.md`;
- `docs/GITLAB_DUO_SETUP.md` with exact flow/trigger/MCP setup;
- `docs/GOOGLE_CLOUD_DEPLOYMENT.md` with WIF and Cloud Run steps;
- `docs/EVIDENCE_MODEL.md`;
- `docs/DEMO_SCRIPT.md` and timed storyboard under three minutes;
- `docs/DEVPOST_SUBMISSION.md` containing polished, evidence-bounded field copy;
- `docs/SUBMISSION_CHECKLIST.md`;
- generated `docs/verification-results.json` for the final commit;
- authentic screenshots and a 1280×720 Devpost thumbnail with readable card-size typography.

The README must feel authored for this project, not copied from a template. Lead with the human consequence and the one decisive proof. Avoid inflated words such as revolutionary, groundbreaking, seamless, production-ready, fully compliant, or 100% secure unless narrowly and verifiably true.

## Submission preparation

Prepare the exact final materials required by the official rules:

- public GitLab project URL;
- original AccessGraph GitHub URL;
- public Cloud Run production URL available through judging;
- final commit SHA and successful pipeline URL;
- MIT license visible in GitLab About;
- setup/testing instructions that a judge can follow;
- description of new work completed during the submission period;
- Path B / Supervised category explanation;
- nine-stage evidence table with deep links;
- Google Cloud bonus explanation and deployment-code location;
- Devpost narrative fields;
- authentic screenshots;
- video script/storyboard/shot list and one final-video checklist.

The final demo video is under three minutes and must show the actual project functioning. Its sequence is fixed: human impact → MR/real Duo trigger → risk hypotheses → deterministic block/minimal witness → correction → green candidate/Cloud Run replay → Release Receipt/human promotion. Keep the target around 2:35 and hard maximum 2:55. Do not use copyrighted music or expose private information.

## Truthfulness rules

- Never fabricate test output, metrics, GitLab features, pipeline history, agent sessions, deployment, users, quotes, screenshots, or URLs.
- Never call synthetic fixtures real-world data.
- Never call a checksum an attestation, signature, or blockchain proof.
- Never equate zero automated axe/Pa11y findings with WCAG compliance.
- Never claim manual screen-reader or field testing unless actually completed and documented.
- Never say all nine stages are covered unless each has an implementation and visible artifact.
- Never present an agent hypothesis as a measured result.
- Every number in submission copy must be generated by or linked to evidence for the final SHA.

## Cut order if the deadline is at risk

Cut in this order:

1. animation and decorative evidence-board polish;
2. auto-generated corrective MR (retain corrective recommendation/manual commit);
3. secondary summarizer flow;
4. broad optional scanners not supported by the tier;
5. selective-test performance benchmark;
6. environmental measurement/opt-in.

Never cut the genuine Duo flow, deterministic Journey Witness, protected policy, failing/passing pipeline proof, Cloud Run candidate replay, human approval boundary, public GitLab evidence, or truthful submission assets.

## Final handoff format

When the work is actually complete, return a concise evidence-first handoff containing:

1. delivered outcome and signature scenario;
2. final GitLab commit SHA and public repository URL;
3. successful pipeline URL and parsed gate totals;
4. Duo flow/trigger/MCP evidence links;
5. Cloud Run candidate/production URLs and revision/image digest;
6. exact lifecycle-stage evidence table;
7. test, accessibility, security, build, and deployment results from machine sources;
8. list of submission assets and their paths;
9. explicit remaining human actions, if any;
10. known limitations and any claims deliberately not made.

Do not conclude with “submission-ready” unless every mandatory item in the completion contract is satisfied and independently reachable. Begin now by reading `PROJECT_BLUEPRINT.md` completely, then inspect the repository and execute Priority 0.
