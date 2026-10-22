/**
 * RouteWitness — Model Context Protocol (MCP) Evidence Server
 *
 * Exposes pure, deterministic domain tools to the GitLab Duo Agent Platform
 * over stdio JSON-RPC 2.0.
 *
 * Security & Governance Boundaries:
 * - Read-only analysis and schema-validated inputs (Zod).
 * - No arbitrary shell execution, no arbitrary network access.
 * - Writes are strictly constrained to artifacts/route-witness/ (render_release_receipt only).
 * - Traversal and path injection rejected.
 * - Pure determinism: LLM never sets verdict.
 */

import * as readline from "readline";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { classifyRouteChange } from "../core/classify.js";
import { compareRouteImpact } from "../core/compare.js";
import { minimizeCounterexample } from "../core/minimize.js";
import { buildReleaseReceipt, renderReceiptMarkdown } from "../core/receipt.js";
import { ROUTE_PROFILES } from "../../src/domain/profiles.js";
import { DEMO_CAMPUS } from "../../src/data/demoCampus.js";
import type { CampusDataset } from "../../src/domain/types.js";
import type { JourneyWitness } from "../core/schemas.js";

const ARTIFACTS_DIR = resolve(process.cwd(), "artifacts/route-witness");

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

const TOOLS = [
  {
    name: "classify_route_change",
    description: "Determines which campus nodes, edges, profiles, and test families are impacted by changed files.",
    inputSchema: {
      type: "object",
      properties: {
        changedFiles: {
          type: "array",
          items: { type: "string" },
          description: "List of repo-relative paths changed in the merge request.",
        },
        baselineSha: { type: "string", description: "Target branch commit SHA." },
        candidateSha: { type: "string", description: "Merge request source commit SHA." },
      },
      required: ["changedFiles"],
    },
  },
  {
    name: "compare_route_impact",
    description: "Evaluates baseline vs candidate datasets under benchmark scenarios. Produces deterministic JourneyWitness proofs.",
    inputSchema: {
      type: "object",
      properties: {
        candidateDataPath: { type: "string", description: "Optional path to candidate campus JSON dataset." },
        baselineSha: { type: "string", description: "Target branch commit SHA." },
        candidateSha: { type: "string", description: "Merge request source commit SHA." },
        agentHypothesis: { type: "string", description: "Agent risk hypothesis to associate with evaluation." },
      },
    },
  },
  {
    name: "minimize_counterexample",
    description: "Reduces an array of BLOCK witnesses to the single minimal failing journey counterexample.",
    inputSchema: {
      type: "object",
      properties: {
        witnesses: {
          type: "array",
          items: { type: "object" },
          description: "Array of JourneyWitness objects to minimize.",
        },
      },
      required: ["witnesses"],
    },
  },
  {
    name: "render_release_receipt",
    description: "Generates canonical ReleaseReceipt JSON and Markdown evidence artifacts with SHA-256 integrity checksum.",
    inputSchema: {
      type: "object",
      properties: {
        commitSha: { type: "string" },
        pipelineUrl: { type: "string" },
        candidateUrl: { type: "string" },
      },
      required: ["commitSha"],
    },
  },
  {
    name: "get_release_evidence",
    description: "Retrieves normalized evidence summary for the active candidate.",
    inputSchema: {
      type: "object",
      properties: {
        commitSha: { type: "string" },
      },
    },
  },
];

