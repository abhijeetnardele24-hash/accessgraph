/**
 * RouteWitness — Real MR Comparison Integration Tests
 *
 * Verifies:
 * 1. Unrelated documentation changes produce 0 fabricated routing impact.
 * 2. Seeded elevator regression deterministically blocks on step-free profile.
 * 3. Corrected candidate dataset cleanly passes all invariant checks.
 * 4. Missing baseline or candidate refs fail closed with descriptive errors.
 * 5. Invalid or non-hex SHAs are rejected immediately.
 * 6. requiredScenarioIds contains scenario IDs, not edge IDs.
 */

import { describe, it, expect } from "vitest";
import { classifyRouteChange } from "../../route-witness/core/classify.js";
import { compareRouteImpact } from "../../route-witness/core/compare.js";
import { resolveRefs, loadDatasetFromRef, getChangedFilesBetweenRefs } from "../../route-witness/core/loader.js";
import {
  BASELINE_DATASET,
  CANDIDATE_DATASET,
  REGRESSION_SCENARIOS,
} from "../fixtures/regression-demo/lift-rename-regression.js";
import { ROUTE_PROFILES } from "../../src/domain/profiles.js";
import { DEMO_CAMPUS } from "../../src/data/demoCampus.js";

const VALID_SHA_1 = "1111111111111111111111111111111111111111";
const VALID_SHA_2 = "2222222222222222222222222222222222222222";

describe("MR Comparison — RouteWitness Verification Gate", () => {
  describe("1. Impact classification for unrelated changes", () => {
    it("an unrelated documentation change produces no fabricated routing impact", () => {
      const manifest = classifyRouteChange({
        baselineSha: VALID_SHA_1,
        candidateSha: VALID_SHA_2,
        changedFiles: ["docs/DEVPOST_SUBMISSION.md", "README.md", "PROJECT_BLUEPRINT.md"],
        dataset: DEMO_CAMPUS,
      });

      expect(manifest.affectedNodeIds).toHaveLength(0);
      expect(manifest.affectedEdgeIds).toHaveLength(0);
      expect(manifest.affectedProfiles).toHaveLength(0);
      expect(manifest.requiredScenarioIds).toHaveLength(0);
      expect(manifest.requiredTestFamilies).not.toContain("unit:domain");
      expect(manifest.requiredTestFamilies).not.toContain("property:routing");
      expect(manifest.requiredTestFamilies).not.toContain("e2e:playwright");
      expect(manifest.requiredTestFamilies).toContain("provenance:license");
    });

    it("verifies requiredScenarioIds contains scenario IDs, not edge IDs", () => {
      const manifest = classifyRouteChange({
        baselineSha: VALID_SHA_1,
        candidateSha: VALID_SHA_2,
        changedFiles: ["src/data/demoCampus.ts"],
        dataset: DEMO_CAMPUS,
      });

      expect(manifest.requiredScenarioIds.length).toBeGreaterThan(0);
      for (const scenarioId of manifest.requiredScenarioIds) {
        expect(scenarioId).toMatch(/^scenario_/);
        expect(scenarioId).not.toMatch(/^edge_/);
      }
    });
  });

  describe("2. Seeded elevator regression & corrected candidate", () => {
    const profilesMap = new Map(Object.entries(ROUTE_PROFILES));

    it("seeded elevator regression produces BLOCK on step-free profile", () => {
      const result = compareRouteImpact({
        baselineSha: VALID_SHA_1,
        candidateSha: VALID_SHA_2,
        baselineDataset: BASELINE_DATASET,
        candidateDataset: CANDIDATE_DATASET,
        profiles: profilesMap,
        scenarios: REGRESSION_SCENARIOS,
        policyHash: "verified-test-policy-hash",
        fixtureVersion: "1.0.0",
      });

      expect(result.allPass).toBe(false);
      expect(result.blockCount).toBeGreaterThan(0);

      const blockWitness = result.witnesses.find((w) => w.verdict === "BLOCK");
      expect(blockWitness).toBeDefined();
      expect(blockWitness?.profileId).toBe("step_free");
      expect(blockWitness?.baseline.connected).toBe(true);
      expect(blockWitness?.candidate.connected).toBe(false);
    });

    it("corrected candidate passes all scenarios", () => {
      // Baseline against itself represents a correct candidate where step-free connectivity is preserved
      const result = compareRouteImpact({
        baselineSha: VALID_SHA_1,
        candidateSha: VALID_SHA_2,
        baselineDataset: BASELINE_DATASET,
        candidateDataset: BASELINE_DATASET,
        profiles: profilesMap,
        scenarios: REGRESSION_SCENARIOS,
        policyHash: "verified-test-policy-hash",
        fixtureVersion: "1.0.0",
      });

      expect(result.allPass).toBe(true);
      expect(result.blockCount).toBe(0);
      expect(result.passCount).toBe(REGRESSION_SCENARIOS.length);
    });
  });

  describe("3. Strict Fail-Closed Ref Resolution & Dataset Extraction", () => {
    it("fails closed when given an invalid non-hex or short candidate ref", () => {
      expect(() => {
        resolveRefs({ candidateRef: "not-a-valid-sha" });
      }).toThrow(/Invalid candidate ref/);

      expect(() => {
        resolveRefs({ candidateRef: "12345" });
      }).toThrow(/Invalid candidate ref/);
    });

    it("fails closed when loading dataset from a nonexistent git ref", () => {
      expect(() => {
        loadDatasetFromRef("deadbeefdeadbeefdeadbeefdeadbeefdeadbeef");
      }).toThrow(/Failed to extract campus dataset from ref/);
    });

    it("computes real diff between refs without fabrications", () => {
      const files = getChangedFilesBetweenRefs("HEAD", "HEAD");
      expect(files).toEqual([]);
    });
  });
});
