/**
 * RouteWitness — Canonical Zod schemas
 *
 * These schemas define the wire contracts for all RouteWitness evidence
 * artifacts. They are shared between CI scripts, the MCP server, CLI
 * commands, and tests so a single source of truth controls validation.
 *
 * IMPORTANT: The LLM never determines PASS/BLOCK. Only deterministic
 * programs using these schemas emit a verdict field.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Evidence status vocabulary
// ---------------------------------------------------------------------------

export const EvidenceStatusSchema = z.enum([
  "MEASURED",
  "INFERRED",
  "NOT_MEASURED",
  "HUMAN_APPROVAL_REQUIRED",
]);
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;

// ---------------------------------------------------------------------------
// Lifecycle stages (GitLab nine-stage model)
// ---------------------------------------------------------------------------

export const LifecycleStageName = z.enum([
  "plan",
  "create",
  "verify",
  "package",
  "secure",
  "release",
  "configure",
  "monitor",
  "govern",
]);
export type LifecycleStageName = z.infer<typeof LifecycleStageName>;

// ---------------------------------------------------------------------------
// Route outcome — result of a single route evaluation
// ---------------------------------------------------------------------------

export const RouteOutcomeSchema = z.object({
  connected: z.boolean(),
  profileId: z.string(),
  originId: z.string(),
  destinationId: z.string(),
  durationSec: z.number().nonnegative().optional(),
  distanceM: z.number().nonnegative().optional(),
  activeBarrierIds: z.array(z.string()),
  rejectedEdgeIds: z.array(z.string()),
  explanation: z.string(),
});
export type RouteOutcome = z.infer<typeof RouteOutcomeSchema>;

// ---------------------------------------------------------------------------
// ImpactManifest — what changed and what must be tested
// ---------------------------------------------------------------------------

export const ImpactManifestSchema = z.object({
  schemaVersion: z.literal("1"),
  generatorVersion: z.string(),
  commitSha: z.string().length(40),
  timestamp: z.string().datetime(),
  baselineSha: z.string().length(40),
  candidateSha: z.string().length(40),
  changedFiles: z.array(z.string()),
  affectedNodeIds: z.array(z.string()),
  affectedEdgeIds: z.array(z.string()),
  affectedProfiles: z.array(z.string()),
  requiredScenarioIds: z.array(z.string()),
  requiredTestFamilies: z.array(z.string()),
  isSyntheticData: z.literal(true),
  dataDisclaimer: z.string(),
});
export type ImpactManifest = z.infer<typeof ImpactManifestSchema>;

// ---------------------------------------------------------------------------
// JourneyWitness — the minimal proof of a pass or block verdict
// ---------------------------------------------------------------------------

export const JourneyWitnessSchema = z.object({
  witnessId: z.string(),
  schemaVersion: z.literal("1"),
  generatorVersion: z.string(),
  timestamp: z.string().datetime(),
  baselineSha: z.string().length(40),
  candidateSha: z.string().length(40),
  policyVersion: z.string(),
  policyHash: z.string(), // SHA-256 of canonical policy JSON — integrity checksum only
  fixtureVersion: z.string(),
  originId: z.string(),
  destinationId: z.string(),
  profileId: z.string(),
  activeBarrierIds: z.array(z.string()),
  baseline: RouteOutcomeSchema,
  candidate: RouteOutcomeSchema,
  invariantId: z.string(),
  invariantDescription: z.string(),
  verdict: z.enum(["PASS", "BLOCK"]),
  verdictReason: z.string(),
  evidenceStatus: EvidenceStatusSchema,
  isSyntheticData: z.literal(true),
  dataDisclaimer: z.string(),
  agentHypothesis: z.string().optional(), // LLM hypothesis — never determines verdict
});
export type JourneyWitness = z.infer<typeof JourneyWitnessSchema>;

// ---------------------------------------------------------------------------
// GateResult — outcome of a single CI gate
// ---------------------------------------------------------------------------

export const GateResultSchema = z.object({
  gateId: z.string(),
  label: z.string(),
  status: z.enum(["PASS", "FAIL", "SKIPPED", "NOT_MEASURED"]),
  evidenceStatus: EvidenceStatusSchema,
  artifactPath: z.string().optional(),
  commitSha: z.string().length(40),
  detail: z.string().optional(),
});
export type GateResult = z.infer<typeof GateResultSchema>;

// ---------------------------------------------------------------------------
// StageEvidence — evidence for one GitLab lifecycle stage
// ---------------------------------------------------------------------------

export const StageEvidenceSchema = z.object({
  stage: LifecycleStageName,
  status: z.enum(["COVERED", "PARTIAL", "NOT_COVERED"]),
  evidenceStatus: EvidenceStatusSchema,
  description: z.string(),
  artifactLinks: z.array(z.string()),
  jobLinks: z.array(z.string()),
});
export type StageEvidence = z.infer<typeof StageEvidenceSchema>;

// ---------------------------------------------------------------------------
// ReleaseReceipt — the complete evidence bundle for one candidate
// ---------------------------------------------------------------------------

export const ReleaseReceiptSchema = z.object({
  schemaVersion: z.literal("1"),
  generatorVersion: z.string(),
  timestamp: z.string().datetime(),
  pipelineUrl: z.string().url().or(z.literal("NOT_MEASURED")),
  commitSha: z.string().length(40),
  imageDigest: z.string().or(z.literal("NOT_MEASURED")),
  cloudRunRevision: z.string().or(z.literal("NOT_MEASURED")),
  candidateUrl: z.string().url().or(z.literal("NOT_MEASURED")),
  witnessSummary: z.array(JourneyWitnessSchema),
  gateResults: z.array(GateResultSchema),
  lifecycleEvidence: z.array(StageEvidenceSchema),
  approval: z
    .object({
      actor: z.string(),
      timestamp: z.string().datetime(),
      environment: z.string(),
    })
    .optional(),
  checksumSha256: z.string(), // SHA-256 of canonical receipt JSON (integrity only)
  isSyntheticData: z.literal(true),
  dataDisclaimer: z.string(),
  nonCertificationDisclosure: z.literal(
    "This receipt is an integrity-verified evidence bundle. It is not a legal, safety, or accessibility certification."
  ),
});
export type ReleaseReceipt = z.infer<typeof ReleaseReceiptSchema>;

// ---------------------------------------------------------------------------
// Fixture dataset schema (for validated synthetic campus data)
// ---------------------------------------------------------------------------

export const FixtureDatasetSchema = z.object({
  id: z.string(),
  version: z.string(),
  isSyntheticDemo: z.literal(true),
  description: z.string(),
  nodes: z.array(z.object({ id: z.string() }).passthrough()),
  edges: z.array(z.object({ id: z.string() }).passthrough()),
  barriers: z.array(z.object({ id: z.string() }).passthrough()),
});
export type FixtureDataset = z.infer<typeof FixtureDatasetSchema>;