function handleToolCall(name: string, args: Record<string, unknown> = {}): unknown {
  switch (name) {
    case "classify_route_change": {
      const changedFiles = Array.isArray(args.changedFiles) ? (args.changedFiles as string[]) : ["src/data/demoCampus.ts"];
      const baselineSha = typeof args.baselineSha === "string" ? args.baselineSha : "a".repeat(40);
      const candidateSha = typeof args.candidateSha === "string" ? args.candidateSha : "b".repeat(40);

      return classifyRouteChange({
        baselineSha,
        candidateSha,
        changedFiles,
        dataset: DEMO_CAMPUS,
      });
    }

    case "compare_route_impact": {
      const baselineSha = typeof args.baselineSha === "string" ? args.baselineSha : "a".repeat(40);
      const candidateSha = typeof args.candidateSha === "string" ? args.candidateSha : "b".repeat(40);
      let candidateDataset: CampusDataset = DEMO_CAMPUS;

      if (typeof args.candidateDataPath === "string" && existsSync(args.candidateDataPath)) {
        // Prevent path traversal
        const resolved = resolve(args.candidateDataPath);
        if (!resolved.startsWith(process.cwd())) {
          throw new Error("Access denied: path traversal attempt outside workspace");
        }
        candidateDataset = JSON.parse(readFileSync(resolved, "utf8"));
      }

      const scenariosPath = resolve(process.cwd(), "policy/benchmark-scenarios.json");
      const scenarios = existsSync(scenariosPath)
        ? JSON.parse(readFileSync(scenariosPath, "utf8")).scenarios
        : [];

      const profilesMap = new Map(Object.entries(ROUTE_PROFILES));
      const hypotheses = new Map<string, string>();
      if (typeof args.agentHypothesis === "string") {
        hypotheses.set("scenario_gate_to_sci_lab_step_free", args.agentHypothesis);
      }

      return compareRouteImpact({
        baselineSha,
        candidateSha,
        baselineDataset: DEMO_CAMPUS,
        candidateDataset,
        profiles: profilesMap,
        scenarios,
        policyHash: "verified-policy-hash",
        fixtureVersion: "1.0.0",
        agentHypotheses: hypotheses,
      });
    }

    case "minimize_counterexample": {
      const witnesses = (args.witnesses as JourneyWitness[]) || [];
      const result = minimizeCounterexample(witnesses);
      return result || { message: "All witnesses pass. No counterexample." };
    }

    case "render_release_receipt": {
      if (!existsSync(ARTIFACTS_DIR)) {
        mkdirSync(ARTIFACTS_DIR, { recursive: true });
      }

      const commitSha = (typeof args.commitSha === "string" ? args.commitSha : "c".repeat(40)).slice(0, 40);
      const witnessesPath = resolve(ARTIFACTS_DIR, "witnesses.json");
      const witnesses: JourneyWitness[] = existsSync(witnessesPath)
        ? JSON.parse(readFileSync(witnessesPath, "utf8"))
        : [];

      const receipt = buildReleaseReceipt({
        commitSha,
        pipelineUrl: typeof args.pipelineUrl === "string" ? args.pipelineUrl : "NOT_MEASURED",
        imageDigest: "NOT_MEASURED",
        cloudRunRevision: "NOT_MEASURED",
        candidateUrl: typeof args.candidateUrl === "string" ? args.candidateUrl : "NOT_MEASURED",
        witnessSummary: witnesses,
        gateResults: [],
        lifecycleEvidence: [],
      });

      const jsonPath = resolve(ARTIFACTS_DIR, "release-receipt.json");
      const mdPath = resolve(ARTIFACTS_DIR, "release-receipt.md");
      writeFileSync(jsonPath, JSON.stringify(receipt, null, 2), "utf8");
      writeFileSync(mdPath, renderReceiptMarkdown(receipt), "utf8");

      return {
        success: true,
        receiptPath: jsonPath,
        markdownPath: mdPath,
        checksumSha256: receipt.checksumSha256,
      };
    }

    case "get_release_evidence": {
      const receiptPath = resolve(ARTIFACTS_DIR, "release-receipt.json");
      if (existsSync(receiptPath)) {
        return JSON.parse(readFileSync(receiptPath, "utf8"));
      }
      return { status: "NO_RECEIPT_YET", message: "Receipt not yet generated for candidate." };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export function startMcpServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    if (!line.trim()) return;
    let req: JsonRpcRequest;
    try {
      req = JSON.parse(line);
    } catch {
      const errRes: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: 0,
        error: { code: -32700, message: "Parse error" },
      };
      process.stdout.write(JSON.stringify(errRes) + "\n");
      return;
    }

    if (req.method === "initialize") {
      const res: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: req.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "routewitness-mcp", version: "1.0.0" },
        },
      };
      process.stdout.write(JSON.stringify(res) + "\n");
    } else if (req.method === "tools/list") {
      const res: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: req.id,
        result: { tools: TOOLS },
      };
      process.stdout.write(JSON.stringify(res) + "\n");
    } else if (req.method === "tools/call") {
      const params = (req.params || {}) as { name: string; arguments?: Record<string, unknown> };
      try {
        const toolResult = handleToolCall(params.name, params.arguments);
        const res: JsonRpcResponse = {
          jsonrpc: "2.0",
          id: req.id,
          result: {
            content: [{ type: "text", text: JSON.stringify(toolResult, null, 2) }],
          },
        };
        process.stdout.write(JSON.stringify(res) + "\n");
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const res: JsonRpcResponse = {
          jsonrpc: "2.0",
          id: req.id,
          error: { code: -32000, message: errorMsg },
        };
        process.stdout.write(JSON.stringify(res) + "\n");
      }
    } else {
      const res: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: req.id,
        error: { code: -32601, message: `Method not found: ${req.method}` },
      };
      process.stdout.write(JSON.stringify(res) + "\n");
    }
  });
}

// Auto-start if invoked directly
if (process.argv[1] && process.argv[1].includes("server")) {
  startMcpServer();
}
