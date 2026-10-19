import React, { useState, useEffect, useRef } from "react";
import { RouteProfile } from "../domain/types";
import { ROUTE_PROFILES } from "../domain/profiles";
import { X, Sliders, RotateCcw, Check, AlertCircle } from "lucide-react";

interface CustomProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: RouteProfile) => void;
  initialProfile?: RouteProfile;
}

export const CustomProfileModal: React.FC<CustomProfileModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  initialProfile,
}) => {
  const baseProfile = initialProfile || ROUTE_PROFILES.step_free;

  const [name, setName] = useState(baseProfile.isCustom ? baseProfile.name : "My Custom Profile");
  const [noStairs, setNoStairs] = useState(baseProfile.noStairs);
  const [requireWorkingLift, setRequireWorkingLift] = useState(baseProfile.requireWorkingLift);
  const [maxSlopePct, setMaxSlopePct] = useState<number | undefined>(baseProfile.maxSlopePct);
  const [minWidthCm, setMinWidthCm] = useState<number | undefined>(baseProfile.minWidthCm);
  const [excludeUnevenSurface, setExcludeUnevenSurface] = useState(baseProfile.excludeUnevenSurface);

  // Soft weights
  const [timeWeight, setTimeWeight] = useState(baseProfile.weights.time);
  const [slopeWeight, setSlopeWeight] = useState(baseProfile.weights.slope);
  const [lowLightWeight, setLowLightWeight] = useState(baseProfile.weights.lowLight);
  const [sensoryLoadWeight, setSensoryLoadWeight] = useState(baseProfile.weights.sensoryLoad);
  const [exposedHeatWeight, setExposedHeatWeight] = useState(baseProfile.weights.exposedHeat);
  const [distanceFromRestWeight, setDistanceFromRestWeight] = useState(baseProfile.weights.distanceFromRest);

  const [validationError, setValidationError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Store opener element and handle focus trapping
  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement as HTMLElement | null;
      // Focus close button on open
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
          return;
        }

        if (e.key === "Tab" && dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;

          const firstElem = focusable[0];
          const lastElem = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElem) {
              e.preventDefault();
              lastElem.focus();
            }
          } else {
            if (document.activeElement === lastElem) {
              e.preventDefault();
              firstElem.focus();
            }
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        if (openerRef.current && typeof openerRef.current.focus === "function") {
          openerRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResetToPreset = (presetId: string) => {
    const preset = ROUTE_PROFILES[presetId] || ROUTE_PROFILES.fastest;
    setName(`Custom (${preset.name})`);
    setNoStairs(preset.noStairs);
    setRequireWorkingLift(preset.requireWorkingLift);
    setMaxSlopePct(preset.maxSlopePct);
    setMinWidthCm(preset.minWidthCm);
    setExcludeUnevenSurface(preset.excludeUnevenSurface);

    setTimeWeight(preset.weights.time);
    setSlopeWeight(preset.weights.slope);
    setLowLightWeight(preset.weights.lowLight);
    setSensoryLoadWeight(preset.weights.sensoryLoad);
    setExposedHeatWeight(preset.weights.exposedHeat);
    setDistanceFromRestWeight(preset.weights.distanceFromRest);
    setValidationError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Profile name is required.");
      return;
    }

    if (maxSlopePct !== undefined && (isNaN(maxSlopePct) || maxSlopePct < 0 || maxSlopePct > 25)) {
      setValidationError("Maximum slope must be between 0% and 25%.");
      return;
    }

    if (minWidthCm !== undefined && (isNaN(minWidthCm) || minWidthCm < 50 || minWidthCm > 300)) {
      setValidationError("Clear width must be between 50cm and 300cm.");
      return;
    }

    const customProfile: RouteProfile = {
      id: "custom",
      name: name.trim(),
      description: "User-defined custom accessibility profile with custom hard filters and weights.",
      noStairs,
      requireWorkingLift,
      maxSlopePct: maxSlopePct !== undefined && maxSlopePct > 0 ? maxSlopePct : undefined,
      minWidthCm: minWidthCm !== undefined && minWidthCm > 0 ? minWidthCm : undefined,
      excludeUnevenSurface,
      weights: {
        time: Math.max(0, Number(timeWeight) || 1.0),
        slope: Math.max(0, Number(slopeWeight) || 0),
        lowLight: Math.max(0, Number(lowLightWeight) || 0),
        sensoryLoad: Math.max(0, Number(sensoryLoadWeight) || 0),
        exposedHeat: Math.max(0, Number(exposedHeatWeight) || 0),
        distanceFromRest: Math.max(0, Number(distanceFromRestWeight) || 0),
      },
      isCustom: true,
    };

    onSaveProfile(customProfile);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card modal-custom-profile"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-profile-title"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Sliders className="text-civic" size={20} aria-hidden="true" />
            <h2 id="custom-profile-title" className="modal-title">
              Customize Accessibility Profile
            </h2>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close custom profile dialog"
            ref={closeButtonRef}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          {validationError && (
            <div className="form-error-banner" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Preset quick-load */}
          <div className="form-group">
            <label htmlFor="preset-loader" className="form-label">
              Load Base Preset
            </label>
            <div className="preset-load-row">
              <select
                id="preset-loader"
                className="form-select"
                onChange={(e) => handleResetToPreset(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Select preset template to copy...
                </option>
                {Object.values(ROUTE_PROFILES).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-name-input" className="form-label">
              Profile Display Name <span className="text-amber">*</span>
            </label>
            <input
              id="profile-name-input"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Hard Constraints Section */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">Hard Exclusion Constraints</legend>
            <p className="fieldset-help">
              Paths violating these criteria are strictly rejected before any routing occurs.
            </p>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="custom-no-stairs"
                  checked={noStairs}
                  onChange={(e) => setNoStairs(e.target.checked)}
                />
                <span>Strictly Prohibit Stairs / Steps (Step-free)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="custom-require-lift"
                  checked={requireWorkingLift}
                  onChange={(e) => setRequireWorkingLift(e.target.checked)}
                />
                <span>Avoid Out-of-Service Lifts (Prohibit lifts with active outages)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="custom-uneven-surface"
                  checked={excludeUnevenSurface}
                  onChange={(e) => setExcludeUnevenSurface(e.target.checked)}
                />
                <span>Exclude Uneven / Unpaved Surfaces</span>
              </label>
            </div>

            <div className="form-row" style={{ marginTop: "10px" }}>
              <div className="form-group flex-1">
                <label htmlFor="custom-max-slope" className="form-label">
                  Max Slope Limit (%)
                </label>
                <input
                  id="custom-max-slope"
                  type="number"
                  min="0"
                  max="25"
                  step="0.5"
                  className="form-input"
                  placeholder="e.g. 6 (ADA standard)"
                  value={maxSlopePct ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMaxSlopePct(val === "" ? undefined : parseFloat(val));
                  }}
                />
                <span className="form-help-text">Leave blank for unconstrained slope</span>
              </div>

              <div className="form-group flex-1">
                <label htmlFor="custom-min-width" className="form-label">
                  Min Clear Width (cm)
                </label>
                <input
                  id="custom-min-width"
                  type="number"
                  min="50"
                  max="300"
                  step="5"
                  className="form-input"
                  placeholder="e.g. 90 (Wheelchair)"
                  value={minWidthCm ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMinWidthCm(val === "" ? undefined : parseInt(val, 10));
                  }}
                />
                <span className="form-help-text">Leave blank for unconstrained width</span>
              </div>
            </div>
          </fieldset>

          {/* Soft Preferences Weights Section */}
          <fieldset className="form-fieldset">
            <legend className="fieldset-legend">Multi-Objective Soft Penalty Weights</legend>
            <p className="fieldset-help">
              Adjust how strongly each ambient factor is penalized in route selection (0 = ignore, 5 = highest penalty).
            </p>

            <div className="weight-slider-grid">
              <div className="weight-control">
                <div className="weight-label-row">
                  <label htmlFor="weight-time">Transit Duration</label>
                  <span className="font-mono text-xs">{timeWeight.toFixed(1)}×</span>
                </div>
                <input
                  id="weight-time"
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={timeWeight}
                  onChange={(e) => setTimeWeight(parseFloat(e.target.value))}
                />
              </div>

              <div className="weight-control">
                <div className="weight-label-row">
                  <label htmlFor="weight-slope">Incline / Slope Effort</label>
                  <span className="font-mono text-xs">{slopeWeight.toFixed(1)}×</span>
                </div>
                <input
                  id="weight-slope"
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={slopeWeight}
                  onChange={(e) => setSlopeWeight(parseFloat(e.target.value))}
                />
              </div>

              <div className="weight-control">
                <div className="weight-label-row">
                  <label htmlFor="weight-light">Low Light Penalty</label>
                  <span className="font-mono text-xs">{lowLightWeight.toFixed(1)}×</span>
                </div>
                <input
                  id="weight-light"
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={lowLightWeight}
                  onChange={(e) => setLowLightWeight(parseFloat(e.target.value))}
                />
              </div>

              <div className="weight-control">
                <div className="weight-label-row">
                  <label htmlFor="weight-sensory">Sensory / Noise Penalty</label>
                  <span className="font-mono text-xs">{sensoryLoadWeight.toFixed(1)}×</span>
                </div>
                <input
                  id="weight-sensory"
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={sensoryLoadWeight}
                  onChange={(e) => setSensoryLoadWeight(parseFloat(e.target.value))}
                />
              </div>

              <div className="weight-control">
                <div className="weight-label-row">
                  <label htmlFor="weight-heat">Heat &amp; Sun Exposure</label>
                  <span className="font-mono text-xs">{exposedHeatWeight.toFixed(1)}×</span>
                </div>
                <input
                  id="weight-heat"
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={exposedHeatWeight}
                  onChange={(e) => setExposedHeatWeight(parseFloat(e.target.value))}
                />
              </div>

              <div className="weight-control">
                <div className="weight-label-row">
                  <label htmlFor="weight-rest">Distance from Rest Areas</label>
                  <span className="font-mono text-xs">{distanceFromRestWeight.toFixed(1)}×</span>
                </div>
                <input
                  id="weight-rest"
                  type="range"
                  min="0"
                  max="5.0"
                  step="0.1"
                  value={distanceFromRestWeight}
                  onChange={(e) => setDistanceFromRestWeight(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </fieldset>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleResetToPreset("step_free")}
              title="Reset values to standard Step-free preset"
            >
              <RotateCcw size={14} aria-hidden="true" />
              <span>Reset to Step-Free</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} aria-hidden="true" />
              <span>Apply Custom Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
