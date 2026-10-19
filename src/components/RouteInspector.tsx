import React, { useState } from "react";
import { RouteResult, RouteProfile, CampusNode } from "../domain/types";
import { Clock, Navigation, ShieldCheck, AlertTriangle, Layers, Info, Check, Printer } from "lucide-react";

interface RouteInspectorProps {
  route: RouteResult | null;
  profile: RouteProfile;
  originNode: CampusNode | undefined;
  destinationNode: CampusNode | undefined;
}

export const RouteInspector: React.FC<RouteInspectorProps> = ({
  route,
  profile,
  originNode,
  destinationNode,
}) => {
  const [copied, setCopied] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    if (!route || !originNode || !destinationNode) return;
    const text = `AccessGraph Route: ${originNode.label} to ${destinationNode.label}
Profile: ${profile.name}
Duration: ${formatDuration(route.totalDurationSec)} (${route.totalDistanceM}m)
Deterministic Selection: ${route.explanation}

Itinerary:
${route.edges.map((e, idx) => `${idx + 1}. [${e.mode}] (${e.distanceM}m, surface: ${e.surface}${e.slopePct ? `, slope: ${e.slopePct}%` : ''})`).join('\n')}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!route || !route.found) {
    const diag = route?.noRouteDiagnostic;
    return (
      <section className="inspector-panel empty" aria-labelledby="inspector-heading">
        <h2 id="inspector-heading" className="panel-title">Route Itinerary &amp; Cost Proof</h2>
        <div className="inspector-empty-state" role="status" aria-live="polite">
          <AlertTriangle className="empty-icon text-amber" aria-hidden="true" size={32} />
          <h3>No Feasible Accessible Route Found</h3>
          <p>
            No route currently satisfies all strict constraints for <strong>{profile.name}</strong> between{" "}
            {originNode?.label || "origin"} and {destinationNode?.label || "destination"}.
          </p>
          {diag && (
            <div className="empty-suggestions">
              <strong>Diagnostic reason:</strong>
              <p>{diag.reason}</p>
              {diag.suggestedAction && (
                <p><strong>Suggested action:</strong> {diag.suggestedAction}</p>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  const maxSlope = Math.max(...route.edges.map((e) => Math.abs(e.slopePct || 0)), 0);

  return (
    <section className="inspector-panel" aria-labelledby="inspector-heading">
      <div className="panel-header-row">
        <div>
          <h2 id="inspector-heading" className="panel-title">Route Itinerary &amp; Cost Proof</h2>
          <p className="panel-subtitle">
            Deterministic selection verified across {profile.name} constraints
          </p>
        </div>
        <div className="inspector-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopySummary}
            title="Copy route summary to clipboard"
          >
            {copied ? <Check size={14} className="text-civic" /> : <Navigation size={14} />}
            <span>{copied ? "Copied" : "Share Text"}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm print-hide"
            onClick={handlePrint}
            aria-label="Print route itinerary"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Primary Route Metrics Card */}
      <div className="route-metrics-card" role="region" aria-label="Route summary metrics">
        <div className="metric-box">
          <span className="metric-label">
            <Clock size={14} aria-hidden="true" /> Travel Time
          </span>
          <span className="metric-value font-mono">{formatDuration(route.totalDurationSec)}</span>
          <span className="metric-sub">{route.totalDurationSec} seconds</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">
            <Navigation size={14} aria-hidden="true" /> Walking Distance
          </span>
          <span className="metric-value font-mono">{route.totalDistanceM} m</span>
          <span className="metric-sub">{route.edges.length} segment{route.edges.length === 1 ? "" : "s"}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">
            <Layers size={14} aria-hidden="true" /> Incline Profile
          </span>
          <span className="metric-value font-mono">
            {maxSlope > 0 ? `${maxSlope}% max` : "Flat"}
          </span>
          <span className="metric-sub">{route.nodes.length} waypoints</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">
            <ShieldCheck size={14} aria-hidden="true" /> Mathematical Cost
          </span>
          <span className="metric-value font-mono">{route.totalCost.toFixed(1)}</span>
          <span className="metric-sub">Tie-breaker verified</span>
        </div>
      </div>

      {/* Deterministic Explanation Callout */}
      <div className="explanation-callout" role="note" aria-live="polite">
        <div className="explanation-header">
          <Info size={16} className="text-route" aria-hidden="true" />
          <span className="explanation-title">Deterministic Routing Proof</span>
        </div>
        <p className="explanation-body">{route.explanation}</p>
      </div>

      {/* Turn-by-Turn Step List */}
      <div className="itinerary-section">
        <h3 className="section-subheading">Turn-by-Turn Wayfinding Itinerary</h3>
        <ol className="itinerary-list" aria-label="Step-by-step route directions">
          {route.edges.map((edge, idx) => {
            const fromNode = route.nodes[idx];
            const toNode = route.nodes[idx + 1];
            const stepTitle = `${fromNode ? fromNode.label : edge.from} → ${toNode ? toNode.label : edge.to}`;

            return (
              <li key={edge.id} className="itinerary-step">
                <div className="step-number" aria-hidden="true">
                  {idx + 1}
                </div>
                <div className="step-content">
                  <div className="step-title-row">
                    <span className="step-title">{stepTitle}</span>
                    <span className="step-badge capitalize">{edge.mode}</span>
                    {edge.tactileGuidance && (
                      <span className="step-badge badge-tactile">Tactile Guidance</span>
                    )}
                    {edge.shade === 2 && (
                      <span className="step-badge badge-shade">Covered / Indoor</span>
                    )}
                  </div>

                  <div className="step-details">
                    <span>{edge.distanceM}m</span>
                    <span className="detail-separator">•</span>
                    <span>~{formatDuration(edge.durationSec)}</span>
                    <span className="detail-separator">•</span>
                    <span className="capitalize">{edge.surface} surface</span>
                    {edge.slopePct !== undefined && edge.slopePct !== 0 && (
                      <>
                        <span className="detail-separator">•</span>
                        <span>{edge.slopePct > 0 ? `+${edge.slopePct}% grade` : `${edge.slopePct}% grade`}</span>
                      </>
                    )}
                    <span className="detail-separator">•</span>
                    <span>Lighting: {edge.lighting === 2 ? 'Bright' : edge.lighting === 1 ? 'Adequate' : 'Dim'}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Multi-Objective Cost Breakdown Table */}
      <div className="cost-breakdown-section">
        <h3 className="section-subheading">Multi-Objective Cost Matrix</h3>
        <div className="table-responsive" tabIndex={0} role="region" aria-label="Cost breakdown table container">
          <table className="cost-table" aria-label="Multi-objective cost breakdown">
            <thead>
              <tr>
                <th scope="col">Cost Component</th>
                <th scope="col" className="text-right">Profile Weight</th>
                <th scope="col" className="text-right">Computed Cost Contribution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Base Walking / Transit Duration</td>
                <td className="text-right font-mono">{profile.weights.time.toFixed(1)}×</td>
                <td className="text-right font-mono">{route.costBreakdown.timeCost.toFixed(1)}</td>
              </tr>
              <tr>
                <td>Slope / Incline Effort</td>
                <td className="text-right font-mono">{profile.weights.slope.toFixed(1)}×</td>
                <td className="text-right font-mono">{route.costBreakdown.slopeCost.toFixed(1)}</td>
              </tr>
              <tr>
                <td>Low Lighting Penalty</td>
                <td className="text-right font-mono">{profile.weights.lowLight.toFixed(1)}×</td>
                <td className="text-right font-mono">{route.costBreakdown.lightCost.toFixed(1)}</td>
              </tr>
              <tr>
                <td>Sensory Load / Noise Penalty</td>
                <td className="text-right font-mono">{profile.weights.sensoryLoad.toFixed(1)}×</td>
                <td className="text-right font-mono">{route.costBreakdown.sensoryCost.toFixed(1)}</td>
              </tr>
              <tr>
                <td>Sun Exposure / Heat Cost</td>
                <td className="text-right font-mono">{profile.weights.exposedHeat.toFixed(1)}×</td>
                <td className="text-right font-mono">{route.costBreakdown.heatCost.toFixed(1)}</td>
              </tr>
              <tr>
                <td>Distance from Rest Areas</td>
                <td className="text-right font-mono">{profile.weights.distanceFromRest.toFixed(1)}×</td>
                <td className="text-right font-mono">{route.costBreakdown.restCost.toFixed(1)}</td>
              </tr>
              <tr>
                <td>Active Barrier Incident Penalty</td>
                <td className="text-right font-mono">—</td>
                <td className="text-right font-mono">{route.costBreakdown.barrierPenalty.toFixed(1)}</td>
              </tr>
              <tr className="total-row">
                <th scope="row">Total Multi-Objective Score</th>
                <td className="text-right font-mono font-bold">—</td>
                <td className="text-right font-mono font-bold text-civic">
                  {route.totalCost.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
