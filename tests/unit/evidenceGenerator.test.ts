import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import {
  generateFinalEvidence,
} from "../../scripts/generate-final-evidence.js";

describe("Evidence Generator & Regression Guardrails", () => {
  let tempDir: string;
  const currentCandidateSha = "0123456789abcdef0123456789abcdef01234567";
  const currentBaselineSha = "abcdef0123456789abcdef0123456789abcdef01";

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "routewitness-test-"));
  });

  afterEach(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  function createValidReceipt(sha: string) {
    return {
      schemaVersion: "1",
      generatorVersion: "1.0.0",
      timestamp: new Date().toISOString(),
      pipelineUrl: "NOT_MEASURED",
      commitSha: sha,
      imageDigest: "NOT_MEASURED",
      cloudRunRevision: "NOT_MEASURED",
      candidateUrl: "NOT_MEASURED",
      witnessSummary: [],
      gateResults: [
        {
          gateId: "provenance",
          label: "Provenance Baseline Verification",
          status: "PASS",
          evidenceStatus: "MEASURED",
          commitSha: sha,
          detail: "Baseline tag verified",
        },
      ],
      lifecycleEvidence: [
        {
          stage: "plan",
          status: "COVERED",
          evidenceStatus: "MEASURED",
          description: "Impact manifest created",
          artifactLinks: [],
          jobLinks: [],
        },
      ],
      isSyntheticData: true,
      dataDisclaimer: "All route and campus data used in RouteWitness is synthetic.",
      nonCertificationDisclosure:
        "This receipt is an integrity-verified evidence bundle. It is not a legal, safety, or accessibility certification.",
      checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    };
  }

  function createValidSecurityAudit(sha: string) {
    return {
      status: "PASS",
      violationsCount: 0,
      commitSha: sha,
      timestamp: new Date().toISOString(),
    };
  }

  function createValidJunit(failed = 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="75" failures="${failed}" errors="0" skipped="0">
  <testsuite name="RouteWitness — Golden Regression Proof" tests="19" failures="${failed}">
  </testsuite>
</testsuites>`;
  }

  function createValidPlaywright(failed = 0) {
    return {
      suites: [
        {
          title: "accessibility.spec.ts",
          projectName: "Desktop HD (1280px)",
          specs: [
            {
              tests: [
                {
                  status: failed > 0 ? "unexpected" : "expected",
                  projectName: "Desktop HD (1280px)",
                },
              ],
            },
          ],
        },
      ],
    };
  }

  it("rejects a stale release-receipt SHA in strict mode", () => {
    const staleSha = "ffffffffffffffffffffffffffffffffffffffff";
    const receiptPath = join(tempDir, "stale-receipt.json");
    const securityPath = join(tempDir, "security.json");
    const junitPath = join(tempDir, "junit.xml");
    const playwrightPath = join(tempDir, "playwright.json");
    const outPath = join(tempDir, "output.json");

    writeFileSync(receiptPath, JSON.stringify(createValidReceipt(staleSha)));
    writeFileSync(securityPath, JSON.stringify(createValidSecurityAudit(currentCandidateSha)));
    writeFileSync(junitPath, createValidJunit(0));
    writeFileSync(playwrightPath, JSON.stringify(createValidPlaywright(0)));

    expect(() => {
      generateFinalEvidence({
        strict: true,
        candidateSha: currentCandidateSha,
        baselineSha: currentBaselineSha,
        receiptPath,
        securityPath,
        junitPath,
        playwrightPath,
        outputPath: outPath,
      });
    }).toThrow(/STALE ARTIFACT: release-receipt.json commitSha/);
  });

  it("rejects a stale security-audit SHA in strict mode", () => {
    const staleSha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const receiptPath = join(tempDir, "receipt.json");
    const securityPath = join(tempDir, "stale-security.json");
    const junitPath = join(tempDir, "junit.xml");
    const playwrightPath = join(tempDir, "playwright.json");
    const outPath = join(tempDir, "output.json");

    writeFileSync(receiptPath, JSON.stringify(createValidReceipt(currentCandidateSha)));
    writeFileSync(securityPath, JSON.stringify(createValidSecurityAudit(staleSha)));
    writeFileSync(junitPath, createValidJunit(0));
    writeFileSync(playwrightPath, JSON.stringify(createValidPlaywright(0)));

    expect(() => {
      generateFinalEvidence({
        strict: true,
        candidateSha: currentCandidateSha,
        baselineSha: currentBaselineSha,
        receiptPath,
        securityPath,
        junitPath,
        playwrightPath,
        outputPath: outPath,
      });
    }).toThrow(/STALE ARTIFACT: docs\/security-audit.json commitSha/);
  });

  it("rejects missing or malformed Playwright results in strict mode", () => {
    const receiptPath = join(tempDir, "receipt.json");
    const securityPath = join(tempDir, "security.json");
    const junitPath = join(tempDir, "junit.xml");
    const missingPlaywrightPath = join(tempDir, "nonexistent-playwright.json");
    const outPath = join(tempDir, "output.json");

    writeFileSync(receiptPath, JSON.stringify(createValidReceipt(currentCandidateSha)));
    writeFileSync(securityPath, JSON.stringify(createValidSecurityAudit(currentCandidateSha)));
    writeFileSync(junitPath, createValidJunit(0));

    expect(() => {
      generateFinalEvidence({
        strict: true,
        candidateSha: currentCandidateSha,
        baselineSha: currentBaselineSha,
        receiptPath,
        securityPath,
        junitPath,
        playwrightPath: missingPlaywrightPath,
        outputPath: outPath,
      });
    }).toThrow(/Missing or malformed Playwright results artifact/);
  });

  it("rejects failed Playwright E2E tests in strict mode", () => {
    const receiptPath = join(tempDir, "receipt.json");
    const securityPath = join(tempDir, "security.json");
    const junitPath = join(tempDir, "junit.xml");
    const playwrightPath = join(tempDir, "playwright-failed.json");
    const outPath = join(tempDir, "output.json");

    writeFileSync(receiptPath, JSON.stringify(createValidReceipt(currentCandidateSha)));
    writeFileSync(securityPath, JSON.stringify(createValidSecurityAudit(currentCandidateSha)));
    writeFileSync(junitPath, createValidJunit(0));
    writeFileSync(playwrightPath, JSON.stringify(createValidPlaywright(1)));

    expect(() => {
      generateFinalEvidence({
        strict: true,
        candidateSha: currentCandidateSha,
        baselineSha: currentBaselineSha,
        receiptPath,
        securityPath,
        junitPath,
        playwrightPath,
        outputPath: outPath,
      });
    }).toThrow(/Playwright E2E tests failed/);
  });

  it("prevents fake or template candidate URLs from creating a DEPLOYED status", () => {
    const origCandidate = process.env.CANDIDATE_URL;
    try {
      process.env.CANDIDATE_URL = "https://candidate---routewitness-app-us-central1.a.run.app";
      const receiptPath = join(tempDir, "receipt.json");
      const securityPath = join(tempDir, "security.json");
      const junitPath = join(tempDir, "junit.xml");
      const playwrightPath = join(tempDir, "playwright.json");
      const outPath = join(tempDir, "output.json");

      writeFileSync(receiptPath, JSON.stringify(createValidReceipt(currentCandidateSha)));
      writeFileSync(securityPath, JSON.stringify(createValidSecurityAudit(currentCandidateSha)));
      writeFileSync(junitPath, createValidJunit(0));
      writeFileSync(playwrightPath, JSON.stringify(createValidPlaywright(0)));

      const evidence = generateFinalEvidence({
        strict: false,
        candidateSha: currentCandidateSha,
        baselineSha: currentBaselineSha,
        receiptPath,
        securityPath,
        junitPath,
        playwrightPath,
        outputPath: outPath,
      });

      expect(evidence.cloudRun.status).toBe("NOT_MEASURED");
      expect(evidence.stages.release.status).toBe("NOT_COVERED");
      expect(evidence.stages.release.evidenceStatus).toBe("NOT_MEASURED");
    } finally {
      if (origCandidate !== undefined) process.env.CANDIDATE_URL = origCandidate;
      else delete process.env.CANDIDATE_URL;
    }
  });

  it("preserves NOT_MEASURED when deployment credentials and candidate URL are missing", () => {
    const origCandidate = process.env.CANDIDATE_URL;
    const origRevision = process.env.CLOUD_RUN_REVISION;
    try {
      delete process.env.CANDIDATE_URL;
      delete process.env.CLOUD_RUN_REVISION;

      const receiptPath = join(tempDir, "receipt.json");
      const securityPath = join(tempDir, "security.json");
      const junitPath = join(tempDir, "junit.xml");
      const playwrightPath = join(tempDir, "playwright.json");
      const outPath = join(tempDir, "output.json");

      writeFileSync(receiptPath, JSON.stringify(createValidReceipt(currentCandidateSha)));
      writeFileSync(securityPath, JSON.stringify(createValidSecurityAudit(currentCandidateSha)));
      writeFileSync(junitPath, createValidJunit(0));
      writeFileSync(playwrightPath, JSON.stringify(createValidPlaywright(0)));

      const evidence = generateFinalEvidence({
        strict: false,
        candidateSha: currentCandidateSha,
        baselineSha: currentBaselineSha,
        receiptPath,
        securityPath,
        junitPath,
        playwrightPath,
        outputPath: outPath,
      });

      expect(evidence.cloudRun.status).toBe("NOT_MEASURED");
      expect(evidence.stages.release.status).toBe("NOT_COVERED");
      expect(evidence.stages.release.evidenceStatus).toBe("NOT_MEASURED");
      expect(evidence.stages.monitor.status).toBe("NOT_COVERED");
      expect(evidence.stages.monitor.evidenceStatus).toBe("NOT_MEASURED");
    } finally {
      if (origCandidate !== undefined) process.env.CANDIDATE_URL = origCandidate;
      else delete process.env.CANDIDATE_URL;
      if (origRevision !== undefined) process.env.CLOUD_RUN_REVISION = origRevision;
      else delete process.env.CLOUD_RUN_REVISION;
    }
  });

  it("derives synthetic data and non-certification disclosures directly from receipt", () => {
    const receiptPath = join(tempDir, "receipt.json");
    const securityPath = join(tempDir, "security.json");
    const junitPath = join(tempDir, "junit.xml");
    const playwrightPath = join(tempDir, "playwright.json");
    const outPath = join(tempDir, "output.json");

    writeFileSync(receiptPath, JSON.stringify(createValidReceipt(currentCandidateSha)));
    writeFileSync(securityPath, JSON.stringify(createValidSecurityAudit(currentCandidateSha)));
    writeFileSync(junitPath, createValidJunit(0));
    writeFileSync(playwrightPath, JSON.stringify(createValidPlaywright(0)));

    const evidence = generateFinalEvidence({
      strict: false,
      candidateSha: currentCandidateSha,
      baselineSha: currentBaselineSha,
      receiptPath,
      securityPath,
      junitPath,
      playwrightPath,
      outputPath: outPath,
    });

    expect(evidence.verificationSummary.syntheticDataDisclosurePresent).toBe(true);
    expect(evidence.verificationSummary.nonCertificationDisclosurePresent).toBe(true);
    expect(evidence.evidenceScope).toBe("local_verification_snapshot");
  });

  it("validates that GitLab Duo custom flow YAML satisfies structural schema requirements", () => {
    const flowPath = resolve(process.cwd(), ".gitlab/duo/flows/route-witness.yml");
    expect(existsSync(flowPath)).toBe(true);
    const content = readFileSync(flowPath, "utf8");

    // Verify v1 schema keys
    expect(content).toContain('version: "v1"');
    expect(content).toContain("components:");
    expect(content).toContain("name: \"impact_analyst\"");
    expect(content).toContain("type: AgentComponent");
    expect(content).toContain("name: \"mr_reporter\"");
    expect(content).toContain("routers:");
    expect(content).toContain("from: \"impact_analyst\"");
    expect(content).toContain("to: \"mr_reporter\"");
    expect(content).toContain("entry_point: \"impact_analyst\"");
    expect(content).toContain("prompt_id: \"impact_analyst_prompt\"");
    expect(content).toContain("prompt_id: \"mr_reporter_prompt\"");
    // Check component input reference syntax
    expect(content).toContain('from: "impact_analyst"');
    expect(content).toContain('as: "analysis_result"');
  });
});
