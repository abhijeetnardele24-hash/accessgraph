import fs from "fs";
import path from "path";
import os from "os";
import { performance } from "perf_hooks";
import { DEMO_CAMPUS } from "../src/data/demoCampus";
import { BENCHMARK_SCENARIOS } from "../src/data/scenarios";
import { ROUTE_PROFILES } from "../src/domain/profiles";
import { findRoute, computeFastestBaseline } from "../src/domain/routeEngine";
import { evaluateAccessDebt } from "../src/domain/accessDebt";

interface ScenarioEvaluationRecord {
  id: string;
  name: string;
  profileId: string;
  originId: string;
  destinationId: string;
  fastestSec: number;
  fastestMinutes: number;
  accessibleSec: number;
  accessibleMinutes: number;
  penaltyRatio: number;
  connected: boolean;
  status: "Direct / Optimal" | "Accessible Detour" | "Disconnected";
  edgesTraversed: string[];
}

function runBenchmarks() {
  const timestamp = new Date().toISOString();

  // 1. Evaluate baseline access debt (zero barriers)
  const baselineReport = evaluateAccessDebt(DEMO_CAMPUS, []);

  // 2. Evaluate active access debt (default synthetic barriers)
  const activeReport = evaluateAccessDebt(DEMO_CAMPUS, DEMO_CAMPUS.defaultBarriers);

  // 3. Scenario-by-scenario analysis under default synthetic barriers
  const scenarioRecords: ScenarioEvaluationRecord[] = BENCHMARK_SCENARIOS.map((scen) => {
    const profile = ROUTE_PROFILES[scen.profileId] || ROUTE_PROFILES.fastest;
    const result = findRoute(
      DEMO_CAMPUS,
      scen.originId,
      scen.destinationId,
      profile,
      DEMO_CAMPUS.defaultBarriers
    );

    const fastest =
      result.fastestBaseline ||
      computeFastestBaseline(DEMO_CAMPUS, scen.originId, scen.destinationId);

    const fastestSec = fastest ? fastest.durationSec : result.totalDurationSec || 1;
    const fastestMin = Number((fastestSec / 60).toFixed(1));

    if (result.found) {
      const penalty = Number((result.totalDurationSec / fastestSec).toFixed(2));
      const accessibleMin = Number((result.totalDurationSec / 60).toFixed(1));
      const status = penalty > 1.05 ? "Accessible Detour" : "Direct / Optimal";

      return {
        id: scen.id,
        name: scen.name,
        profileId: scen.profileId,
        originId: scen.originId,
        destinationId: scen.destinationId,
        fastestSec,
        fastestMinutes: fastestMin,
        accessibleSec: result.totalDurationSec,
        accessibleMinutes: accessibleMin,
        penaltyRatio: penalty,
        connected: true,
        status,
        edgesTraversed: result.edges.map((e) => e.id),
      };
    } else {
      return {
        id: scen.id,
        name: scen.name,
        profileId: scen.profileId,
        originId: scen.originId,
        destinationId: scen.destinationId,
        fastestSec,
        fastestMinutes: fastestMin,
        accessibleSec: 0,
        accessibleMinutes: 0,
        penaltyRatio: 0,
        connected: false,
        status: "Disconnected",
        edgesTraversed: [],
      };
    }
  });

  // 4. Measure execution latency over 1,000 iterations for single-trip route
  const singleRouteWarmup = 50;
  for (let i = 0; i < singleRouteWarmup; i++) {
    findRoute(DEMO_CAMPUS, "node_lib_entrance", "node_sci_lab", ROUTE_PROFILES.step_free, []);
  }

  const singleTripLatencies: number[] = [];
  const singleTripIterations = 1000;
  for (let i = 0; i < singleTripIterations; i++) {
    const t0 = performance.now();
    findRoute(DEMO_CAMPUS, "node_lib_entrance", "node_sci_lab", ROUTE_PROFILES.step_free, []);
    const t1 = performance.now();
    singleTripLatencies.push(t1 - t0);
  }

  singleTripLatencies.sort((a, b) => a - b);
  const singleTripMean = Number(
    (singleTripLatencies.reduce((sum, v) => sum + v, 0) / singleTripLatencies.length).toFixed(3)
  );
  const singleTripMedian = Number(singleTripLatencies[Math.floor(singleTripLatencies.length / 2)].toFixed(3));
  const singleTripP95 = Number(singleTripLatencies[Math.floor(singleTripLatencies.length * 0.95)].toFixed(3));

  // 5. Measure full access debt audit over 200 iterations
  const debtAuditLatencies: number[] = [];
  const debtAuditIterations = 200;
  for (let i = 0; i < debtAuditIterations; i++) {
    const t0 = performance.now();
    evaluateAccessDebt(DEMO_CAMPUS, DEMO_CAMPUS.defaultBarriers);
    const t1 = performance.now();
    debtAuditLatencies.push(t1 - t0);
  }

  debtAuditLatencies.sort((a, b) => a - b);
  const debtAuditMean = Number(
    (debtAuditLatencies.reduce((sum, v) => sum + v, 0) / debtAuditLatencies.length).toFixed(3)
  );
  const debtAuditMedian = Number(debtAuditLatencies[Math.floor(debtAuditLatencies.length / 2)].toFixed(3));
  const debtAuditP95 = Number(debtAuditLatencies[Math.floor(debtAuditLatencies.length * 0.95)].toFixed(3));

  // Output documents
  const docsDir = path.resolve(process.cwd(), "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const evaluationResults = {
    timestamp,
    environment: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      model: os.cpus()[0]?.model || "Unknown CPU",
    },
    baselineMetrics: {
      totalScenarios: baselineReport.totalScenariosEvaluated,
      disconnectedCount: baselineReport.disconnectedScenariosCount,
      averageAccessPenalty: baselineReport.averageAccessPenalty,
    },
    activeBarriersMetrics: {
      totalScenarios: activeReport.totalScenariosEvaluated,
      disconnectedCount: activeReport.disconnectedScenariosCount,
      averageAccessPenalty: activeReport.averageAccessPenalty,
      activeBarriersCount: activeReport.activeBarriersCount,
      repairCandidates: activeReport.repairCandidates,
    },
    scenarios: scenarioRecords,
  };

  const benchmarkMetrics = {
    timestamp,
    environment: evaluationResults.environment,
    singleTripRouting: {
      operation: "findRoute (Dijkstra + Multi-Objective Soft Scoring)",
      iterations: singleTripIterations,
      meanMs: singleTripMean,
      medianMs: singleTripMedian,
      p95Ms: singleTripP95,
      unit: "milliseconds",
    },
    accessDebtAudit: {
      operation: "evaluateAccessDebt (8 benchmark scenarios + repair ranking simulations)",
      iterations: debtAuditIterations,
      meanMs: debtAuditMean,
      medianMs: debtAuditMedian,
      p95Ms: debtAuditP95,
      unit: "milliseconds",
    },
  };

  fs.writeFileSync(
    path.join(docsDir, "evaluation-results.json"),
    JSON.stringify(evaluationResults, null, 2)
  );
  fs.writeFileSync(
    path.join(docsDir, "benchmark-metrics.json"),
    JSON.stringify(benchmarkMetrics, null, 2)
  );

  console.log("Evaluation results generated:");
  console.log(`- Scenarios: ${scenarioRecords.length}`);
  console.log(`- Baseline Average Access Penalty: ${baselineReport.averageAccessPenalty.toFixed(2)}x`);
  console.log(`- Active Barriers Average Access Penalty: ${activeReport.averageAccessPenalty.toFixed(2)}x`);
  console.log(`- Disconnected count: ${activeReport.disconnectedScenariosCount}`);
  console.log(`- Single-trip median latency: ${singleTripMedian} ms (p95: ${singleTripP95} ms)`);
  console.log(`- Complete Access Debt audit median latency: ${debtAuditMedian} ms (p95: ${debtAuditP95} ms)`);

  return { evaluationResults, benchmarkMetrics };
}

runBenchmarks();
