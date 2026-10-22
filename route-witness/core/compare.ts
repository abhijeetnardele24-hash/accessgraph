/**
 * RouteWitness — Counterfactual Graph Verifier
 *
 * Compares baseline vs. candidate campus datasets under the registered
 * benchmark scenario matrix. Produces deterministic JourneyWitness records.
 *
 * VERDICT RULE: Only this pure code determines PASS/BLOCK.
 * The LLM may provide agentHypothesis text but never controls the verdict field.
 */

import { createHash } from "crypto";
import type { CampusDataset, RouteProfile } from "../../src/domain/types.js";
import { findRoute } from "../../src/domain/routeEngine.js";
import { filterActiveBarriers } from "../../src/domain/constraints.js";
import type { JourneyWitness, RouteOutcome } from "./schemas.js";
import {
  GENERATOR_VERSION,
  DATA_DISCLAIMER,
} from "./classify.js";

export const POLICY_VERSION = "1.0.0";

export interface BenchmarkScenario {
  id: string;
  description: string;
  originId: string;
  destinationId: string;
  profileId: string;
  activeBarrierIds: readonly string[] | string[];
  invariantId: string;
  invariantDescription: string;
  /** If true, baseline must be connected and candidate must also be connected */
  requiresConnected: boolean;
}

export interface CompareOptions {
  baselineSha: string;
  candidateSha: string;
  baselineDataset: CampusDataset;
  candidateDataset: CampusDataset;
  profiles: Map<string, RouteProfile>;
  scenarios: readonly BenchmarkScenario[] | BenchmarkScenario[];
  policyHash: string;
  fixtureVersion: string;
  agentHypotheses?: Map<string, string>; // scenarioId -> LLM hypothesis text
  timestamp?: string;
}

export interface CompareResult {
  witnesses: JourneyWitness[];
  /** True only if ALL witnesses are PASS */
  allPass: boolean;
  /** Number of BLOCK verdicts */
  blockCount: number;
  /** Number of PASS verdicts */
  passCount: number;
}



function evaluateRoute(
  dataset: CampusDataset,
  scenario: BenchmarkScenario,
  profile: RouteProfile,
  evaluationTime: Date
): RouteOutcome {
  const activeBarriers = filterActiveBarriers(dataset.defaultBarriers, evaluationTime).filter((b) =>
    scenario.activeBarrierIds.includes(b.id)
  );

  const result = findRoute(
    dataset,
    scenario.originId,
    scenario.destinationId,
    profile,
    activeBarriers,
    evaluationTime
  );

  return {
    connected: result.found,
    profileId: profile.id,
    originId: scenario.originId,
    destinationId: scenario.destinationId,
    durationSec: result.found ? result.totalDurationSec : undefined,
    distanceM: result.found ? result.totalDistanceM : undefined,
    activeBarrierIds: activeBarriers.map((b) => b.id),
    rejectedEdgeIds: result.rejectedEdges.map((r) => r.edgeId),
    explanation: result.explanation,
  };
}

function makeWitnessId(candidateSha: string, scenarioId: string): string {
  return createHash("sha256")
    .update(`${candidateSha}:${scenarioId}`)
    .digest("hex")
    .slice(0, 16);
}

/**
 * Runs the complete comparison matrix and produces JourneyWitness records.
 * Verdict is determined purely by invariant evaluation — never by an LLM.
 */
