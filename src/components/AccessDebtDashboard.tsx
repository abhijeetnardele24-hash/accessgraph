import React from "react";
import { AccessDebtReport } from "../domain/types";
import { ShieldAlert, CheckCircle, TrendingDown, Wrench, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

interface AccessDebtDashboardProps {
  report: AccessDebtReport;
  onSimulateRepair?: (barrierId: string) => void;
  onResetBarriers?: () => void;
}

export const AccessDebtDashboard: React.FC<AccessDebtDashboardProps> = ({
  report,
  onSimulateRepair,
  onResetBarriers,
}) => {
  return (
    <div className="debt-dashboard-container">
      {/* Synthetic Data Label Banner */}
      <div className="synthetic-disclosure-banner" role="note">
        <Sparkles size={16} aria-hidden="true" />
        <span>
          <strong>Synthetic Audit Fixture:</strong> Access Debt metrics and facility incidents reflect
          simulated campus scenarios for deterministic evaluation.
        </span>
      </div>

      {/* Overview Cards */}
      <div className="dashboard-cards-grid" role="region" aria-label="Access debt key indicators">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Evaluated Scenarios</span>
            <span className="stat-icon-wrapper text-civic">
              <CheckCircle size={18} aria-hidden="true" />
            </span>
          </div>
          <div className="stat-value font-mono">{report.totalScenariosEvaluated}</div>
          <div className="stat-subtext">Weight-calibrated benchmark routes</div>
        </div>

        <div className={`stat-card ${report.disconnectedScenariosCount > 0 ? "card-warning" : ""}`}>
          <div className="stat-card-header">
            <span className="stat-title">Disconnected Routes</span>
            <span className="stat-icon-wrapper text-amber">
              <AlertCircle size={18} aria-hidden="true" />
            </span>
          </div>
          <div className="stat-value font-mono text-amber">
            {report.disconnectedScenariosCount}
          </div>
          <div className="stat-subtext">
            {report.disconnectedScenariosCount === 0
              ? "All benchmark routes feasible"
              : "Routes blocked by active barriers"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Average Access Ratio</span>
            <span className="stat-icon-wrapper text-route">
              <TrendingDown size={18} aria-hidden="true" />
            </span>
          </div>
          <div className="stat-value font-mono text-route">
            {report.averageAccessPenalty.toFixed(2)}×
          </div>
          <div className="stat-subtext">
            Accessible duration vs fastest unconstrained baseline
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Active Outages</span>
            <span className="stat-icon-wrapper text-muted">
              <ShieldAlert size={18} aria-hidden="true" />
            </span>
          </div>
          <div className="stat-value font-mono">
            {report.activeBarriersCount}
          </div>
          <div className="stat-subtext">
            Simulated campus infrastructure barriers
          </div>
        </div>
      </div>

      {/* Prioritized Repair Candidates (The Core Access Debt Innovation) */}
      <section className="dashboard-section" aria-labelledby="repairs-heading">
        <div className="section-header-flex">
          <div>
            <h2 id="repairs-heading" className="section-title">
              Prioritized Capital Repair &amp; Intervention Ranking
            </h2>
            <p className="section-description">
              Ranks campus maintenance work by greatest measurable reduction in trip disruption and travel time recovery.
            </p>
          </div>
          {onResetBarriers && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onResetBarriers}
              title="Reset all simulated repairs to default state"
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span>Reset Incidents</span>
            </button>
          )}
        </div>

        {report.repairCandidates.length === 0 ? (
          <div className="repairs-empty-card" role="status">
            <CheckCircle size={28} className="text-civic" aria-hidden="true" />
            <p>No active facility barriers found. All campus infrastructure is operating under baseline conditions.</p>
          </div>
        ) : (
          <div className="table-responsive" tabIndex={0} role="region" aria-label="Prioritized repair candidates table container">
            <table className="debt-table" aria-label="Prioritized repair candidates">
              <thead>
                <tr>
                  <th scope="col" className="text-center" style={{ width: "60px" }}>Rank</th>
                  <th scope="col">Intervention / Facility</th>
                  <th scope="col">Barrier Category</th>
                  <th scope="col" className="text-center">Routes Restored</th>
                  <th scope="col" className="text-right">Time Recovered</th>
                  <th scope="col" className="text-right">Profiles Helped</th>
                  <th scope="col" className="text-center" style={{ width: "150px" }}>Simulate Repair</th>
                </tr>
              </thead>
              <tbody>
                {report.repairCandidates.map((repair, idx) => (
                  <tr key={repair.barrierId} className={idx === 0 ? "top-priority-row" : ""}>
                    <td className="text-center">
                      <span className={`rank-badge ${idx === 0 ? "rank-1" : ""}`}>
                        #{repair.rank}
                      </span>
                    </td>
                    <td>
                      <div className="facility-name font-bold">{repair.note}</div>
                      <div className="facility-sub text-muted text-xs">
                        Target Edge: <code className="font-mono">{repair.edgeId}</code>
                      </div>
                    </td>
                    <td>
                      <span className="barrier-pill">{repair.barrierKind.replace("_", " ")}</span>
                    </td>
                    <td className="text-center font-mono">
                      {repair.restoredScenariosCount > 0 ? (
                        <span className="text-civic font-bold">
                          +{repair.restoredScenariosCount} route{repair.restoredScenariosCount > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td className="text-right font-mono font-bold text-civic">
                      {repair.minutesRecovered > 0
                        ? `-${repair.minutesRecovered.toFixed(1)} min`
                        : "0 min"}
                    </td>
                    <td className="text-right font-mono font-bold">
                      {repair.profilesHelpedCount}
                    </td>
                    <td className="text-center">
                      {onSimulateRepair && (
                        <button
                          type="button"
                          className="btn btn-outline btn-xs"
                          onClick={() => onSimulateRepair(repair.barrierId)}
                          title={`Simulate repair for ${repair.note}`}
                        >
                          <Wrench size={12} aria-hidden="true" />
                          <span>Simulate Fix</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Benchmark Scenarios Matrix */}
      <section className="dashboard-section" aria-labelledby="scenarios-heading">
        <h2 id="scenarios-heading" className="section-title">
          Benchmark Accessibility Routes Matrix
        </h2>
        <p className="section-description">
          Tracks trip-weighted penalty ratios across representative campus user profiles.
        </p>

        <div className="table-responsive" tabIndex={0} role="region" aria-label="Benchmark campus scenarios table container">
          <table className="debt-table" aria-label="Benchmark campus scenarios">
            <thead>
              <tr>
                <th scope="col">Scenario ID</th>
                <th scope="col">Scenario Name</th>
                <th scope="col">Profile Preset</th>
                <th scope="col" className="text-right">Fastest Base</th>
                <th scope="col" className="text-right">Accessible</th>
                <th scope="col" className="text-center">Penalty Ratio</th>
                <th scope="col" className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.scenarioResults.map((sc) => {
                const isDisconnected = !sc.connected || sc.accessPenalty >= 10.0;
                return (
                  <tr key={sc.scenarioId} className={isDisconnected ? "disconnected-row" : ""}>
                    <td className="font-mono text-xs">{sc.scenarioId}</td>
                    <td>
                      <div className="scenario-desc">{sc.scenarioName}</div>
                    </td>
                    <td>
                      <span className="profile-pill">{sc.profileId}</span>
                    </td>
                    <td className="text-right font-mono text-muted">
                      {(sc.fastestSec / 60).toFixed(1)}m
                    </td>
                    <td className="text-right font-mono font-bold">
                      {isDisconnected ? (
                        <span className="text-amber">Blocked</span>
                      ) : (
                        `${(sc.durationSec / 60).toFixed(1)}m`
                      )}
                    </td>
                    <td className="text-center font-mono font-bold">
                      {isDisconnected ? (
                        <span className="badge-disconnected">Disconnected</span>
                      ) : (
                        <span className={sc.accessPenalty > 1.3 ? "text-amber" : "text-civic"}>
                          {sc.accessPenalty.toFixed(2)}×
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {isDisconnected ? (
                        <span className="status-indicator status-blocked" title="No accessible path">
                          Disconnected
                        </span>
                      ) : sc.accessPenalty > 1.05 ? (
                        <span className="status-indicator status-detour" title="Requires accessible detour">
                          Detoured
                        </span>
                      ) : (
                        <span className="status-indicator status-optimal" title="Direct accessible path">
                          Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
