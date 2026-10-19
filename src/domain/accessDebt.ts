import {
  CampusDataset,
  Barrier,
  AccessDebtReport,
  ScenarioResult,
  RepairCandidate,
} from "./types";
import { ROUTE_PROFILES } from "./profiles";
import { findRoute, computeFastestBaseline } from "./routeEngine";
import { filterActiveBarriers } from "./constraints";
import { BENCHMARK_SCENARIOS } from "../data/scenarios";

/**
 * Evaluates the Access Debt of the campus network against the documented benchmark scenario set.
 *
 * Mathematical definition per specification:
 *   accessPenalty = accessibleRouteTime / fastestRouteTime
 *
 * When an origin-destination pair is disconnected under active constraints,
 * it is counted as disconnected (never assigned an invented infinity score).
 *
 * Repair candidate ranking:
 *   1. Disconnected scenarios restored (descending)
 *   2. Total minutes recovered across connected scenarios (descending)
 *   3. Unique profiles helped (descending)
 *   4. Stable barrier ID (ascending tie-breaker)
 */
export function evaluateAccessDebt(
  dataset: CampusDataset,
  activeBarriers: Barrier[],
  evaluationTime: Date = new Date()
): AccessDebtReport {
  const effectiveBarriers = filterActiveBarriers(activeBarriers, evaluationTime);
  const scenarioResults: ScenarioResult[] = [];
  let disconnectedCount = 0;
  let penaltySum = 0;
  let connectedCount = 0;

  for (const scen of BENCHMARK_SCENARIOS) {
    const profile = ROUTE_PROFILES[scen.profileId] || ROUTE_PROFILES.fastest;
    const result = findRoute(
      dataset,
      scen.originId,
      scen.destinationId,
      profile,
      effectiveBarriers,
      evaluationTime
    );

    const fastest =
      result.fastestBaseline ||
      computeFastestBaseline(dataset, scen.originId, scen.destinationId);

    const fastestSec = fastest ? fastest.durationSec : result.totalDurationSec || 1;

    if (result.found) {
      connectedCount++;
      const penalty = Number((result.totalDurationSec / fastestSec).toFixed(3));
      penaltySum += penalty;

      scenarioResults.push({
        scenarioId: scen.id,
        scenarioName: scen.name,
        profileId: scen.profileId,
        connected: true,
        durationSec: result.totalDurationSec,
        fastestSec,
        accessPenalty: penalty,
      });
    } else {
      disconnectedCount++;
      scenarioResults.push({
        scenarioId: scen.id,
        scenarioName: scen.name,
        profileId: scen.profileId,
        connected: false,
        durationSec: 0,
        fastestSec,
        accessPenalty: 0, // Disconnected
      });
    }
  }

  const averageAccessPenalty =
    connectedCount > 0 ? Number((penaltySum / connectedCount).toFixed(3)) : 1.0;

  // Evaluate each active barrier as a repair candidate
  const repairCandidates: RepairCandidate[] = [];

  for (const barrier of effectiveBarriers) {
    const barriersWithoutThis = effectiveBarriers.filter((b) => b.id !== barrier.id);

    let restoredScenariosCount = 0;
    let secondsRecovered = 0;
    const profilesHelped = new Set<string>();

    for (const scen of BENCHMARK_SCENARIOS) {
      const profile = ROUTE_PROFILES[scen.profileId] || ROUTE_PROFILES.fastest;
      const currentRes = scenarioResults.find((s) => s.scenarioId === scen.id);

      const simRes = findRoute(
        dataset,
        scen.originId,
        scen.destinationId,
        profile,
        barriersWithoutThis,
        evaluationTime
      );

      if (currentRes && !currentRes.connected && simRes.found) {
        // Disconnected scenario restored!
        restoredScenariosCount++;
        profilesHelped.add(scen.profileId);
      } else if (currentRes && currentRes.connected && simRes.found) {
        if (simRes.totalDurationSec < currentRes.durationSec) {
          const saved = currentRes.durationSec - simRes.totalDurationSec;
          secondsRecovered += saved;
          profilesHelped.add(scen.profileId);
        }
      }
    }

    const minutesRecovered = Number((secondsRecovered / 60).toFixed(1));

    repairCandidates.push({
      barrierId: barrier.id,
      barrierKind: barrier.kind,
      edgeId: barrier.edgeId,
      note: barrier.note,
      severity: barrier.severity,
      restoredScenariosCount,
      minutesRecovered,
      profilesHelpedCount: profilesHelped.size,
      rank: 0, // Calculated below
    });
  }

  // Deterministic Ranking Sort
  repairCandidates.sort((a, b) => {
    // 1. Disconnected restored descending
    if (a.restoredScenariosCount !== b.restoredScenariosCount) {
      return b.restoredScenariosCount - a.restoredScenariosCount;
    }
    // 2. Minutes recovered descending
    if (Math.abs(a.minutesRecovered - b.minutesRecovered) > 0.01) {
      return b.minutesRecovered - a.minutesRecovered;
    }
    // 3. Profiles helped descending
    if (a.profilesHelpedCount !== b.profilesHelpedCount) {
      return b.profilesHelpedCount - a.profilesHelpedCount;
    }
    // 4. Stable barrier ID ascending
    return a.barrierId.localeCompare(b.barrierId);
  });

  // Assign 1-based ranks
  repairCandidates.forEach((cand, idx) => {
    cand.rank = idx + 1;
  });

  return {
    timestamp: evaluationTime.toISOString(),
    totalScenariosEvaluated: BENCHMARK_SCENARIOS.length,
    disconnectedScenariosCount: disconnectedCount,
    averageAccessPenalty,
    activeBarriersCount: effectiveBarriers.length,
    repairCandidates,
    scenarioResults,
  };
}
