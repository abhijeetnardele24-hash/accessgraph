import { describe, it, expect } from "vitest";
import { findRoute, calculateEdgeCost, computeFastestBaseline } from "./routeEngine";
import { DEMO_CAMPUS } from "../data/demoCampus";
import { ROUTE_PROFILES } from "./profiles";
import { Barrier } from "./types";

describe("Deterministic Route Engine & Signature Journey", () => {
  it("Phase 1: Default unconstrained fastest profile uses stairs for Library → Science Lab", () => {
    // Zero active barriers
    const res = findRoute(
      DEMO_CAMPUS,
      "node_lib_entrance",
      "node_sci_lab",
      ROUTE_PROFILES.fastest,
      []
    );

    expect(res.found).toBe(true);
    expect(res.edges.some((e) => e.mode === "stairs")).toBe(true);
    expect(res.edges.some((e) => e.id === "edge_sci_stairs_flight")).toBe(true);
    expect(res.fastestBaseline).toBeDefined();
    expect(res.totalDurationSec).toBeLessThanOrEqual(350);
  });

  it("Phase 2: Step-free profile strictly rejects stairs and routes via passenger lift", () => {
    // Zero active barriers
    const res = findRoute(
      DEMO_CAMPUS,
      "node_lib_entrance",
      "node_sci_lab",
      ROUTE_PROFILES.step_free,
      []
    );

    expect(res.found).toBe(true);
    // MUST NOT contain stairs
    expect(res.edges.some((e) => e.mode === "stairs")).toBe(false);
    expect(res.edges.some((e) => e.id === "edge_sci_stairs_flight")).toBe(false);
    // Must contain passenger lift
    expect(res.edges.some((e) => e.mode === "lift")).toBe(true);
    expect(res.edges.some((e) => e.id === "edge_sci_lift_shaft")).toBe(true);
    // Must audit rejected stairs
    expect(res.rejectedEdges.some((r) => r.edgeId === "edge_sci_stairs_flight")).toBe(true);
    expect(res.explanation).toContain("Step-free");
  });

  it("Phase 3: Temporary lift outage triggers deterministic reroute via Courtyard Elevated Ramp", () => {
    const liftOutage: Barrier = {
      id: "test_lift_outage",
      edgeId: "edge_sci_lift_shaft",
      kind: "lift_outage",
      hardBlock: true,
      severity: 3,
      note: "Motor breakdown",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const res = findRoute(
      DEMO_CAMPUS,
      "node_lib_entrance",
      "node_sci_lab",
      ROUTE_PROFILES.step_free,
      [liftOutage]
    );

    expect(res.found).toBe(true);
    // Neither stairs nor elevator!
    expect(res.edges.some((e) => e.mode === "stairs")).toBe(false);
    expect(res.edges.some((e) => e.mode === "lift")).toBe(false);
    // Must route via elevated courtyard ramp
    expect(res.edges.some((e) => e.id === "edge_courtyard_ramp_f2")).toBe(true);
    expect(res.rejectedEdges.some((r) => r.edgeId === "edge_sci_lift_shaft")).toBe(true);
  });

  it("Phase 4: No-route state is reported deterministically without silently relaxing constraints", () => {
    const liftOutage: Barrier = {
      id: "b_lift",
      edgeId: "edge_sci_lift_shaft",
      kind: "lift_outage",
      hardBlock: true,
      severity: 3,
      note: "Outage",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const rampBlock: Barrier = {
      id: "b_ramp",
      edgeId: "edge_courtyard_ramp_f2",
      kind: "closed",
      hardBlock: true,
      severity: 3,
      note: "Closed for maintenance",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    // Both lift and ramp blocked for a wheelchair user!
    const res = findRoute(
      DEMO_CAMPUS,
      "node_lib_entrance",
      "node_sci_lab",
      ROUTE_PROFILES.step_free,
      [liftOutage, rampBlock]
    );

    expect(res.found).toBe(false);
    expect(res.nodes).toHaveLength(0);
    expect(res.edges).toHaveLength(0);
    expect(res.noRouteDiagnostic).toBeDefined();
    expect(res.noRouteDiagnostic?.blockingBarriers.length).toBeGreaterThan(0);
    expect(res.explanation).toContain("No viable route");
  });

  it("produces byte-for-byte identical results for identical inputs (determinism)", () => {
    const run1 = findRoute(
      DEMO_CAMPUS,
      "node_gate",
      "node_sci_lab",
      ROUTE_PROFILES.step_free,
      DEMO_CAMPUS.defaultBarriers
    );

    const run2 = findRoute(
      DEMO_CAMPUS,
      "node_gate",
      "node_sci_lab",
      ROUTE_PROFILES.step_free,
      DEMO_CAMPUS.defaultBarriers
    );

    expect(JSON.stringify(run1)).toEqual(JSON.stringify(run2));
  });

  it("cost breakdown matches total cost sum", () => {
    const edge = DEMO_CAMPUS.edges[0];
    const { totalCost, breakdown } = calculateEdgeCost(
      edge,
      ROUTE_PROFILES.step_free,
      []
    );

    const sum =
      breakdown.timeCost +
      breakdown.slopeCost +
      breakdown.lightCost +
      breakdown.sensoryCost +
      breakdown.heatCost +
      breakdown.restCost +
      breakdown.barrierPenalty;

    expect(totalCost).toBeCloseTo(sum, 5);
  });

  it("computes unconstrained fastest baseline correctly", () => {
    const baseline = computeFastestBaseline(
      DEMO_CAMPUS,
      "node_lib_entrance",
      "node_sci_lab"
    );

    expect(baseline).toBeDefined();
    expect(baseline?.containsStairs).toBe(true);
    expect(baseline?.nodeIds[0]).toBe("node_lib_entrance");
    expect(baseline?.nodeIds[baseline.nodeIds.length - 1]).toBe("node_sci_lab");
  });

  it("proves 100% path determinism across 20 randomized edge array shuffles", () => {
    const origin = "node_lib_entrance";
    const dest = "node_sci_lab";
    const profile = ROUTE_PROFILES.step_free;

    const baseResult = findRoute(DEMO_CAMPUS, origin, dest, profile, []);
    const baseEdgeIds = baseResult.edges.map((e) => e.id);
    const baseExplanation = baseResult.explanation;
    const baseCost = baseResult.totalCost;
    const baseDuration = baseResult.totalDurationSec;

    for (let i = 0; i < 20; i++) {
      // Fisher-Yates shuffle copy of edges
      const shuffledEdges = [...DEMO_CAMPUS.edges];
      for (let j = shuffledEdges.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [shuffledEdges[j], shuffledEdges[k]] = [shuffledEdges[k], shuffledEdges[j]];
      }

      const shuffledDataset = { ...DEMO_CAMPUS, edges: shuffledEdges };
      const result = findRoute(shuffledDataset, origin, dest, profile, []);

      expect(result.found).toBe(true);
      expect(result.edges.map((e) => e.id)).toEqual(baseEdgeIds);
      expect(result.explanation).toEqual(baseExplanation);
      expect(result.totalCost).toBeCloseTo(baseCost, 4);
      expect(result.totalDurationSec).toBe(baseDuration);
    }
  });

  describe("Lifecycle-aware barrier routing", () => {
    const evalTime = new Date("2026-10-19T12:00:00Z");

    it("ignores future barrier and routes via passenger lift", () => {
      const futureLiftOutage: Barrier = {
        id: "b_future_lift",
        edgeId: "edge_sci_lift_shaft",
        kind: "lift_outage",
        hardBlock: true,
        severity: 3,
        note: "Scheduled elevator motor maintenance tomorrow",
        startsAt: "2026-10-20T08:00:00Z",
        demoOnly: true,
      };

      const res = findRoute(
        DEMO_CAMPUS,
        "node_lib_entrance",
        "node_sci_lab",
        ROUTE_PROFILES.step_free,
        [futureLiftOutage],
        evalTime
      );

      expect(res.found).toBe(true);
      expect(res.edges.some((e) => e.id === "edge_sci_lift_shaft")).toBe(true);
    });

    it("respects active barrier and reroutes via elevated courtyard ramp", () => {
      const activeLiftOutage: Barrier = {
        id: "b_active_lift",
        edgeId: "edge_sci_lift_shaft",
        kind: "lift_outage",
        hardBlock: true,
        severity: 3,
        note: "Elevator motor breakdown active now",
        startsAt: "2026-10-19T08:00:00Z",
        expiresAt: "2026-10-19T20:00:00Z",
        demoOnly: true,
      };

      const res = findRoute(
        DEMO_CAMPUS,
        "node_lib_entrance",
        "node_sci_lab",
        ROUTE_PROFILES.step_free,
        [activeLiftOutage],
        evalTime
      );

      expect(res.found).toBe(true);
      expect(res.edges.some((e) => e.id === "edge_sci_lift_shaft")).toBe(false);
      expect(res.edges.some((e) => e.id === "edge_courtyard_ramp_f2")).toBe(true);
    });

    it("ignores expired barrier and routes via reopened passenger lift", () => {
      const expiredLiftOutage: Barrier = {
        id: "b_expired_lift",
        edgeId: "edge_sci_lift_shaft",
        kind: "lift_outage",
        hardBlock: true,
        severity: 3,
        note: "Elevator motor maintenance finished this morning",
        startsAt: "2026-10-18T08:00:00Z",
        expiresAt: "2026-10-19T10:00:00Z",
        demoOnly: true,
      };

      const res = findRoute(
        DEMO_CAMPUS,
        "node_lib_entrance",
        "node_sci_lab",
        ROUTE_PROFILES.step_free,
        [expiredLiftOutage],
        evalTime
      );

      expect(res.found).toBe(true);
      expect(res.edges.some((e) => e.id === "edge_sci_lift_shaft")).toBe(true);
    });
  });
});
