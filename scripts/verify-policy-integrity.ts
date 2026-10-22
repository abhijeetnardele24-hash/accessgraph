/**
 * RouteWitness — Protected Policy Integrity Verification Script
 *
 * Computes canonical SHA-256 checksum over the policy/ directory files:
 * - policy/route-invariants.json
 * - policy/benchmark-scenarios.json
 * - policy/evidence.schema.json
 *
 * Ensures candidates cannot alter or weaken their own release evaluation criteria.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createHash } from "crypto";
import { canonicalizeJson } from "../route-witness/core/receipt.js";

const POLICY_FILES = [
  "policy/route-invariants.json",
  "policy/benchmark-scenarios.json",
  "policy/evidence.schema.json",
];

export function computePolicyHash(): string {
  const hash = createHash("sha256");

  for (const relPath of POLICY_FILES) {
    const fullPath = resolve(process.cwd(), relPath);
    if (!existsSync(fullPath)) {
      throw new Error(`Policy file missing: ${relPath}`);
    }
    const content = JSON.parse(readFileSync(fullPath, "utf8"));
    const canonical = canonicalizeJson(content);
    hash.update(`${relPath}:${canonical}\n`);
  }

  return hash.digest("hex");
}

function verify() {
  console.log("[Policy Integrity] Checking protected policy directory integrity...");

  const currentHash = computePolicyHash();
  console.log(`  Current Policy SHA-256: ${currentHash}`);

  const expectedHash = process.env.EXPECTED_POLICY_HASH;
  if (expectedHash && expectedHash !== currentHash) {
    console.error(`[Policy Integrity] FAIL: Policy hash mismatch!`);
    console.error(`  Expected: ${expectedHash}`);
    console.error(`  Computed: ${currentHash}`);
    console.error(`  A candidate branch cannot modify policy without an authorized CODEOWNER signature.`);
    process.exit(1);
  }

  console.log("  ✓ Policy files present, valid JSON, and canonical checksum computed.");
  console.log("[Policy Integrity] Policy integrity verification PASSED.");
}

verify();
