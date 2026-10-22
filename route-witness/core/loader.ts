/**
 * RouteWitness — Untrusted Ref & Dataset Loader
 *
 * Implements strict, secure loading of baseline and candidate campus datasets
 * directly from Git commit references without executing untrusted candidate code.
 *
 * Security:
 * - Pure static extraction / JSON parsing.
 * - Zero execution of candidate branch scripts (no import(), require(), or eval()).
 * - Schema validation with Zod.
 * - Fails closed on unresolvable refs, malformed JSON, or schema violations.
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { FixtureDatasetSchema } from "./schemas.js";
import type { CampusDataset } from "../../src/domain/types.js";

const SHA_REGEX = /^[0-9a-fA-F]{40}$/;

export interface ResolvedRefs {
  baselineSha: string;
  candidateSha: string;
}

/**
 * Resolves real commit SHAs for baseline and candidate without placeholders.
 * Fails closed if a valid 40-char hex SHA cannot be resolved.
 */
export function resolveRefs(opts?: { baselineRef?: string; candidateRef?: string }): ResolvedRefs {
  // 1. Resolve candidate SHA
  let candidateSha = opts?.candidateRef || process.env.CI_COMMIT_SHA;
  if (!candidateSha) {
    try {
      candidateSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    } catch (e: any) {
      throw new Error(`[Loader] Failed to resolve candidate ref: ${e.message}`);
    }
  }

  // Resolve symbolic ref (e.g. HEAD, branch name) to 40-char hex
  if (!SHA_REGEX.test(candidateSha)) {
    try {
      candidateSha = execSync(`git rev-parse ${candidateSha}`, { encoding: "utf8" }).trim();
    } catch (e: any) {
      throw new Error(`[Loader] Invalid candidate ref '${candidateSha}': cannot resolve to commit SHA.`);
    }
  }

  if (!SHA_REGEX.test(candidateSha)) {
    throw new Error(`[Loader] Invalid candidate SHA '${candidateSha}': must be 40-character hex string.`);
  }

  // 2. Resolve baseline SHA
  let baselineSha =
    opts?.baselineRef ||
    process.env.CI_MERGE_REQUEST_DIFF_BASE_SHA ||
    process.env.CI_MERGE_REQUEST_TARGET_BRANCH_SHA;

  if (!baselineSha) {
    // If not in MR event, check CI_COMMIT_BEFORE_SHA (push event)
    const beforeSha = process.env.CI_COMMIT_BEFORE_SHA;
    if (beforeSha && SHA_REGEX.test(beforeSha) && beforeSha !== "0".repeat(40)) {
      baselineSha = beforeSha;
    }
  }

  if (!baselineSha) {
    // Try git merge-base with origin/main or main
    try {
      baselineSha = execSync("git merge-base origin/main HEAD 2>nul || git merge-base main HEAD 2>nul", {
        encoding: "utf8",
        shell: "powershell",
      }).trim();
    } catch {
      // Fallback: previous commit HEAD~1
      try {
        baselineSha = execSync("git rev-parse HEAD~1", { encoding: "utf8" }).trim();
      } catch {
        // Single commit repository or shallow clone without parents
        baselineSha = candidateSha;
      }
    }
  }

  if (baselineSha && !SHA_REGEX.test(baselineSha)) {
    try {
      baselineSha = execSync(`git rev-parse ${baselineSha}`, { encoding: "utf8" }).trim();
    } catch (e: any) {
      throw new Error(`[Loader] Invalid baseline ref '${baselineSha}': cannot resolve to commit SHA.`);
    }
  }

  if (!baselineSha || !SHA_REGEX.test(baselineSha)) {
    throw new Error(`[Loader] Failed closed: could not resolve valid 40-char baseline SHA.`);
  }

  return { baselineSha, candidateSha };
}

/**
 * Gets the actual changed file paths between two resolved Git SHAs.
 * Fails closed if git diff fails.
 */
export function getChangedFilesBetweenRefs(baselineSha: string, candidateSha: string): string[] {
  if (baselineSha === candidateSha) {
    return [];
  }

  try {
    const output = execSync(`git diff --name-only ${baselineSha} ${candidateSha}`, {
      encoding: "utf8",
    });
    return output
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (err: any) {
    throw new Error(`[Loader] Failed to compute git diff between ${baselineSha} and ${candidateSha}: ${err.message}`);
  }
}

/**
 * Statically parses TypeScript object literal into a JavaScript object without eval()
 * Handles simple JSON-like object structures.
 */
function parseTypeScriptLiteral(source: string): unknown {
  // Find opening brace of the dataset object after DEMO_CAMPUS
  const match = source.match(/export\s+const\s+DEMO_CAMPUS[^=]*=\s*({[\s\S]*});?/);
  if (!match) {
    throw new Error("Could not find DEMO_CAMPUS object literal in source");
  }

  let jsonLike = match[1].trim();
  // Strip trailing semicolon if captured
  if (jsonLike.endsWith(";")) {
    jsonLike = jsonLike.slice(0, -1).trim();
  }

  // Convert JS object literal syntax to valid JSON:
  // 1. Remove comments
  jsonLike = jsonLike.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  // 2. Quote unquoted keys: word: -> "word":
  jsonLike = jsonLike.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
  // 3. Remove trailing commas in objects and arrays
  jsonLike = jsonLike.replace(/,\s*([}\]])/g, "$1");

  return JSON.parse(jsonLike);
}

/**
 * Loads a CampusDataset from a Git reference or direct file path.
 * NEVER executes candidate scripts.
 * Fails closed on any parse failure or schema violation.
 */
export function loadDatasetFromRef(ref: string): CampusDataset {
  // If ref is a local file path that exists on disk:
  if (existsSync(ref)) {
    const raw = readFileSync(resolve(ref), "utf8");
    let parsed: unknown;
    if (ref.endsWith(".json")) {
      parsed = JSON.parse(raw);
    } else {
      parsed = parseTypeScriptLiteral(raw);
    }
    const validated = FixtureDatasetSchema.parse(parsed);
    return validated as unknown as CampusDataset;
  }

  // Otherwise, load from git object database:
  let rawContent: string | null = null;

  // Try 1: demoCampus.json at that ref
  try {
    rawContent = execSync(`git show ${ref}:src/data/demoCampus.json 2>nul`, {
      encoding: "utf8",
      shell: "powershell",
    });
  } catch {
    rawContent = null;
  }

  if (rawContent && rawContent.trim().startsWith("{")) {
    const parsed = JSON.parse(rawContent);
    const validated = FixtureDatasetSchema.parse(parsed);
    return validated as unknown as CampusDataset;
  }

  // Try 2: demoCampus.ts at that ref
  try {
    rawContent = execSync(`git show ${ref}:src/data/demoCampus.ts`, {
      encoding: "utf8",
    });
  } catch (err: any) {
    throw new Error(`[Loader] Failed to extract campus dataset from ref '${ref}': ${err.message}`);
  }

  if (!rawContent) {
    throw new Error(`[Loader] Failed closed: no campus dataset found at ref '${ref}'.`);
  }

  const parsed = parseTypeScriptLiteral(rawContent);
  const validated = FixtureDatasetSchema.parse(parsed);
  return validated as unknown as CampusDataset;
}
