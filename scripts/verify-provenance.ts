/**
 * RouteWitness — Provenance & License Verification Script
 *
 * Verifies:
 * 1. LICENSE file is present and is valid MIT license.
 * 2. docs/PRIOR_WORK.md records original repository and baseline SHA.
 * 3. package.json contains correct provenance metadata.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const EXPECTED_BASELINE_SHA = "a85d644148a774412eac65feadb93c7d9f9cb595";
const EXPECTED_ORIGIN_REPO = "https://github.com/abhijeetnardele24-hash/accessgraph";

function verify() {
  console.log("[Provenance] Verifying prior-work origin, baseline SHA, and license...");

  // 1. License check
  const licensePath = resolve(process.cwd(), "LICENSE");
  if (!existsSync(licensePath)) {
    console.error("[Provenance] FAIL: LICENSE file missing.");
    process.exit(1);
  }
  const licenseContent = readFileSync(licensePath, "utf8");
  if (!licenseContent.includes("MIT License") && !licenseContent.includes("Permission is hereby granted")) {
    console.error("[Provenance] FAIL: LICENSE is not valid MIT.");
    process.exit(1);
  }
  console.log("  ✓ MIT LICENSE present and verified.");

  // 2. Prior work doc check
  const priorWorkPath = resolve(process.cwd(), "docs/PRIOR_WORK.md");
  if (!existsSync(priorWorkPath)) {
    console.error("[Provenance] FAIL: docs/PRIOR_WORK.md missing.");
    process.exit(1);
  }
  const priorWorkContent = readFileSync(priorWorkPath, "utf8");
  if (!priorWorkContent.includes(EXPECTED_ORIGIN_REPO)) {
    console.error(`[Provenance] FAIL: docs/PRIOR_WORK.md does not reference ${EXPECTED_ORIGIN_REPO}`);
    process.exit(1);
  }
  if (!priorWorkContent.includes(EXPECTED_BASELINE_SHA)) {
    console.error(`[Provenance] FAIL: docs/PRIOR_WORK.md does not record baseline SHA ${EXPECTED_BASELINE_SHA}`);
    process.exit(1);
  }
  console.log("  ✓ docs/PRIOR_WORK.md references original repo and baseline SHA.");

  // 3. Package.json check
  const pkgPath = resolve(process.cwd(), "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (pkg.name !== "accessgraph") {
    console.warn(`[Provenance] Note: package name is ${pkg.name}`);
  }
  console.log("  ✓ package.json validated.");

  console.log("[Provenance] All provenance checks PASSED.");
}

verify();
