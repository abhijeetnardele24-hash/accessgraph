/**
 * RouteWitness — Minimal Counterexample Reducer
 *
 * Given a set of BLOCK witnesses, finds the single most minimal (simplest)
 * failing journey to present as the primary proof of regression.
 *
 * "Minimal" means: fewest active barriers, shortest origin-destination path
 * label, and clearest invariant violation, in that priority order.
 *
 * Pure function — deterministic, no side effects.
 */

import type { JourneyWitness } from "./schemas.js";

export interface MinimalWitnessResult {
  /** The single minimal failing witness */
  minimal: JourneyWitness;
  /** All BLOCK witnesses ordered by minimality score (ascending = more minimal) */
  ranked: Array<{ witness: JourneyWitness; score: number }>;
  /** Human-readable explanation of why this witness is minimal */
  explanation: string;
}

/**
 * Computes a minimality score for a BLOCK witness.
 * Lower score = more minimal = better counterexample.
 *
 * Scoring factors (ascending priority):
 *  1. Number of active barriers (fewer = simpler)
 *  2. Number of characters in originId + destinationId (shorter label = simpler)
 *  3. Lexicographic order of witnessId (tie-break for determinism)
 */
function minimalityScore(witness: JourneyWitness): number {
  const barrierPenalty = witness.activeBarrierIds.length * 1000;
  const labelLength = (witness.originId + witness.destinationId).length * 10;
  // Tie-break: convert first 4 hex chars of witnessId to a small number
  const tieBreak = parseInt(witness.witnessId.slice(0, 4), 16) / 65536;
  return barrierPenalty + labelLength + tieBreak;
}

/**
 * Reduces a set of JourneyWitness records to the single minimal counterexample.
 *
 * If no BLOCK witnesses exist, returns null — indicating all invariants pass.
 */
export function minimizeCounterexample(
  witnesses: JourneyWitness[]
): MinimalWitnessResult | null {
  const blocked = witnesses.filter((w) => w.verdict === "BLOCK");

  if (blocked.length === 0) return null;

  const ranked = blocked
    .map((w) => ({ witness: w, score: minimalityScore(w) }))
    .sort((a, b) => a.score - b.score);

  const minimal = ranked[0].witness;

  const explanation =
    `Minimal counterexample: Journey from '${minimal.originId}' to '${minimal.destinationId}' ` +
    `under mobility profile '${minimal.profileId}' with ${minimal.activeBarrierIds.length} active barrier(s). ` +
    `Invariant '${minimal.invariantId}' violated: ${minimal.verdictReason} ` +
    `[Baseline: ${minimal.baseline.connected ? "CONNECTED" : "DISCONNECTED"} → ` +
    `Candidate: ${minimal.candidate.connected ? "CONNECTED" : "DISCONNECTED"}]` +
    (blocked.length > 1 ? ` (${blocked.length - 1} additional regression(s) also detected)` : "");

  return { minimal, ranked, explanation };
}

/**
 * Formats a minimal witness as a concise Markdown summary card.
 * This is what appears in the GitLab MR note.
 */
export function formatWitnessCard(result: MinimalWitnessResult): string {
  const w = result.minimal;
  const statusIcon = "🔴";
  const lines: string[] = [
    `## ${statusIcon} RouteWitness — Accessibility Regression Detected`,
    "",
    `**Invariant:** \`${w.invariantId}\` — ${w.invariantDescription}`,
    "",
    `| Field | Value |`,
    `|---|---|`,
    `| Origin | \`${w.originId}\` |`,
    `| Destination | \`${w.destinationId}\` |`,
    `| Mobility Profile | \`${w.profileId}\` |`,
    `| Active Barriers | ${w.activeBarrierIds.length === 0 ? "none" : w.activeBarrierIds.map((id) => `\`${id}\``).join(", ")} |`,
    `| Baseline | ${w.baseline.connected ? "✅ Connected" : "❌ Disconnected"} |`,
    `| Candidate | ${w.candidate.connected ? "✅ Connected" : "❌ Disconnected"} |`,
    `| Verdict | **BLOCK** |`,
    "",
    `**Finding:** ${w.verdictReason}`,
    "",
    result.ranked.length > 1
      ? `> ${result.ranked.length - 1} additional regression(s) detected. See full witness artifact for details.`
      : "",
    "",
    `> ⚠️ All route data is **synthetic** demo data. This is not a legal or safety certification.`,
    `> 📋 Witness ID: \`${w.witnessId}\` | Policy: \`${w.policyVersion}\` | Fixture: \`${w.fixtureVersion}\``,
  ];

  if (w.agentHypothesis) {
    lines.push(
      "",
      `### Agent Hypothesis (informational — does not determine verdict)`,
      "",
      `> ${w.agentHypothesis}`
    );
  }

  return lines.filter((l) => l !== "" || lines.indexOf(l) < lines.length - 1).join("\n");
}

/**
 * Formats a passing result as a concise Markdown summary card.
 */
export function formatPassCard(witnesses: JourneyWitness[]): string {
  const passCount = witnesses.filter((w) => w.verdict === "PASS").length;
  const lines: string[] = [
    `## ✅ RouteWitness — All Invariants Pass`,
    "",
    `${passCount} journey scenario(s) verified. No accessibility regression detected.`,
    "",
    `> ⚠️ All route data is **synthetic** demo data. Automated verification does not constitute WCAG compliance or legal certification.`,
  ];
  return lines.join("\n");
}
