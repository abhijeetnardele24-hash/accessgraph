/**
 * RouteWitness — Impact Classifier
 *
 * Classifies which parts of the route graph are affected by a set of
 * changed files (as reported from a GitLab MR diff). Produces an
 * ImpactManifest that drives targeted test selection.
 *
 * Pure function — no side effects, no shell execution, no LLM calls.
 */

import type { ImpactManifest } from "./schemas.js";
import type { CampusDataset } from "../../src/domain/types.js";

export const GENERATOR_VERSION = "1.0.0";
export const DATA_DISCLAIMER =
  "All route and campus data used in RouteWitness demonstrations is synthetic (isSyntheticDemo: true). No real campus geometry, personal mobility data, or navigation history is stored or transmitted.";
export const NON_CERTIFICATION_DISCLOSURE =
  "This receipt is an integrity-verified evidence bundle. It is not a legal, safety, or accessibility certification." as const;

/** Files that, when changed, affect routing invariants */
const ROUTING_FILE_PATTERNS = [
  /src\/data\//,
  /src\/domain\/routeEngine/,
  /src\/domain\/constraints/,
  /src\/domain\/profiles/,
  /policy\//,
  /route-witness\/core\//,
];

/** Files that affect UI but not domain invariants */
const UI_FILE_PATTERNS = [/src\/components\//, /src\/styles\//, /src\/App\./];

/** Files that affect both (domain-touching UI) */
const DOMAIN_UI_PATTERNS = [/src\/release-evidence\//];

export type ChangeClassification = "routing" | "ui" | "domain-ui" | "infra" | "docs" | "test";

export function classifyChangedFile(filePath: string): ChangeClassification {
  if (ROUTING_FILE_PATTERNS.some((p) => p.test(filePath))) return "routing";
  if (DOMAIN_UI_PATTERNS.some((p) => p.test(filePath))) return "domain-ui";
  if (UI_FILE_PATTERNS.some((p) => p.test(filePath))) return "ui";
  if (/tests\/|\.spec\.|\.test\./.test(filePath)) return "test";
  if (/docs\/|README|AGENTS\.md/.test(filePath)) return "docs";
  return "infra";
}

export interface ClassifyOptions {
  baselineSha: string;
  candidateSha: string;
  changedFiles: string[];
  dataset: CampusDataset;
  /** ISO 8601 timestamp for the manifest */
  timestamp?: string;
  /** Commit SHA for the manifest (same as candidateSha for CI) */
  commitSha?: string;
}

/**
 * Produces a deterministic ImpactManifest for the given changed-file set
 * against the provided dataset.
 *
 * The manifest determines:
 * - which nodes/edges are potentially affected (by ID)
 * - which mobility profiles need verification
 * - which scenario IDs must be tested
 * - which test families CI must run
 */
export function classifyRouteChange(opts: ClassifyOptions): ImpactManifest {
  const {
    baselineSha,
    candidateSha,
    changedFiles,
    dataset,
    timestamp = new Date().toISOString(),
    commitSha = candidateSha,
  } = opts;

  const classifications = changedFiles.map((f) => ({
    file: f,
    kind: classifyChangedFile(f),
  }));

  const hasRoutingChange = classifications.some((c) =>
    ["routing", "domain-ui"].includes(c.kind)
  );
  const hasUIChange = classifications.some((c) =>
    ["ui", "domain-ui"].includes(c.kind)
  );
  const hasDataChange = classifications.some((c) =>
    c.file.includes("src/data/") || c.file.includes("policy/")
  );

  // Identify affected nodes and edges
  // For data/policy changes: all nodes and edges are potentially affected.
  // For specific domain file changes: inspect patterns for affected ids.
  const affectedNodeIds: string[] =
    hasDataChange ? dataset.nodes.map((n) => n.id) : extractAffectedNodeIds(changedFiles, dataset);

  const affectedEdgeIds: string[] =
    hasDataChange ? dataset.edges.map((e) => e.id) : extractAffectedEdgeIds(changedFiles, dataset);

  // All profiles must be re-evaluated when routing or data changes
  const affectedProfiles = hasRoutingChange
    ? ["step-free", "low-sensory", "default", "custom"]
    : [];

  // Required scenario IDs: all if data/routing changed, otherwise targeted
  const requiredScenarioIds = hasRoutingChange
    ? dataset.edges.map((e) => e.id) // run all reachability scenarios
    : [];

  // Test families
  const requiredTestFamilies: string[] = [];
  if (hasRoutingChange) {
    requiredTestFamilies.push("unit:domain", "property:routing", "unit:witness", "policy:invariants");
  }
  if (hasUIChange) {
    requiredTestFamilies.push("e2e:playwright", "accessibility:axe");
  }
  if (classifications.some((c) => c.kind === "infra")) {
    requiredTestFamilies.push("container:health", "provenance:license");
  }
  // Always run provenance and policy
  if (!requiredTestFamilies.includes("provenance:license")) {
    requiredTestFamilies.push("provenance:license", "policy:invariants");
  }

  return {
    schemaVersion: "1",
    generatorVersion: GENERATOR_VERSION,
    commitSha: commitSha.padEnd(40, "0").slice(0, 40),
    timestamp,
    baselineSha: baselineSha.padEnd(40, "0").slice(0, 40),
    candidateSha: candidateSha.padEnd(40, "0").slice(0, 40),
    changedFiles,
    affectedNodeIds: [...new Set(affectedNodeIds)].sort(),
    affectedEdgeIds: [...new Set(affectedEdgeIds)].sort(),
    affectedProfiles,
    requiredScenarioIds: [...new Set(requiredScenarioIds)].sort(),
    requiredTestFamilies: [...new Set(requiredTestFamilies)].sort(),
    isSyntheticData: true,
    dataDisclaimer: DATA_DISCLAIMER,
  };
}

/** Extract node IDs referenced in changed filenames (heuristic for naming conventions) */
function extractAffectedNodeIds(changedFiles: string[], dataset: CampusDataset): string[] {
  const ids: string[] = [];
  for (const node of dataset.nodes) {
    if (changedFiles.some((f) => f.includes(node.id))) {
      ids.push(node.id);
    }
  }
  return ids;
}

/** Extract edge IDs referenced in changed filenames */
function extractAffectedEdgeIds(changedFiles: string[], dataset: CampusDataset): string[] {
  const ids: string[] = [];
  for (const edge of dataset.edges) {
    if (changedFiles.some((f) => f.includes(edge.id))) {
      ids.push(edge.id);
    }
  }
  return ids;
}
