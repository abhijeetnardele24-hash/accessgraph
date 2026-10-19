import React from "react";
import { CampusNode, Barrier } from "../domain/types";
import { ROUTE_PROFILES } from "../domain/profiles";
import { ArrowUpDown, PlusCircle, RotateCcw } from "lucide-react";

interface RouteControlsProps {
  nodes: CampusNode[];
  originId: string;
  destinationId: string;
  selectedProfileId: string;
  activeBarriers: Barrier[];
  onOriginChange: (id: string) => void;
  onDestinationChange: (id: string) => void;
  onSwapOriginDestination: () => void;
  onProfileSelect: (profileId: string) => void;
  onToggleBarrier: (barrierId: string) => void;
  onOpenAddBarrierModal: () => void;
  onResetBarriers: () => void;
}

export const RouteControls: React.FC<RouteControlsProps> = ({
  nodes,
  originId,
  destinationId,
  selectedProfileId,
  activeBarriers,
  onOriginChange,
  onDestinationChange,
  onSwapOriginDestination,
  onProfileSelect,
  onToggleBarrier,
  onOpenAddBarrierModal,
  onResetBarriers,
}) => {
  const currentProfile = ROUTE_PROFILES[selectedProfileId] || ROUTE_PROFILES.fastest;

  return (
    <aside className="control-rail" aria-label="Route Planning Controls">
      {/* Origin & Destination Selectors */}
      <section className="form-group" aria-labelledby="heading-locations">
        <h2 id="heading-locations" className="form-label">
          Route Terminals
        </h2>

        <div>
          <label htmlFor="select-origin" className="sr-only">
            Starting Location / Origin
          </label>
          <select
            id="select-origin"
            className="form-select"
            value={originId}
            onChange={(e) => onOriginChange(e.target.value)}
          >
            {nodes.map((n) => (
              <option key={`orig-${n.id}`} value={n.id}>
                Start: {n.label} ({n.building}, Fl {n.floor})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "center", margin: "2px 0" }}>
          <button
            type="button"
            className="nav-tab-btn"
            onClick={onSwapOriginDestination}
            title="Reverse direction between origin and destination"
            style={{ minHeight: "36px", padding: "4px 12px" }}
          >
            <ArrowUpDown size={15} aria-hidden="true" />
            <span style={{ fontSize: "12px" }}>Reverse Direction</span>
          </button>
        </div>

        <div>
          <label htmlFor="select-destination" className="sr-only">
            Ending Destination
          </label>
          <select
            id="select-destination"
            className="form-select"
            value={destinationId}
            onChange={(e) => onDestinationChange(e.target.value)}
          >
            {nodes.map((n) => (
              <option key={`dest-${n.id}`} value={n.id}>
                End: {n.label} ({n.building}, Fl {n.floor})
              </option>
            ))}
          </select>
        </div>

        {/* Quick presets */}
        <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <button
            type="button"
            onClick={() => {
              onOriginChange("node_lib_entrance");
              onDestinationChange("node_sci_lab");
            }}
            style={{
              fontSize: "11px",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-strong)",
              background: "#FFFFFF",
              color: "var(--civic-green)",
              fontWeight: 600,
            }}
          >
            ★ Demo: Library → Science Lab
          </button>
          <button
            type="button"
            onClick={() => {
              onOriginChange("node_gate");
              onDestinationChange("node_sci_foyer");
            }}
            style={{
              fontSize: "11px",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid var(--border-strong)",
              background: "#FFFFFF",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Gate → Science Foyer
          </button>
        </div>
      </section>

      {/* Profiles Selection */}
      <section className="form-group" aria-labelledby="heading-profiles">
        <h2 id="heading-profiles" className="form-label">
          Accessibility Profile
        </h2>

        <div className="profile-pill-grid" role="radiogroup" aria-labelledby="heading-profiles">
          {Object.values(ROUTE_PROFILES).map((profile) => {
            const isSelected = profile.id === selectedProfileId;
            return (
              <button
                key={profile.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`profile-card-btn ${isSelected ? "selected" : ""}`}
                onClick={() => onProfileSelect(profile.id)}
              >
                <div className="profile-card-title">
                  {profile.name}
                </div>
                <div className="profile-card-desc">{profile.description}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Hard Constraints */}
      <section className="form-group" aria-labelledby="heading-constraints">
        <h2 id="heading-constraints" className="form-label">
          Active Hard Constraints
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {currentProfile.noStairs && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--civic-green)",
                background: "var(--civic-green-subtle)",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #C4E2D1",
                fontWeight: 600,
              }}
            >
              ✓ Strictly Step-Free (Stairs Prohibited)
            </div>
          )}
          {currentProfile.requireWorkingLift && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--civic-green)",
                background: "var(--civic-green-subtle)",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #C4E2D1",
                fontWeight: 600,
              }}
            >
              ✓ Operational Elevators Required
            </div>
          )}
          {currentProfile.maxSlopePct !== undefined && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--civic-green)",
                background: "var(--civic-green-subtle)",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #C4E2D1",
                fontWeight: 600,
              }}
            >
              ✓ Maximum Incline: {currentProfile.maxSlopePct}%
            </div>
          )}
          {currentProfile.minWidthCm !== undefined && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--civic-green)",
                background: "var(--civic-green-subtle)",
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #C4E2D1",
                fontWeight: 600,
              }}
            >
              ✓ Minimum Clear Path Width: {currentProfile.minWidthCm}cm
            </div>
          )}
          {!currentProfile.noStairs &&
            !currentProfile.maxSlopePct &&
            !currentProfile.minWidthCm && (
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                No active exclusion filters (fastest mode)
              </div>
            )}
        </div>
      </section>

      {/* Temporary Barriers Simulation */}
      <section className="form-group" aria-labelledby="heading-barriers">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 id="heading-barriers" className="form-label">
            Active Campus Barriers
          </h2>
          <button
            type="button"
            onClick={onResetBarriers}
            title="Reset to default demonstration barriers"
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {activeBarriers.map((barrier) => {
            return (
              <div
                key={barrier.id}
                className={`barrier-item ${barrier.hardBlock ? "hard-block" : "active"}`}
              >
                <div className="barrier-info">
                  <span className="barrier-title">
                    {barrier.kind === "lift_outage"
                      ? "Elevator Out of Service"
                      : "Pavement Resurfacing Work"}
                  </span>
                  <span className="barrier-note">{barrier.note}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleBarrier(barrier.id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid var(--border-strong)",
                    background: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: barrier.hardBlock ? "var(--red-closure)" : "var(--amber-warning)",
                    flexShrink: 0,
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={onOpenAddBarrierModal}
            className="nav-tab-btn"
            style={{
              justifyContent: "center",
              border: "1px dashed var(--border-strong)",
              background: "#FFFFFF",
              marginTop: "4px",
            }}
          >
            <PlusCircle size={15} />
            <span>Simulate Temporary Barrier</span>
          </button>
        </div>
      </section>
    </aside>
  );
};
