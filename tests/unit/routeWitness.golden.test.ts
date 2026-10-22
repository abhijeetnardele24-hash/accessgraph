/**
 * RouteWitness — Golden Regression Test
 *
 * Proves deterministically that the signature ramp-node-rename regression:
 * 1. Is detected by the counterfactual verifier (BLOCK verdict)
 * 2. Only affects the step-free profile (fastest profile remains PASS)
 * 3. Produces a stable, reproducible minimal witness
 * 4. Does not regress unrelated journeys (Gate → Library)
 *
 * This test must be maintained as the "signature proof" — it is referenced
 * directly in the Devpost submission and GitLab MR demo.
 *
 * All data is SYNTHETIC. No real campus geometry or personal data.
 */

import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import {
  BASELINE_DATASET,
  CANDIDATE_DATASET,
  REGRESSION_SCENARIOS,
  FIXTURE_VERSION,
} from "../fixtures/regression-demo/lift-rename-regression.js";
import { ROUTE_PROFILES } from "../../src/domain/profiles.js";
import { compareRouteImpact } from "../../route-witness/core/compare.js";
import { minimizeCounterexample, formatWitnessCard } from "../../route-witness/core/minimize.js";
import { buildReleaseReceipt, canonicalizeJson, computeReceiptChecksum } from "../../route-witness/core/receipt.js";
import { classifyRouteChange } from "../../route-witness/core/classify.js";
import { DEMO_CAMPUS } from "../../src/data/demoCampus.js";

const FAKE_BASELINE_SHA = "a".repeat(40);
const FAKE_CANDIDATE_SHA = "b".repeat(40);
const FAKE_POLICY_HASH = createHash("sha256").update("policy-v1").digest("hex");

const profilesMap = new Map(Object.entries(ROUTE_PROFILES));
const scenarios = [...REGRESSION_SCENARIOS];

