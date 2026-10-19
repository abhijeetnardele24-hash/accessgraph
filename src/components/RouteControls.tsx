import React, { useRef } from "react";
import { CampusNode, Barrier, RouteProfile } from "../domain/types";
import { ROUTE_PROFILES } from "../domain/profiles";
import { ArrowUpDown, PlusCircle, RotateCcw, Sliders, Check, Shield } from "lucide-react";

interface RouteControlsProps {
  nodes: CampusNode[];
  originId: string;
  destinationId: string;
  selectedProfileId: string;
  currentProfile: RouteProfile;
  activeBarriers: Barrier[];
  onOriginChange: (id: string) => void;
  onDestinationChange: (id: string) => void;
  onSwapOriginDestination: () => void;
  onProfileSelect: (profileId: string) => void;
  onOpenCustomProfileModal: () => void;
  onToggleBarrier: (barrierId: string) => void;
  onOpenAddBarrierModal: () => void;
  onResetBarriers: () => void;
}

export const RouteControls: React.FC<RouteControlsProps> = ({
  nodes,
  originId,
  destinationId,
  selectedProfileId,
  currentProfile,
  activeBarriers,
  onOriginChange,
  onDestinationChange,
  onSwapOriginDestination,
  onProfileSelect,
  onOpenCustomProfileModal,
  onToggleBarrier,
  onOpenAddBarrierModal,
  onResetBarriers,
}) => {
  const profileList = Object.values(ROUTE_PROFILES);
  const radiogroupRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for profile radiogroup
  const handleKeyDownRadiogroup = (e: React.KeyboardEvent) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(e.key)) return;

    e.preventDefault();
    const allProfiles = [...profileList];
    if (currentProfile.isCustom) {
      allProfiles.push(currentProfile);
    }

    const currentIdx = allProfiles.findIndex((p) => p.id === selectedProfileId);
    let nextIdx = currentIdx;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIdx = (currentIdx + 1) % allProfiles.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIdx = (currentIdx - 1 + allProfiles.length) % allProfiles.length;
    }

    const nextProfile = allProfiles[nextIdx];
    if (nextProfile) {
      onProfileSelect(nextProfile.id);
      const buttons = radiogroupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      buttons?.[nextIdx]?.focus();
    }
  };

  return (
    <aside className="control-rail" aria-label="Route Planning Controls">
      {/* Origin & Destination Selectors */}
      <section className="form-group" aria-labelledby="heading-locations">
        <h2 id="heading-locations" className="form-label">
          Route Terminals
        </h2>

        <div className="terminal-select-group">
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

          <div className="terminal-reverse-container">
            <button
              type="button"
              className="btn btn-secondary btn-sm reverse-btn"
              onClick={onSwapOriginDestination}
              title="Reverse direction between origin and destination"
              aria-label="Reverse direction between origin and destination"
            >
              <ArrowUpDown size={14} aria-hidden="true" />
              <span>Reverse Direction</span>
            </button>
          </div>

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

        {/* Quick Demo Shortcuts */}
        <div className="demo-shortcuts-row">
          <button
            type="button"
            className="demo-shortcut-btn demo-primary"
            onClick={() => {
              onOriginChange("node_lib_entrance");
              onDestinationChange("node_sci_lab");
            }}
          >
            ★ Demo: Library → Science Lab
          </button>
          <button
            type="button"
            className="demo-shortcut-btn"
            onClick={() => {
              onOriginChange("node_gate");
              onDestinationChange("node_sci_foyer");
            }}
          >
            Gate → Science Foyer
          </button>
        </div>
      </section>

      {/* Accessibility Profile Selector */}
      <section className="form-group" aria-labelledby="heading-profiles">
        <div className="section-title-row">
          <h2 id="heading-profiles" className="form-label">
            Accessibility Profile
          </h2>
          <button
            type="button"
            className="btn btn-outline btn-xs customize-profile-btn"
            onClick={onOpenCustomProfileModal}
            title="Open custom profile editor"
          >
            <Sliders size={13} aria-hidden="true" />
            <span>Customize</span>
          </button>
        </div>

        {/* Compact Preset Chips Grid */}
        <div
          className="preset-chips-grid"
          role="radiogroup"
          aria-labelledby="heading-profiles"
          ref={radiogroupRef}
          onKeyDown={handleKeyDownRadiogroup}
        >
          {profileList.map((profile) => {
            const isSelected = profile.id === selectedProfileId;
            return (
              <button
                key={profile.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={`preset-chip-btn ${isSelected ? "selected" : ""}`}
                onClick={() => onProfileSelect(profile.id)}
              >
                <span className="preset-chip-name">{profile.name}</span>
                {isSelected && <Check size={12} className="chip-check text-civic" aria-hidden="true" />}
              </button>
            );
          })}

          {currentProfile.isCustom && (
            <button
              type="button"
              role="radio"
              aria-checked={selectedProfileId === "custom"}
              tabIndex={selectedProfileId === "custom" ? 0 : -1}
              className={`preset-chip-btn preset-chip-custom ${
                selectedProfileId === "custom" ? "selected" : ""
              }`}
              onClick={() => onProfileSelect("custom")}
            >
              <span className="preset-chip-name">{currentProfile.name}</span>
              <span className="badge-custom-tag">Custom</span>
            </button>
          )}
        </div>

        {/* Active Profile Info / Description */}
        <div className="active-profile-summary">
          <div className="profile-desc-text">
            {currentProfile.description}
          </div>
          {currentProfile.isCustom && (
            <div className="custom-indicator-banner">
              <Shield size={13} aria-hidden="true" />
              <span>Custom hard rules &amp; multi-objective weights active</span>
            </div>
          )}
        </div>
      </section>

      {/* Active Hard Constraints Card */}
      <section className="form-group" aria-labelledby="heading-constraints">
        <h2 id="heading-constraints" className="form-label">
          Active Hard Constraints
        </h2>
        <div className="active-constraints-list">
          {currentProfile.noStairs && (
            <div className="constraint-badge-item">
              <span className="constraint-badge-icon">✓</span>
              <span>Strictly Step-Free (Stairs Prohibited)</span>
            </div>
          )}
          {currentProfile.requireWorkingLift && (
            <div className="constraint-badge-item">
              <span className="constraint-badge-icon">✓</span>
              <span>Requires Operational Elevators</span>
            </div>
          )}
          {currentProfile.maxSlopePct !== undefined && (
            <div className="constraint-badge-item">
              <span className="constraint-badge-icon">✓</span>
              <span>Maximum Incline: {currentProfile.maxSlopePct}%</span>
            </div>
          )}
          {currentProfile.minWidthCm !== undefined && (
            <div className="constraint-badge-item">
              <span className="constraint-badge-icon">✓</span>
              <span>Minimum Clear Path Width: {currentProfile.minWidthCm}cm</span>
            </div>
          )}
          {currentProfile.excludeUnevenSurface && (
            <div className="constraint-badge-item">
              <span className="constraint-badge-icon">✓</span>
              <span>Excludes Uneven / Unpaved Surfaces</span>
            </div>
          )}
          {!currentProfile.noStairs &&
            !currentProfile.maxSlopePct &&
            !currentProfile.minWidthCm &&
            !currentProfile.excludeUnevenSurface && (
              <div className="constraint-empty-notice">
                No active exclusion filters (fastest mode)
              </div>
            )}
        </div>
      </section>

      {/* Temporary Barriers Simulation */}
      <section className="form-group" aria-labelledby="heading-barriers">
        <div className="section-title-row">
          <h2 id="heading-barriers" className="form-label">
            Active Campus Barriers
          </h2>
          <button
            type="button"
            onClick={onResetBarriers}
            title="Reset to default demonstration barriers"
            className="btn-text-action"
          >
            <RotateCcw size={12} aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>

        <div className="barriers-container">
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
                  className="barrier-remove-btn"
                  title={`Remove simulated barrier ${barrier.id}`}
                >
                  Remove
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={onOpenAddBarrierModal}
            className="btn btn-outline btn-add-barrier"
          >
            <PlusCircle size={15} aria-hidden="true" />
            <span>Simulate Temporary Barrier</span>
          </button>
        </div>
      </section>
    </aside>
  );
};
