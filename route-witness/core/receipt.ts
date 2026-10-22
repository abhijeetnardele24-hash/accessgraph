/**
 * RouteWitness — Release Receipt Generator
 *
 * Builds a canonical ReleaseReceipt from witnesses, gate results, and
 * stage evidence. Computes a SHA-256 integrity checksum over the
 * canonicalized JSON.
 *
 * The checksum is an integrity verification tool, NOT a blockchain proof,
 * legal attestation, or cryptographic signature.
 */

import { createHash } from "crypto";
import type {
  ReleaseReceipt,
  JourneyWitness,
  GateResult,
  StageEvidence,
} from "./schemas.js";
import { GENERATOR_VERSION, DATA_DISCLAIMER, NON_CERTIFICATION_DISCLOSURE } from "./classify.js";

export interface BuildReceiptOptions {
  commitSha: string;
  pipelineUrl: string;
  imageDigest: string;
  cloudRunRevision: string;
  candidateUrl: string;
  witnessSummary: JourneyWitness[];
  gateResults: GateResult[];
  lifecycleEvidence: StageEvidence[];
  approval?: { actor: string; timestamp: string; environment: string };
  timestamp?: string;
}

/**
 * Canonical JSON serializer: sorts object keys alphabetically (recursive)
 * so the checksum is stable regardless of insertion order.
 */
export function canonicalizeJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalizeJson).join(",") + "]";
  }
  const sorted = Object.keys(value as Record<string, unknown>)
    .sort()
    .map((k) => {
      const v = (value as Record<string, unknown>)[k];
      return JSON.stringify(k) + ":" + canonicalizeJson(v);
    });
  return "{" + sorted.join(",") + "}";
}

/**
 * Builds a SHA-256 hex checksum of the canonical receipt JSON,
 * with the checksumSha256 field set to "COMPUTING" during hashing
 * to avoid circular dependency.
 */
export function computeReceiptChecksum(
  receipt: Omit<ReleaseReceipt, "checksumSha256">
): string {
  const canonical = canonicalizeJson({
    ...receipt,
    checksumSha256: "COMPUTING",
  });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

/**
 * Builds a complete ReleaseReceipt with integrity checksum.
 */
export function buildReleaseReceipt(opts: BuildReceiptOptions): ReleaseReceipt {
  const timestamp = opts.timestamp ?? new Date().toISOString();

  const partial: Omit<ReleaseReceipt, "checksumSha256"> = {
    schemaVersion: "1",
    generatorVersion: GENERATOR_VERSION,
    timestamp,
    pipelineUrl: opts.pipelineUrl,
    commitSha: opts.commitSha.padEnd(40, "0").slice(0, 40),
    imageDigest: opts.imageDigest,
    cloudRunRevision: opts.cloudRunRevision,
    candidateUrl: opts.candidateUrl,
    witnessSummary: opts.witnessSummary,
    gateResults: opts.gateResults,
    lifecycleEvidence: opts.lifecycleEvidence,
    approval: opts.approval,
    isSyntheticData: true,
    dataDisclaimer: DATA_DISCLAIMER,
    nonCertificationDisclosure: NON_CERTIFICATION_DISCLOSURE,
  };

  const checksumSha256 = computeReceiptChecksum(partial);

  return { ...partial, checksumSha256 };
}

/**
 * Renders a ReleaseReceipt as human-readable Markdown.
 * Used for GitLab MR comments and artifact rendering.
 */
export function renderReceiptMarkdown(receipt: ReleaseReceipt): string {
  const allPass = receipt.witnessSummary.every((w) => w.verdict === "PASS");
  const blockCount = receipt.witnessSummary.filter((w) => w.verdict === "BLOCK").length;
  const passCount = receipt.witnessSummary.filter((w) => w.verdict === "PASS").length;
  const statusIcon = allPass ? "✅" : "🔴";
  const statusLabel = allPass ? "CANDIDATE VERIFIED" : "BLOCKED";

  const lines: string[] = [
    `# ${statusIcon} Release Receipt — ${statusLabel}`,
    "",
    `| Field | Value |`,
    `|---|---|`,
    `| Commit | \`${receipt.commitSha}\` |`,
    `| Pipeline | ${receipt.pipelineUrl === "NOT_MEASURED" ? "`NOT_MEASURED`" : `[Pipeline](${receipt.pipelineUrl})`} |`,
    `| Image Digest | \`${receipt.imageDigest}\` |`,
    `| Cloud Run Revision | \`${receipt.cloudRunRevision}\` |`,
    `| Candidate URL | ${receipt.candidateUrl === "NOT_MEASURED" ? "`NOT_MEASURED`" : `[${receipt.candidateUrl}](${receipt.candidateUrl})`} |`,
    `| Receipt Checksum | \`${receipt.checksumSha256.slice(0, 16)}…\` (SHA-256 integrity) |`,
    `| Generated | ${receipt.timestamp} |`,
    "",
    `## Journey Witness Summary`,
    "",
    `| Scenario | Profile | Baseline | Candidate | Verdict |`,
    `|---|---|---|---|---|`,
    ...receipt.witnessSummary.map(
      (w) =>
        `| ${w.originId} → ${w.destinationId} | \`${w.profileId}\` | ${w.baseline.connected ? "✅" : "❌"} | ${w.candidate.connected ? "✅" : "❌"} | **${w.verdict}** |`
    ),
    "",
    `**Total:** ${passCount} PASS / ${blockCount} BLOCK`,
    "",
    `## Gate Results`,
    "",
    `| Gate | Status | Evidence |`,
    `|---|---|---|`,
    ...receipt.gateResults.map(
      (g) =>
        `| ${g.label} | ${g.status} (\`${g.evidenceStatus}\`) | ${g.artifactPath ? `[artifact](${g.artifactPath})` : "—"} |`
    ),
    "",
    `## Lifecycle Stage Evidence`,
    "",
    `| Stage | Status | Evidence Status |`,
    `|---|---|---|`,
    ...receipt.lifecycleEvidence.map(
      (s) =>
        `| ${s.stage} | ${s.status} | \`${s.evidenceStatus}\` |`
    ),
    "",
    receipt.approval
      ? [
          `## Human Approval`,
          "",
          `| Field | Value |`,
          `|---|---|`,
          `| Actor | ${receipt.approval.actor} |`,
          `| Environment | ${receipt.approval.environment} |`,
          `| Approved At | ${receipt.approval.timestamp} |`,
        ].join("\n")
      : `## Human Approval\n\n*Awaiting manual production promotion.*`,
    "",
    `---`,
    `> ⚠️ ${receipt.dataDisclaimer}`,
    `> 📋 ${receipt.nonCertificationDisclosure}`,
  ];

  return lines.join("\n");
}
