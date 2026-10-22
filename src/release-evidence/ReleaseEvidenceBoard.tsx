import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, FileText, GitCommit, Layers, RefreshCw } from "lucide-react";

export interface ReleaseEvidenceProps {
  onSimulateRegression?: (regress: boolean) => void;
}

export const ReleaseEvidenceBoard: React.FC<ReleaseEvidenceProps> = () => {
  const [showRegression, setShowRegression] = useState(false);

  const toggleSimulatedView = () => {
    setShowRegression((prev) => !prev);
  };

  return (
    <div className="release-evidence-board" style={{ padding: "1.5rem", maxWidth: "1280px", margin: "0 auto", color: "#f8fafc" }}>
      {/* Top Banner */}
      <div
        style={{
          border: showRegression ? "1px solid #ef4444" : "1px solid #22c55e",
          background: showRegression ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.08)",
          borderRadius: "8px",
          padding: "1rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            {showRegression ? (
              <AlertTriangle size={20} color="#ef4444" aria-hidden="true" />
            ) : (
              <ShieldCheck size={20} color="#22c55e" aria-hidden="true" />
            )}
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
              {showRegression
                ? "PIPELINE GATE: BLOCKED — Accessibility Journey Regression Detected"
                : "RELEASE RECEIPT: CANDIDATE VERIFIED — Zero Journey Regressions"}
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#cbd5e1" }}>
            {showRegression
              ? "Candidate edge removal severed the only step-free path to Science Lab (INV-01). Merge blocked."
              : "Replay verified against tagged Google Cloud Run candidate revision. Waiting for supervised human promotion."}
          </p>
        </div>

        <button
          onClick={toggleSimulatedView}
          style={{
            background: "#1e293b",
            color: "#e2e8f0",
            border: "1px solid #475569",
            borderRadius: "6px",
            padding: "0.5rem 0.875rem",
            fontSize: "0.8125rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          aria-label="Toggle between verified candidate receipt and seeded regression block view"
        >
          <RefreshCw size={14} aria-hidden="true" />
          <span>{showRegression ? "Show Verified Candidate" : "Simulate Seeded Regression"}</span>
        </button>
      </div>

      {/* Meta Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "6px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Commit SHA</span>
          <div style={{ fontFamily: "monospace", fontSize: "0.875rem", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <GitCommit size={14} />
            <span>a85d644148a774412eac65feadb93c7d9f9cb595</span>
          </div>
        </div>

        <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "6px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Integrity Checksum</span>
          <div style={{ fontFamily: "monospace", fontSize: "0.875rem", marginTop: "0.25rem", color: "#38bdf8" }}>
            SHA-256: 92335d58a61e...
          </div>
        </div>

        <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "6px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deployment Target</span>
          <div style={{ fontSize: "0.875rem", marginTop: "0.25rem", color: "#4ade80" }}>
            Google Cloud Run (0% Traffic)
          </div>
        </div>

        <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "6px", border: "1px solid #334155" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Autonomy Level</span>
          <div style={{ fontSize: "0.875rem", marginTop: "0.25rem", color: "#facc15" }}>
            Supervised (Human Gate Required)
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Left: Minimal Journey Witness */}
        <div style={{ background: "#1e293b", borderRadius: "8px", border: "1px solid #334155", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: 0, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={16} />
            <span>Signature Journey Witness</span>
          </h3>

          <div style={{ background: "#0f172a", padding: "1rem", borderRadius: "6px", border: "1px solid #1e293b", fontSize: "0.875rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Journey:</span>
              <strong>Main Campus Gate → Science Lab</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Profile:</span>
              <span style={{ background: "#0284c7", padding: "0.1rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>Step-free / Wheelchair</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Invariant:</span>
              <span>INV-01 (No Unexplained Disconnection)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Baseline Path:</span>
              <span style={{ color: "#4ade80" }}>CONNECTED (via Science Building Elevator)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Candidate Path:</span>
              <span style={{ color: showRegression ? "#f87171" : "#4ade80", fontWeight: 600 }}>
                {showRegression ? "DISCONNECTED (Lift edge identifier changed)" : "CONNECTED (600m accessible path)"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #334155", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
              <span style={{ color: "#94a3b8" }}>Deterministic Verdict:</span>
              <strong style={{ color: showRegression ? "#ef4444" : "#22c55e" }}>
                {showRegression ? "BLOCK" : "PASS"}
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
            <Layers size={16} />
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
                <td style={{ padding: "0.5rem", color: showRegression ? "#ef4444" : "#4ade80", fontWeight: 600 }}>
                  {showRegression ? "Disconnected" : "Connected"}
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
          GitLab Duo Nine-Stage Lifecycle Evidence
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem" }}>
          {[
            { stage: "Plan", label: "MEASURED", desc: "Duo Impact Manifest generated via MCP classify_route_change" },
            { stage: "Create", label: "MEASURED", desc: "Deterministic minimal counterexample reducer & fix proposal" },
            { stage: "Verify", label: "MEASURED", desc: "Vitest 55 tests passed + Axe automated accessibility scan" },
            { stage: "Package", label: "MEASURED", desc: "OCI container image built & published with digest" },
            { stage: "Secure", label: "MEASURED", desc: "Secret scan + npm audit zero high/critical vulnerabilities" },
            { stage: "Release", label: "MEASURED", desc: "Tagged Google Cloud Run candidate revision (0% traffic)" },
            { stage: "Configure", label: "MEASURED", desc: "Target-branch protected policy & CODEOWNERS boundary" },
            { stage: "Monitor", label: "MEASURED", desc: "Candidate /healthz probe and deployed Journey Witness replay" },
            { stage: "Govern", label: "HUMAN APPROVAL REQUIRED", desc: "Protected manual promotion to 100% production traffic" },
          ].map((item, idx) => (
            <div key={idx} style={{ background: "#0f172a", padding: "0.75rem", borderRadius: "6px", border: "1px solid #1e293b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.stage}</span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    padding: "0.1rem 0.4rem",
                    borderRadius: "4px",
                    background: item.label === "HUMAN APPROVAL REQUIRED" ? "rgba(234, 179, 8, 0.2)" : "rgba(34, 197, 94, 0.2)",
                    color: item.label === "HUMAN APPROVAL REQUIRED" ? "#facc15" : "#4ade80",
                  }}
                >
                  {item.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclosures & Boundaries */}
      <div style={{ padding: "0.75rem 1rem", background: "#0f172a", borderRadius: "6px", border: "1px solid #334155", fontSize: "0.75rem", color: "#94a3b8" }}>
        <strong>Non-Certification Disclosure:</strong> This release receipt is an integrity-verified evidence bundle. It is not a legal, safety, or ADA/WCAG compliance certification. All campus topology and geometry in RouteWitness is synthetic (<code>isSyntheticDemo: true</code>).
      </div>
    </div>
  );
};
