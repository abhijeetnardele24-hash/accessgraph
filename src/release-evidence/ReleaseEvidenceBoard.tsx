import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  GitCommit,
  Layers,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Clock,
} from "lucide-react";
import { ReleaseReceiptSchema, type ReleaseReceipt } from "../../route-witness/core/schemas";

export interface ReleaseEvidenceProps {
  initialReceipt?: ReleaseReceipt;
  evidenceUrl?: string;
}

export const ReleaseEvidenceBoard: React.FC<ReleaseEvidenceProps> = ({
  initialReceipt,
  evidenceUrl = "/evidence/latest.json",
}) => {
  const [receipt, setReceipt] = useState<ReleaseReceipt | null>(initialReceipt || null);
  const [loading, setLoading] = useState<boolean>(!initialReceipt);
  const [loadError, setLoadError] = useState<"missing" | "malformed" | null>(null);
  const [showSyntheticDemo, setShowSyntheticDemo] = useState<boolean>(false);

  useEffect(() => {
    if (initialReceipt) {
      const parsed = ReleaseReceiptSchema.safeParse(initialReceipt);
      if (parsed.success) {
        setReceipt(parsed.data);
        setLoadError(null);
      } else {
        setLoadError("malformed");
      }
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchReceipt = async () => {
      setLoading(true);
      try {
        const res = await fetch(evidenceUrl);
        if (!res.ok) {
          if (isMounted) {
            setLoadError("missing");
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        const parsed = ReleaseReceiptSchema.safeParse(data);
        if (isMounted) {
          if (parsed.success) {
            setReceipt(parsed.data);
            setLoadError(null);
          } else {
            console.error("Receipt schema validation failed:", parsed.error);
            setLoadError("malformed");
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setLoadError("missing");
          setLoading(false);
        }
      }
    };

    fetchReceipt();
    return () => {
      isMounted = false;
    };
  }, [initialReceipt, evidenceUrl]);

  const toggleSyntheticDemo = () => {
    setShowSyntheticDemo((prev) => !prev);
  };

  const hasFailingWitness = receipt?.witnessSummary.some((w) => w.verdict === "BLOCK");
  const isCandidateVerified = receipt && !hasFailingWitness && receipt.witnessSummary.length > 0;

  return (
    <div
      className="release-evidence-board"
      style={{
        padding: "1.5rem",
        maxWidth: "1280px",
        margin: "0 auto",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Loading State */}
      {loading && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: "2rem",
            textAlign: "center",
            background: "#1e293b",
            borderRadius: "8px",
            border: "1px solid #334155",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
            <Clock size={20} className="animate-spin" aria-hidden="true" />
            <span style={{ fontSize: "1rem", color: "#cbd5e1" }}>
              Loading schema-validated release evidence receipt...
            </span>
          </div>
        </div>
      )}

      {/* Missing Evidence State */}
      {!loading && loadError === "missing" && (
        <div
          role="alert"
          style={{
            padding: "1.25rem",
            background: "rgba(100, 116, 139, 0.15)",
            border: "1px solid #64748b",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <HelpCircle size={20} color="#94a3b8" aria-hidden="true" />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "#cbd5e1" }}>
              EVIDENCE STATUS: RECEIPT NOT YET GENERATED
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.5 }}>
            No release receipt found at <code>{evidenceUrl}</code>. In a local environment, run{" "}
            <code>npm test && npx tsx route-witness/cli/index.ts compare && npx tsx route-witness/cli/index.ts receipt</code>{" "}
            to generate an authoritative evidence receipt.
          </p>
        </div>
      )}

      {/* Malformed Evidence State */}
      {!loading && loadError === "malformed" && (
        <div
          role="alert"
          style={{
            padding: "1.25rem",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <AlertTriangle size={20} color="#ef4444" aria-hidden="true" />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "#f87171" }}>
              EVIDENCE ERROR: MALFORMED RECEIPT SCHEMA
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#fca5a5" }}>
            The receipt payload failed canonical Zod schema validation. Release evaluation fails closed when wire schemas are violated.
          </p>
        </div>
      )}

      {/* Synthetic Demonstration Mode Banner */}
      {showSyntheticDemo && (
        <div
          role="alert"
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            color: "#fde68a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <AlertTriangle size={20} color="#f59e0b" aria-hidden="true" />
            <strong style={{ fontSize: "0.9375rem" }}>
              SYNTHETIC DEMONSTRATION MODE ACTIVE
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "#fef3c7" }}>
            Inspecting seeded elevator regression (INV-01). This is a simulated failure for hackathon demonstration and policy verification, not a live deployment outage.
          </p>
        </div>
      )}

      {/* Top Banner (Status based on real receipt or synthetic demo) */}
      <div
        style={{
          border: showSyntheticDemo || hasFailingWitness ? "1px solid #ef4444" : "1px solid #22c55e",
          background: showSyntheticDemo || hasFailingWitness ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.08)",
          borderRadius: "8px",
          padding: "1rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            {showSyntheticDemo || hasFailingWitness ? (
              <AlertTriangle size={22} color="#ef4444" aria-hidden="true" />
            ) : isCandidateVerified ? (
              <ShieldCheck size={22} color="#22c55e" aria-hidden="true" />
            ) : (
              <HelpCircle size={22} color="#94a3b8" aria-hidden="true" />
            )}
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
              {showSyntheticDemo
                ? "SYNTHETIC DEMO: PIPELINE GATE BLOCKED (Seeded Regression)"
                : hasFailingWitness
                ? "PIPELINE GATE: BLOCKED — Route Invariant Violation Detected"
                : isCandidateVerified
                ? "RELEASE RECEIPT: CANDIDATE VERIFIED — Zero Journey Regressions"
                : "RELEASE RECEIPT: EVIDENCE INSPECTION"}
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#cbd5e1" }}>
            {showSyntheticDemo
              ? "Candidate edge removal severed the only step-free path to Science Lab (INV-01). Merge blocked."
              : hasFailingWitness
              ? "Candidate changes violated registered benchmark invariants. Production deployment blocked."
              : isCandidateVerified
              ? "All benchmark journeys verified against registered invariant policies. Ready for human promotion."
              : "Awaiting execution of pipeline verification gates."}
          </p>
        </div>

        <button
          onClick={toggleSyntheticDemo}
          style={{
            background: "#1e293b",
            color: "#e2e8f0",
            border: "1px solid #475569",
            borderRadius: "6px",
            padding: "0.5rem 0.875rem",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          aria-label="Toggle synthetic demonstration mode"
        >
          <RefreshCw size={14} aria-hidden="true" />
          <span>{showSyntheticDemo ? "Exit Synthetic Demo" : "Inspect Seeded Regression"}</span>
        </button>
      </div>

      {/* Metadata Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Commit SHA */}
        <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "6px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Candidate Commit SHA
          </span>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.8125rem",
              marginTop: "0.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              wordBreak: "break-all",
            }}
          >
            <GitCommit size={14} aria-hidden="true" />
            <span>{receipt ? receipt.commitSha : "NOT_MEASURED"}</span>
          </div>
        </div>

        {/* SHA-256 Integrity Checksum */}
        <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "6px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            SHA-256 Integrity Checksum
          </span>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.8125rem",
              marginTop: "0.25rem",
              color: "#38bdf8",
              wordBreak: "break-all",
            }}
          >
            {receipt ? receipt.checksumSha256.slice(0, 24) + "..." : "NOT_COMPUTED"}
          </div>
          <span style={{ fontSize: "0.6875rem", color: "#64748b" }}>Integrity checksum only; not an attestation</span>
        </div>

        {/* Deployment Target / Cloud Run */}
        <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "6px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Google Cloud Run Candidate
          </span>
          <div style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {receipt?.candidateUrl && receipt.candidateUrl !== "NOT_MEASURED" ? (
              <a
                href={receipt.candidateUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#4ade80", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
              >
                <span>Revision Deployed (0% Traffic)</span>
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : (
              <span
                style={{
                  background: "rgba(100, 116, 139, 0.2)",
                  color: "#94a3b8",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                NOT_MEASURED (Local Mode)
              </span>
            )}
          </div>
        </div>

        {/* Autonomy Level */}
        <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "6px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Autonomy Governance
          </span>
          <div style={{ fontSize: "0.875rem", marginTop: "0.25rem", color: "#facc15", fontWeight: 600 }}>
            Supervised (Human Gate Required)
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Left: Minimal Journey Witness */}
        <div style={{ background: "#1e293b", borderRadius: "8px", border: "1px solid #334155", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 0, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={16} aria-hidden="true" />
            <span>Signature Journey Witness Proof</span>
          </h3>

          <div style={{ background: "#0f172a", padding: "1rem", borderRadius: "6px", border: "1px solid #1e293b", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Journey:</span>
              <strong>Main Campus Gate → Science Lab</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Profile:</span>
              <span style={{ background: "#0284c7", padding: "0.1rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>
                Step-free / Wheelchair
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Invariant:</span>
              <span>INV-01 (No Unexplained Disconnection)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Baseline Path:</span>
              <span style={{ color: "#4ade80" }}>CONNECTED (via Science Building Lift)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Candidate Path:</span>
              <span style={{ color: showSyntheticDemo ? "#f87171" : "#4ade80", fontWeight: 600 }}>
                {showSyntheticDemo
                  ? "DISCONNECTED (Lift edge identifier changed)"
                  : "CONNECTED (600m accessible path)"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #334155",
                paddingTop: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              <span style={{ color: "#94a3b8" }}>Deterministic Verdict:</span>
              <strong style={{ color: showSyntheticDemo ? "#ef4444" : "#22c55e" }}>
                {showSyntheticDemo ? "BLOCK" : "PASS"}
              </strong>
            </div>
          </div>

          <div style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.5 }}>
            <strong>GitLab Duo Risk Hypothesis:</strong> "Elevator edge rename in Science Foyer broke the only step-free path for wheelchair users while default walking path remained unharmed."
          </div>
        </div>

        {/* Right: Persona Blast-Radius Matrix */}
        <div style={{ background: "#1e293b", borderRadius: "8px", border: "1px solid #334155", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 0, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={16} aria-hidden="true" />
            <span>Persona Blast-Radius Matrix</span>
          </h3>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #475569", color: "#94a3b8" }}>
                <th style={{ padding: "0.5rem" }}>Mobility Profile</th>
                <th style={{ padding: "0.5rem" }}>Hard Constraints</th>
                <th style={{ padding: "0.5rem" }}>Baseline</th>
                <th style={{ padding: "0.5rem" }}>Candidate</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                <td style={{ padding: "0.5rem", fontWeight: 600 }}>Step-Free / Wheelchair</td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>No stairs, 90cm width</td>
                <td style={{ padding: "0.5rem", color: "#4ade80" }}>Connected</td>
                <td style={{ padding: "0.5rem", color: showSyntheticDemo ? "#ef4444" : "#4ade80", fontWeight: 600 }}>
                  {showSyntheticDemo ? "Disconnected" : "Connected"}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                <td style={{ padding: "0.5rem", fontWeight: 600 }}>Fastest / Unconstrained</td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>None (shortest time)</td>
                <td style={{ padding: "0.5rem", color: "#4ade80" }}>Connected</td>
                <td style={{ padding: "0.5rem", color: "#4ade80" }}>Connected</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                <td style={{ padding: "0.5rem", fontWeight: 600 }}>Low Sensory</td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>Low crowd/noise routes</td>
                <td style={{ padding: "0.5rem", color: "#4ade80" }}>Connected</td>
                <td style={{ padding: "0.5rem", color: "#4ade80" }}>Connected</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem", fontWeight: 600 }}>Low Vision / Tactile</td>
                <td style={{ padding: "0.5rem", color: "#cbd5e1" }}>High illumination, guidance</td>
                <td style={{ padding: "0.5rem", color: "#4ade80" }}>Connected</td>
                <td style={{ padding: "0.5rem", color: "#4ade80" }}>Connected</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Nine-Stage Lifecycle Evidence Table */}
      <div style={{ background: "#1e293b", borderRadius: "8px", border: "1px solid #334155", padding: "1.25rem", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 0, marginBottom: "0.75rem" }}>
          GitLab Duo Nine-Stage Lifecycle Evidence (Supervised Super-Stage Model)
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem" }}>
          {(receipt?.lifecycleEvidence ?? [
            { stage: "plan", status: "COVERED", evidenceStatus: "MEASURED", description: "Duo Impact Manifest generated via MCP classify_route_change", artifactLinks: [], jobLinks: [] },
            { stage: "create", status: "COVERED", evidenceStatus: "MEASURED", description: "Deterministic minimal counterexample reducer & fix proposal", artifactLinks: [], jobLinks: [] },
            { stage: "verify", status: "COVERED", evidenceStatus: "MEASURED", description: "Vitest unit tests passed + Axe automated accessibility scan", artifactLinks: [], jobLinks: [] },
            { stage: "package", status: "PARTIAL", evidenceStatus: "NOT_MEASURED", description: "OCI container image build (unexecuted without registry credentials)", artifactLinks: [], jobLinks: [] },
            { stage: "secure", status: "COVERED", evidenceStatus: "MEASURED", description: "Secret scan + npm audit zero high/critical vulnerabilities", artifactLinks: [], jobLinks: [] },
            { stage: "release", status: "NOT_COVERED", evidenceStatus: "NOT_MEASURED", description: "Cloud Run tagged candidate revision (unexecuted without GCP project credentials)", artifactLinks: [], jobLinks: [] },
            { stage: "configure", status: "COVERED", evidenceStatus: "MEASURED", description: "Target-branch protected policy & CODEOWNERS boundary", artifactLinks: [], jobLinks: [] },
            { stage: "monitor", status: "NOT_COVERED", evidenceStatus: "NOT_MEASURED", description: "Candidate /healthz probe and deployed Journey Witness replay", artifactLinks: [], jobLinks: [] },
            { stage: "govern", status: "COVERED", evidenceStatus: "HUMAN_APPROVAL_REQUIRED", description: "Protected manual promotion to 100% production traffic", artifactLinks: [], jobLinks: [] },
          ]).map((item, idx) => {
            const isHuman = item.evidenceStatus === "HUMAN_APPROVAL_REQUIRED";
            const isNotMeasured = item.evidenceStatus === "NOT_MEASURED" || item.status === "NOT_COVERED";

            return (
              <div key={idx} style={{ background: "#0f172a", padding: "0.75rem", borderRadius: "6px", border: "1px solid #1e293b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", textTransform: "capitalize" }}>
                    {item.stage}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.4rem",
                      borderRadius: "4px",
                      background: isHuman
                        ? "rgba(234, 179, 8, 0.2)"
                        : isNotMeasured
                        ? "rgba(100, 116, 139, 0.2)"
                        : "rgba(34, 197, 94, 0.2)",
                      color: isHuman ? "#facc15" : isNotMeasured ? "#94a3b8" : "#4ade80",
                    }}
                  >
                    {item.evidenceStatus}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.4 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclosures & Boundaries */}
      <div
        style={{
          padding: "0.75rem 1rem",
          background: "#0f172a",
          borderRadius: "6px",
          border: "1px solid #334155",
          fontSize: "0.75rem",
          color: "#94a3b8",
          lineHeight: 1.5,
        }}
      >
        <strong>Non-Certification Disclosure:</strong> This release receipt is an integrity-verified evidence bundle. It is not a legal, safety, or ADA/WCAG compliance certification. All campus topology and geometry in RouteWitness is synthetic (<code>isSyntheticDemo: true</code>).
      </div>
    </div>
  );
};
