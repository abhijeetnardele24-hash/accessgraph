import fs from "fs";
import path from "path";
import { DEMO_CAMPUS } from "../src/data/demoCampus";
import { evaluateAccessDebt } from "../src/domain/accessDebt";

function checkEvidence() {
  console.log("Checking evidence, benchmarks, and metric synchronization...");

  // 1. Live Engine Validation
  const baseline = evaluateAccessDebt(DEMO_CAMPUS, []);
  const active = evaluateAccessDebt(DEMO_CAMPUS, DEMO_CAMPUS.defaultBarriers);

  console.log(`Live baseline penalty: ${baseline.averageAccessPenalty.toFixed(3)}x`);
  console.log(`Live active barriers penalty: ${active.averageAccessPenalty.toFixed(3)}x`);

  // Monotonicity verification
  if (active.averageAccessPenalty <= baseline.averageAccessPenalty) {
    throw new Error(
      `Monotonicity violation: Active barriers penalty (${active.averageAccessPenalty.toFixed(3)}x) must be strictly greater than baseline penalty (${baseline.averageAccessPenalty.toFixed(3)}x)`
    );
  }

  // 2. Evaluation Results JSON Verification
  const evalPath = path.resolve(process.cwd(), "docs/evaluation-results.json");
  if (!fs.existsSync(evalPath)) {
    throw new Error(`docs/evaluation-results.json does not exist. Run 'npm run benchmark' first.`);
  }

  const evalJson = JSON.parse(fs.readFileSync(evalPath, "utf-8"));
  if (evalJson.baselineMetrics.averageAccessPenalty !== baseline.averageAccessPenalty) {
    throw new Error(
      `docs/evaluation-results.json baseline penalty (${evalJson.baselineMetrics.averageAccessPenalty}) does not match live engine (${baseline.averageAccessPenalty}). Run 'npm run benchmark' to sync.`
    );
  }

  if (evalJson.activeBarriersMetrics.averageAccessPenalty !== active.averageAccessPenalty) {
    throw new Error(
      `docs/evaluation-results.json active barriers penalty (${evalJson.activeBarriersMetrics.averageAccessPenalty}) does not match live engine (${active.averageAccessPenalty}). Run 'npm run benchmark' to sync.`
    );
  }

  // 3. Benchmark Metrics JSON Verification
  const benchPath = path.resolve(process.cwd(), "docs/benchmark-metrics.json");
  if (!fs.existsSync(benchPath)) {
    throw new Error(`docs/benchmark-metrics.json does not exist. Run 'npm run benchmark' first.`);
  }

  const benchJson = JSON.parse(fs.readFileSync(benchPath, "utf-8"));
  if (!benchJson.singleTripRouting || !benchJson.accessDebtAudit) {
    throw new Error(`docs/benchmark-metrics.json is missing required benchmark sections.`);
  }

  // 4. Screenshots Verification
  const requiredScreenshots = [
    "01-wayfinding-planner.png",
    "02-step-free-reroute.png",
    "03-access-debt-dashboard.png",
    "04-mobile-planner.png",
  ];

  for (const shot of requiredScreenshots) {
    const shotPath = path.resolve(process.cwd(), "docs/assets/screenshots", shot);
    if (!fs.existsSync(shotPath)) {
      throw new Error(`Required screenshot missing: docs/assets/screenshots/${shot}`);
    }
    const stat = fs.statSync(shotPath);
    if (stat.size < 1000) {
      throw new Error(`Screenshot file too small (corrupt or placeholder): docs/assets/screenshots/${shot}`);
    }
  }

  console.log("All evidence checks PASSED successfully!");
}

checkEvidence();
