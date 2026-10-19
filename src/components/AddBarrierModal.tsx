import React, { useState, useEffect, useRef } from "react";
import { Barrier, CampusEdge, BarrierKind } from "../domain/types";
import { X, AlertTriangle, Plus } from "lucide-react";

interface AddBarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBarrier: (barrier: Barrier) => void;
  edges: CampusEdge[];
}

export const AddBarrierModal: React.FC<AddBarrierModalProps> = ({
  isOpen,
  onClose,
  onAddBarrier,
  edges,
}) => {
  const [edgeId, setEdgeId] = useState(edges[0]?.id || "");
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<BarrierKind>("lift_outage");
  const [hardBlock, setHardBlock] = useState(true);
  const [severity, setSeverity] = useState<1 | 2 | 3>(3);
  const [validationError, setValidationError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement as HTMLElement | null;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setValidationError("Incident description / note is required.");
      return;
    }
    if (!edgeId) {
      setValidationError("Please select an affected campus path.");
      return;
    }

    const newBarrier: Barrier = {
      id: `barrier_${Date.now()}`,
      edgeId,
      kind,
      hardBlock,
      severity: hardBlock ? 3 : severity,
      note: note.trim(),
      startsAt: new Date().toISOString(),
      demoOnly: true,
    };

    onAddBarrier(newBarrier);
    setNote("");
    setValidationError(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <AlertTriangle className="text-amber" size={20} aria-hidden="true" />
            <h2 id="modal-title" className="modal-title">
              Report Infrastructure Incident / Barrier
            </h2>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
            ref={closeButtonRef}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {validationError && (
            <div className="form-error-banner" role="alert">
              <AlertTriangle size={16} aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="barrier-edge" className="form-label">
              Affected Campus Path / Segment <span className="text-amber">*</span>
            </label>
            <select
              id="barrier-edge"
              className="form-select"
              value={edgeId}
              onChange={(e) => setEdgeId(e.target.value)}
              required
            >
              {edges.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} ({e.from} → {e.to}, {e.mode}, {e.distanceM}m)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="barrier-note" className="form-label">
              Incident Description / Note <span className="text-amber">*</span>
            </label>
            <input
              id="barrier-note"
              type="text"
              className="form-input"
              placeholder="e.g. Science Quad Passenger Lift Out of Service"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="barrier-kind" className="form-label">
                Category
              </label>
              <select
                id="barrier-kind"
                className="form-select"
                value={kind}
                onChange={(e) => setKind(e.target.value as BarrierKind)}
              >
                <option value="lift_outage">Lift / Elevator Outage</option>
                <option value="closed">Closed / Construction</option>
                <option value="obstruction">Physical Obstruction</option>
                <option value="crowding">Heavy Sensory Crowding</option>
                <option value="poor_light">Lighting Outage</option>
              </select>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Severity Level</label>
              <div className="radio-toggle-group">
                <label className={`radio-pill ${hardBlock ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="severity"
                    checked={hardBlock}
                    onChange={() => setHardBlock(true)}
                  />
                  <span>Hard Block (Impasse)</span>
                </label>
                <label className={`radio-pill ${!hardBlock ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="severity"
                    checked={!hardBlock}
                    onChange={() => setHardBlock(false)}
                  />
                  <span>Soft Delay</span>
                </label>
              </div>
            </div>
          </div>

          {!hardBlock && (
            <div className="form-group">
              <label htmlFor="severity-level" className="form-label">
                Impediment Level
              </label>
              <select
                id="severity-level"
                className="form-select"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value) as 1 | 2 | 3)}
              >
                <option value="1">Level 1: Minor delay</option>
                <option value="2">Level 2: Moderate impediment</option>
                <option value="3">Level 3: Severe impedance</option>
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} aria-hidden="true" />
              <span>Record Active Incident</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
