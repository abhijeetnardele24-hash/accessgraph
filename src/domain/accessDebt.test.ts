import { describe, it, expect } from "vitest";
import { evaluateAccessDebt } from "./accessDebt";
import { DEMO_CAMPUS } from "../data/demoCampus";
import { Barrier } from "./types";

describe("Access Debt Evaluator & Repair Simulator", () => {
  it("evaluates baseline campus network without barriers", () => {
    const report = evaluateAccessDebt(DEMO_CAMPUS, []);

    expect(report.totalScenariosEvaluated).toBeGreaterThan(0);
    expect(report.activeBarriersCount).toBe(0);
    expect(report.repairCandidates).toHaveLength(0);
    // Baseline should have zero disconnected scenarios
    expect(report.disconnectedScenariosCount).toBe(0);
    expect(report.averageAccessPenalty).toBeGreaterThanOrEqual(1.0);
  });

  it("identifies lift outage as top bottleneck in default barrier scenario", () => {
    // Default barriers contain lift outage
    const report = evaluateAccessDebt(DEMO_CAMPUS, DEMO_CAMPUS.defaultBarriers);

    expect(report.activeBarriersCount).toBe(DEMO_CAMPUS.defaultBarriers.length);
    expect(report.repairCandidates.length).toBeGreaterThan(0);

    // The lift outage must be ranked candidate #1 because repairing it saves the most minutes
    const topCandidate = report.repairCandidates[0];
    expect(topCandidate.barrierKind).toBe("lift_outage");
    expect(topCandidate.minutesRecovered).toBeGreaterThan(0);
    expect(topCandidate.rank).toBe(1);
  });

  it("ranks candidates deterministically by restored scenarios and minutes recovered", () => {
    const barrier1: Barrier = {
      id: "b_minor_paving",
      edgeId: "edge_gate_humanities",
      kind: "obstruction",
      hardBlock: false,
      severity: 1,
      note: "Minor gravel",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const barrier2: Barrier = {
      id: "b_critical_lift",
      edgeId: "edge_sci_lift_shaft",
      kind: "lift_outage",
      hardBlock: true,
      severity: 3,
      note: "Elevator down",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const report = evaluateAccessDebt(DEMO_CAMPUS, [barrier1, barrier2]);

    expect(report.repairCandidates).toHaveLength(2);
    // Lift must rank higher than minor gravel
    expect(report.repairCandidates[0].barrierId).toBe("b_critical_lift");
    expect(report.repairCandidates[1].barrierId).toBe("b_minor_paving");
  });

  it("scenario access penalty is >= 1.0 for connected routes", () => {
    const report = evaluateAccessDebt(DEMO_CAMPUS, []);
    for (const res of report.scenarioResults) {
      if (res.connected) {
        expect(res.accessPenalty).toBeGreaterThanOrEqual(1.0);
      }
    }
  });

  it("prioritizes repairing a barrier that restores disconnected scenarios", () => {
    // Completely cut off the lab by blocking the entry edge
    const labBlocker: Barrier = {
      id: "b_lab_cut",
      edgeId: "edge_stairstop_scilab",
      kind: "closed",
      hardBlock: true,
      severity: 3,
      note: "Door locked",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const minorBlocker: Barrier = {
      id: "a_minor",
      edgeId: "edge_water_dining",
      kind: "obstruction",
      hardBlock: false,
      severity: 1,
      note: "Trash pickup",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const report = evaluateAccessDebt(DEMO_CAMPUS, [minorBlocker, labBlocker]);
    expect(report.disconnectedScenariosCount).toBeGreaterThan(0);
    // labBlocker must rank #1 because it restores disconnected scenarios
    expect(report.repairCandidates[0].barrierId).toBe("b_lab_cut");
    expect(report.repairCandidates[0].restoredScenariosCount).toBeGreaterThan(0);
  });

  it("breaks ties deterministically using barrierId when restored count and minutes are equal", () => {
    const barrierA: Barrier = {
      id: "barrier_a_tie",
      edgeId: "edge_humanities_lib",
      kind: "obstruction",
      hardBlock: false,
      severity: 1,
      note: "Leaf blower",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const barrierB: Barrier = {
      id: "barrier_b_tie",
      edgeId: "edge_courtyard_rest",
      kind: "obstruction",
      hardBlock: false,
      severity: 1,
      note: "Gardening",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const report = evaluateAccessDebt(DEMO_CAMPUS, [barrierB, barrierA]);
    expect(report.repairCandidates[0].barrierId).toBe("barrier_a_tie");
    expect(report.repairCandidates[1].barrierId).toBe("barrier_b_tie");
  });
});