describe("RouteWitness — Golden Regression Proof", () => {
  describe("Fixture integrity", () => {
    it("baseline dataset has the ramp landing node", () => {
      const node = BASELINE_DATASET.nodes.find((n) => n.id === "node_ramp_landing_f2");
      expect(node).toBeDefined();
      expect(node?.id).toBe("node_ramp_landing_f2");
    });

    it("candidate dataset has renamed lift_f2 node", () => {
      const oldNode = CANDIDATE_DATASET.nodes.find((n) => n.id === "node_sci_lift_f2");
      const newNode = CANDIDATE_DATASET.nodes.find((n) => n.id === "node_sci_elevator_f2");
      expect(oldNode).toBeUndefined();
      expect(newNode).toBeDefined();
    });

    it("candidate edges still reference the old lift_f2 ID (dangling reference)", () => {
      const liftShaftEdge = CANDIDATE_DATASET.edges.find((e) => e.id === "edge_sci_lift_shaft");
      expect(liftShaftEdge).toBeDefined();
      // Edge references old ID but node list has new ID → dangling
      expect(liftShaftEdge?.to).toBe("node_sci_lift_f2");
      const liftNodeExists = CANDIDATE_DATASET.nodes.some(
        (n) => n.id === liftShaftEdge?.to
      );
      expect(liftNodeExists).toBe(false); // The dangling reference — this is the regression
    });

    it("both datasets have no active default barriers (clean structural test)", () => {
      expect(BASELINE_DATASET.defaultBarriers).toHaveLength(0);
      expect(CANDIDATE_DATASET.defaultBarriers).toHaveLength(0);
    });
  });

  describe("Core regression detection", () => {
    const result = compareRouteImpact({
      baselineSha: FAKE_BASELINE_SHA,
      candidateSha: FAKE_CANDIDATE_SHA,
      baselineDataset: BASELINE_DATASET,
      candidateDataset: CANDIDATE_DATASET,
      profiles: profilesMap,
      scenarios,
      policyHash: FAKE_POLICY_HASH,
      fixtureVersion: FIXTURE_VERSION,
      timestamp: "2026-10-22T00:00:00.000Z",
    });

    it("step-free scenario is BLOCK — baseline connected, candidate disconnected", () => {
      const w = result.witnesses.find(
        (w) => w.profileId === "step_free" && w.destinationId === "node_sci_lab"
      );
      expect(w).toBeDefined();
      expect(w!.baseline.connected).toBe(true);
      expect(w!.candidate.connected).toBe(false);
      expect(w!.verdict).toBe("BLOCK");
    });

    it("fastest (default) scenario is PASS — stairs route unaffected by ramp rename", () => {
      const w = result.witnesses.find((w) => w.profileId === "fastest" && w.destinationId === "node_sci_lab");
      expect(w).toBeDefined();
      expect(w!.baseline.connected).toBe(true);
      expect(w!.candidate.connected).toBe(true);
      expect(w!.verdict).toBe("PASS");
    });

    it("step-free Gate→Library is PASS — no side-effect regression", () => {
      const w = result.witnesses.find((w) => w.destinationId === "node_lib_entrance");
      expect(w).toBeDefined();
      expect(w!.verdict).toBe("PASS");
    });

    it("overall result is not allPass due to step-free block", () => {
      expect(result.allPass).toBe(false);
      expect(result.blockCount).toBe(1);
      expect(result.passCount).toBe(2);
    });

    it("all witnesses have evidenceStatus MEASURED", () => {
      for (const w of result.witnesses) {
        expect(w.evidenceStatus).toBe("MEASURED");
      }
    });

    it("all witnesses have isSyntheticData: true", () => {
      for (const w of result.witnesses) {
        expect(w.isSyntheticData).toBe(true);
      }
    });
  });

  describe("Determinism — identical inputs produce identical output", () => {
    it("compareRouteImpact is deterministic across two identical runs", () => {
      const opts = {
        baselineSha: FAKE_BASELINE_SHA,
        candidateSha: FAKE_CANDIDATE_SHA,
        baselineDataset: BASELINE_DATASET,
        candidateDataset: CANDIDATE_DATASET,
        profiles: profilesMap,
        scenarios,
        policyHash: FAKE_POLICY_HASH,
        fixtureVersion: FIXTURE_VERSION,
        timestamp: "2026-10-22T00:00:00.000Z",
      };
      const r1 = compareRouteImpact(opts);
      const r2 = compareRouteImpact(opts);
      expect(JSON.stringify(r1)).toBe(JSON.stringify(r2));
    });
  });

  describe("Minimal counterexample", () => {
    const result = compareRouteImpact({
      baselineSha: FAKE_BASELINE_SHA,
      candidateSha: FAKE_CANDIDATE_SHA,
      baselineDataset: BASELINE_DATASET,
      candidateDataset: CANDIDATE_DATASET,
      profiles: profilesMap,
      scenarios,
      policyHash: FAKE_POLICY_HASH,
      fixtureVersion: FIXTURE_VERSION,
      timestamp: "2026-10-22T00:00:00.000Z",
    });

    it("produces a minimal counterexample for the BLOCK witness", () => {
      const minimal = minimizeCounterexample(result.witnesses);
      expect(minimal).not.toBeNull();
      expect(minimal!.minimal.verdict).toBe("BLOCK");
      expect(minimal!.minimal.profileId).toBe("step_free");
    });

    it("returns null when all witnesses pass", () => {
      const allPassWitnesses = result.witnesses.map((w) => ({ ...w, verdict: "PASS" as const }));
      const minimal = minimizeCounterexample(allPassWitnesses);
      expect(minimal).toBeNull();
    });

    it("MR note card contains required disclosure text", () => {
      const minimal = minimizeCounterexample(result.witnesses)!;
      const card = formatWitnessCard(minimal);
      expect(card).toContain("synthetic");
      expect(card).toContain("BLOCK");
      expect(card).toContain("step_free");
    });
  });

  describe("Impact classification", () => {
    it("data file change triggers all profiles and policy test families", () => {
      const manifest = classifyRouteChange({
        baselineSha: FAKE_BASELINE_SHA,
        candidateSha: FAKE_CANDIDATE_SHA,
        changedFiles: ["src/data/demoCampus.ts"],
        dataset: DEMO_CAMPUS,
        timestamp: "2026-10-22T00:00:00.000Z",
      });
      expect(manifest.affectedProfiles).toContain("step-free");
      expect(manifest.requiredTestFamilies).toContain("policy:invariants");
      expect(manifest.isSyntheticData).toBe(true);
    });

    it("docs-only change does not trigger routing test families", () => {
      const manifest = classifyRouteChange({
        baselineSha: FAKE_BASELINE_SHA,
        candidateSha: FAKE_CANDIDATE_SHA,
        changedFiles: ["docs/README.md"],
        dataset: DEMO_CAMPUS,
        timestamp: "2026-10-22T00:00:00.000Z",
      });
      expect(manifest.requiredTestFamilies).not.toContain("unit:domain");
      expect(manifest.affectedProfiles).toHaveLength(0);
    });
  });

  describe("Receipt integrity", () => {
    it("canonicalizeJson produces stable output regardless of key insertion order", () => {
      const a = canonicalizeJson({ z: 1, a: 2, m: 3 });
      const b = canonicalizeJson({ m: 3, z: 1, a: 2 });
      expect(a).toBe(b);
    });

    it("release receipt has valid checksum", () => {
      const result = compareRouteImpact({
        baselineSha: FAKE_BASELINE_SHA,
        candidateSha: FAKE_CANDIDATE_SHA,
        baselineDataset: BASELINE_DATASET,
        candidateDataset: CANDIDATE_DATASET,
        profiles: profilesMap,
        scenarios,
        policyHash: FAKE_POLICY_HASH,
        fixtureVersion: FIXTURE_VERSION,
        timestamp: "2026-10-22T00:00:00.000Z",
      });

      const receipt = buildReleaseReceipt({
        commitSha: FAKE_CANDIDATE_SHA,
        pipelineUrl: "NOT_MEASURED",
        imageDigest: "NOT_MEASURED",
        cloudRunRevision: "NOT_MEASURED",
        candidateUrl: "NOT_MEASURED",
        witnessSummary: result.witnesses,
        gateResults: [],
        lifecycleEvidence: [],
        timestamp: "2026-10-22T00:00:00.000Z",
      });

      // Recompute checksum and verify it matches
      const { checksumSha256, ...withoutChecksum } = receipt;
      const recomputed = computeReceiptChecksum(withoutChecksum);
      expect(checksumSha256).toBe(recomputed);
    });

    it("receipt contains non-certification disclosure", () => {
      const result = compareRouteImpact({
        baselineSha: FAKE_BASELINE_SHA,
        candidateSha: FAKE_CANDIDATE_SHA,
        baselineDataset: BASELINE_DATASET,
        candidateDataset: CANDIDATE_DATASET,
        profiles: profilesMap,
        scenarios,
        policyHash: FAKE_POLICY_HASH,
        fixtureVersion: FIXTURE_VERSION,
        timestamp: "2026-10-22T00:00:00.000Z",
      });

      const receipt = buildReleaseReceipt({
        commitSha: FAKE_CANDIDATE_SHA,
        pipelineUrl: "NOT_MEASURED",
        imageDigest: "NOT_MEASURED",
        cloudRunRevision: "NOT_MEASURED",
        candidateUrl: "NOT_MEASURED",
        witnessSummary: result.witnesses,
        gateResults: [],
        lifecycleEvidence: [],
        timestamp: "2026-10-22T00:00:00.000Z",
      });

      expect(receipt.nonCertificationDisclosure).toContain("not a legal");
      expect(receipt.isSyntheticData).toBe(true);
    });
  });
});
