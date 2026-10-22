# GitLab Duo Agent Platform — Flow & MCP Setup Guide

> **Project:** RouteWitness (AccessGraph Release Twin)  
> **Hackathon:** Life After Code — GitLab Transcend Hackathon  
> **Autonomy Category:** Supervised

---

## 1. Overview

RouteWitness automates release qualification using the [GitLab Duo Agent Platform](https://docs.gitlab.com/user/duo_agent_platform/). It defines a custom flow combining:
1. **Event Triggers**: Automated invocation on Merge Request creation, ready status, or reviewer assignment.
2. **Layered Agent Hierarchy**: Strict separation between Read-Only Analyst, Risk Hypothesis Generator, and Write-Limited MR Reporter.
3. **Model Context Protocol (MCP)**: A local, type-safe TypeScript server exposing deterministic routing verification tools.

---

## 2. Directory Structure

```text
.gitlab/
├── duo/
│   ├── flows/
│   │   └── route-witness.yml      # Custom Duo flow definition
│   ├── prompts/
│   │   ├── analyst.md             # Read-only MR diff and file analyzer
│   │   ├── hypothesis.md          # Falsifiable risk hypothesis generator
│   │   └── reporter.md            # Write-limited MR note formatter
│   └── mcp.json                   # MCP client configuration for Duo
└── CODEOWNERS                     # Protected branch ownership rules
```

---

## 3. Flow Architecture & Execution Lifecycle

```text
MR Event / Reviewer Assignment
           │
           ▼
[Read-Only Impact Analyst] ──> reads MR diff, changed files list
           │
           ▼ calls MCP: classify_route_change
[ImpactManifest] ──> identifies affected edges, profiles, test families
           │
           ▼
[Risk Hypothesis Generator] ──> emits structured risk hypotheses
           │
           ▼ calls MCP: compare_route_impact + minimize_counterexample
[Deterministic Verification] ──> pure TypeScript graph evaluation (PASS / BLOCK)
           │
           ▼
[Write-Limited MR Reporter] ──> publishes evidence summary note to MR
           │
           ▼
[GitLab CI Pipeline] ──> enforces hard release gates & Cloud Run candidate deploy
```

---

## 4. Trigger Configuration & Fallback Hierarchy

Depending on GitLab namespace provisioning and feature availability, RouteWitness supports the following trigger hierarchy:

1. **Merge Request Events (Primary)**:
   - `merge_request.opened`
   - `merge_request.marked_ready`
2. **Reviewer Assignment Trigger (Secondary)**:
   - Assign the Duo service account as an MR reviewer.
3. **Pipeline Passed / Failed Event Trigger**:
   - Automatic execution on pipeline completion to synthesize release receipts.
4. **Explicit Mention Trigger (Documented Fallback)**:
   - Maintainer comments `@duo verify-route-witness` in the MR thread.

---

## 5. Local Testing of MCP Server

You can test the RouteWitness MCP server locally using stdio JSON-RPC 2.0:

```bash
# 1. Initialize MCP handshake
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | npx tsx route-witness/mcp/server.ts

# 2. List available tools
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' | npx tsx route-witness/mcp/server.ts

# 3. Call classify_route_change tool
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"classify_route_change","arguments":{"changedFiles":["src/data/demoCampus.ts"]}}}' | npx tsx route-witness/mcp/server.ts
```

All tools validate arguments with Zod schemas, enforce local workspace boundaries, and execute deterministically with zero LLM dependency for the verdict.
