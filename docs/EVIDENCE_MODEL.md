# RouteWitness — Evidence Model & Receipt Specification

> **Project:** RouteWitness (Path B — AccessGraph)  
> **Standard:** Machine-Verifiable Accessibility Release Twin

---

## 1. Core Principles

RouteWitness treats software releases for accessible transit and wayfinding as safety-sensitive operations. To eliminate AI hallucinations and ungrounded "all green" claims, all evidence adheres to three core rules:

1. **Deterministic Authority:** The verdict (`PASS` vs `BLOCK`) is computed strictly by pure TypeScript graph reachability code. An LLM may generate risk hypotheses and explanatory narrative, but never sets the verdict.
2. **Cryptographic Binding:** Every evidence artifact embeds the immutable Git commit SHA, policy hash, generator version, schema version, and timestamp.
3. **Honest Vocabulary:** Every lifecycle stage and gate result must be explicitly tagged with one of four evidence statuses.

---

## 2. Evidence Status Vocabulary

| Status | Definition | Example Usage |
|---|---|---|
| `MEASURED` | Verified directly by machine execution, test assertions, or HTTP probe. | Route connectivity, Vitest 72 tests passed, Axe automated accessibility scan, /healthz probe. |
| `INFERRED` | Formed through probabilistic analysis or heuristic modeling. | GitLab Duo risk hypotheses regarding user impact. |
| `NOT_MEASURED` | Feature or check was not executed (due to tier absence or configuration). | Optional cloud scanners or disabled third-party integrations. |
| `HUMAN_APPROVAL_REQUIRED` | An outward-facing safety or production promotion decision that must be made by an authorized human maintainer. | Shifting traffic to 100% on production Cloud Run deployment. |

---

## 3. The Artifact Hierarchy

### A. ImpactManifest (`artifacts/route-witness/impact-manifest.json`)
Generated during the `plan` stage by the GitLab Duo Impact Analyst:
- `changedFiles`: list of repository files altered in the MR.
- `affectedNodeIds` & `affectedEdgeIds`: graph topology impacted by diff.
- `affectedProfiles`: mobility profiles requiring re-evaluation.
- `requiredTestFamilies`: subset of test suites selected for execution.

### B. JourneyWitness (`artifacts/route-witness/witnesses.json`)
The atomic unit of proof:
- Binds origin, destination, mobility profile, and active barriers.
- Records both baseline and candidate route outcome (distance, duration, rejected edges).
- Evaluates hard invariant (e.g. `INV-01`: No Unexplained Disconnection).
- Emits deterministic verdict: `PASS` or `BLOCK`.

### C. Minimal Counterexample (`artifacts/route-witness/minimal-witness.json`)
When an MR violates an invariant, the reducer algorithm ranks all failing witnesses by minimality (fewest barriers, shortest journey path, simplest explanation) to present reviewers with a single actionable counterexample rather than a massive failure dump.

### D. Release Receipt (`artifacts/route-witness/release-receipt.json` & `.md`)
The complete, tamper-evident bundle binding:
- Commit SHA and Pipeline URL
- Container image digest and Cloud Run candidate revision
- All JourneyWitness proofs and GateResults
- Nine-stage lifecycle evidence table
- Canonical JSON SHA-256 integrity checksum

---

## 4. Integrity Checksum Algorithm

The Release Receipt SHA-256 checksum is computed over recursively key-sorted canonical JSON (`canonicalizeJson`), with the checksum field temporarily set to `"COMPUTING"`.

```ts
import { createHash } from "crypto";

export function computeReceiptChecksum(receipt: Omit<ReleaseReceipt, "checksumSha256">): string {
  const canonical = canonicalizeJson({ ...receipt, checksumSha256: "COMPUTING" });
  return createHash("sha256").update(canonical).digest("hex");
}
```

> **Note on Cryptographic Claims:** The checksum is an integrity verification mechanism to detect tampering and out-of-order execution. It is **not** a blockchain proof, digital signature, or legal attestation.