export function compareRouteImpact(opts: CompareOptions): CompareResult {
  const {
    baselineSha,
    candidateSha,
    baselineDataset,
    candidateDataset,
    profiles,
    scenarios,
    policyHash,
    fixtureVersion,
    agentHypotheses = new Map(),
    timestamp = new Date().toISOString(),
  } = opts;

  const evalTime = new Date(timestamp);
  const witnesses: JourneyWitness[] = [];

  for (const scenario of scenarios) {
    const profile = profiles.get(scenario.profileId);
    if (!profile) {
      // Treat as NOT_MEASURED rather than silently skipping
      witnesses.push({
        witnessId: makeWitnessId(candidateSha, scenario.id),
        schemaVersion: "1",
        generatorVersion: GENERATOR_VERSION,
        timestamp,
        baselineSha: baselineSha.padEnd(40, "0").slice(0, 40),
        candidateSha: candidateSha.padEnd(40, "0").slice(0, 40),
        policyVersion: POLICY_VERSION,
        policyHash,
        fixtureVersion,
        originId: scenario.originId,
        destinationId: scenario.destinationId,
        profileId: scenario.profileId,
        activeBarrierIds: [...scenario.activeBarrierIds],
        baseline: {
          connected: false,
          profileId: scenario.profileId,
          originId: scenario.originId,
          destinationId: scenario.destinationId,
          activeBarrierIds: [],
          rejectedEdgeIds: [],
          explanation: `Profile '${scenario.profileId}' not found in registered profiles.`,
        },
        candidate: {
          connected: false,
          profileId: scenario.profileId,
          originId: scenario.originId,
          destinationId: scenario.destinationId,
          activeBarrierIds: [],
          rejectedEdgeIds: [],
          explanation: `Profile '${scenario.profileId}' not found in registered profiles.`,
        },
        invariantId: scenario.invariantId,
        invariantDescription: scenario.invariantDescription,
        verdict: "BLOCK",
        verdictReason: `Profile '${scenario.profileId}' not registered — cannot verify invariant.`,
        evidenceStatus: "NOT_MEASURED",
        isSyntheticData: true,
        dataDisclaimer: DATA_DISCLAIMER,
        agentHypothesis: agentHypotheses.get(scenario.id),
      });
      continue;
    }

    const baselineOutcome = evaluateRoute(baselineDataset, scenario, profile, evalTime);
    const candidateOutcome = evaluateRoute(candidateDataset, scenario, profile, evalTime);

    // Determine verdict purely from invariant evaluation
    let verdict: "PASS" | "BLOCK";
    let verdictReason: string;

    if (scenario.requiresConnected) {
      if (baselineOutcome.connected && !candidateOutcome.connected) {
        verdict = "BLOCK";
        verdictReason = `Invariant violated: baseline route from '${scenario.originId}' to '${scenario.destinationId}' under profile '${scenario.profileId}' was CONNECTED; candidate is DISCONNECTED. The candidate removes the only viable journey for this profile. This is a regression.`;
      } else if (!baselineOutcome.connected && candidateOutcome.connected) {
        verdict = "PASS";
        verdictReason = `Candidate improves connectivity: baseline was disconnected, candidate is now connected for profile '${scenario.profileId}'.`;
      } else if (baselineOutcome.connected && candidateOutcome.connected) {
        verdict = "PASS";
        verdictReason = `Both baseline and candidate are connected for profile '${scenario.profileId}'. Invariant satisfied.`;
      } else {
        // Both disconnected
        verdict = "PASS";
        verdictReason = `Both baseline and candidate are disconnected for profile '${scenario.profileId}'. No regression introduced.`;
      }
    } else {
      // For non-connectivity invariants, compare presence of route
      verdict = "PASS";
      verdictReason = `No connectivity invariant required for scenario '${scenario.id}'.`;
    }

    witnesses.push({
      witnessId: makeWitnessId(candidateSha, scenario.id),
      schemaVersion: "1",
      generatorVersion: GENERATOR_VERSION,
      timestamp,
      baselineSha: baselineSha.padEnd(40, "0").slice(0, 40),
      candidateSha: candidateSha.padEnd(40, "0").slice(0, 40),
      policyVersion: POLICY_VERSION,
      policyHash,
      fixtureVersion,
      originId: scenario.originId,
      destinationId: scenario.destinationId,
      profileId: scenario.profileId,
      activeBarrierIds: [...scenario.activeBarrierIds],
      baseline: baselineOutcome,
      candidate: candidateOutcome,
      invariantId: scenario.invariantId,
      invariantDescription: scenario.invariantDescription,
      verdict,
      verdictReason,
      evidenceStatus: "MEASURED",
      isSyntheticData: true,
      dataDisclaimer: DATA_DISCLAIMER,
      agentHypothesis: agentHypotheses.get(scenario.id),
    });
  }

  const blockCount = witnesses.filter((w) => w.verdict === "BLOCK").length;
  const passCount = witnesses.filter((w) => w.verdict === "PASS").length;

  return {
    witnesses,
    allPass: blockCount === 0,
    blockCount,
    passCount,
  };
}
