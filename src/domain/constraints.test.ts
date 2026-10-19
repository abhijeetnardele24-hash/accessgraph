import { describe, it, expect } from "vitest";
import {
  checkEdgeHardConstraints,
  getActiveHardConstraintDescriptions,
  isBarrierActive,
  filterActiveBarriers,
} from "./constraints";
import { ROUTE_PROFILES } from "./profiles";
import { CampusEdge, Barrier } from "./types";

const BASE_EDGE: CampusEdge = {
  id: "test_edge_1",
  from: "node_a",
  to: "node_b",
  bidirectional: true,
  distanceM: 50,
  durationSec: 40,
  mode: "corridor",
  slopePct: 2.0,
  widthCm: 180,
  surface: "smooth",
  lighting: 2,
  sensoryLoad: 0,
  shade: 2,
  tactileGuidance: true,
  hasRestNearby: true,
};

describe("Constraint Filter (Hard Rules)", () => {
  it("permits standard corridor edges under unconstrained fastest profile", () => {
    const res = checkEdgeHardConstraints(BASE_EDGE, ROUTE_PROFILES.fastest, []);
    expect(res.eligible).toBe(true);
    expect(res.violations).toHaveLength(0);
  });

  it("strictly prohibits stairs for Step-free profile", () => {
    const stairEdge: CampusEdge = { ...BASE_EDGE, mode: "stairs", slopePct: 30 };
    const res = checkEdgeHardConstraints(stairEdge, ROUTE_PROFILES.step_free, []);
    expect(res.eligible).toBe(false);
    expect(res.violations.some((v) => v.constraint === "no_stairs")).toBe(true);
  });

  it("allows stairs for unconstrained fastest profile", () => {
    const stairEdge: CampusEdge = { ...BASE_EDGE, mode: "stairs" };
    const res = checkEdgeHardConstraints(stairEdge, ROUTE_PROFILES.fastest, []);
    expect(res.eligible).toBe(true);
  });

  it("enforces maximum slope constraint as a hard filter", () => {
    const steepEdge: CampusEdge = { ...BASE_EDGE, slopePct: 9.5 }; // >6%
    const res = checkEdgeHardConstraints(steepEdge, ROUTE_PROFILES.step_free, []);
    expect(res.eligible).toBe(false);
    expect(res.violations.some((v) => v.constraint === "max_slope")).toBe(true);
  });

  it("enforces minimum clear width constraint as a hard filter", () => {
    const narrowEdge: CampusEdge = { ...BASE_EDGE, widthCm: 75 }; // <90cm
    const res = checkEdgeHardConstraints(narrowEdge, ROUTE_PROFILES.step_free, []);
    expect(res.eligible).toBe(false);
    expect(res.violations.some((v) => v.constraint === "min_width")).toBe(true);
  });

  it("enforces uneven surface exclusion", () => {
    const unevenEdge: CampusEdge = { ...BASE_EDGE, surface: "uneven" };
    const res = checkEdgeHardConstraints(unevenEdge, ROUTE_PROFILES.step_free, []);
    expect(res.eligible).toBe(false);
    expect(res.violations.some((v) => v.constraint === "exclude_uneven_surface")).toBe(true);
  });

  it("invalidates lift edge when lift outage barrier is active", () => {
    const liftEdge: CampusEdge = { ...BASE_EDGE, id: "lift_shaft", mode: "lift" };
    const outageBarrier: Barrier = {
      id: "b_outage",
      edgeId: "lift_shaft",
      kind: "lift_outage",
      hardBlock: true,
      severity: 3,
      note: "Motor breakdown",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const res = checkEdgeHardConstraints(liftEdge, ROUTE_PROFILES.step_free, [outageBarrier]);
    expect(res.eligible).toBe(false);
    expect(res.violations.some((v) => v.constraint === "require_working_lift")).toBe(true);
  });

  it("blocks any edge with a hard-blocking barrier", () => {
    const closedBarrier: Barrier = {
      id: "b_closed",
      edgeId: BASE_EDGE.id,
      kind: "closed",
      hardBlock: true,
      severity: 3,
      note: "Police cordon",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const res = checkEdgeHardConstraints(BASE_EDGE, ROUTE_PROFILES.fastest, [closedBarrier]);
    expect(res.eligible).toBe(false);
    expect(res.violations.some((v) => v.constraint === "hard_barrier")).toBe(true);
  });

  it("does not hard-block an edge when barrier is non-blocking (soft penalty only)", () => {
    const softBarrier: Barrier = {
      id: "b_crowd",
      edgeId: BASE_EDGE.id,
      kind: "crowding",
      hardBlock: false,
      severity: 2,
      note: "Heavy lunch traffic",
      startsAt: "2026-10-19T00:00:00Z",
      demoOnly: true,
    };

    const res = checkEdgeHardConstraints(BASE_EDGE, ROUTE_PROFILES.fastest, [softBarrier]);
    expect(res.eligible).toBe(true);
  });

  it("generates human-readable constraint descriptions", () => {
    const descriptions = getActiveHardConstraintDescriptions(ROUTE_PROFILES.step_free);
    expect(descriptions).toContain("Strictly Step-Free (No Stairs)");
    expect(descriptions).toContain("Avoid Out-of-Service Lifts");
    expect(descriptions).toContain("Maximum Incline: 6%");
  });

  describe("Barrier Lifecycle Semantics", () => {
    const evalTime = new Date("2026-10-19T12:00:00Z");

    it("evaluates barrier as inactive when startsAt is in the future", () => {
      const futureBarrier: Barrier = {
        id: "b_future",
        edgeId: BASE_EDGE.id,
        kind: "closed",
        hardBlock: true,
        severity: 3,
        note: "Scheduled construction tomorrow",
        startsAt: "2026-10-20T08:00:00Z",
        demoOnly: true,
      };

      expect(isBarrierActive(futureBarrier, evalTime)).toBe(false);
      const activeList = filterActiveBarriers([futureBarrier], evalTime);
      expect(activeList).toHaveLength(0);

      const check = checkEdgeHardConstraints(BASE_EDGE, ROUTE_PROFILES.fastest, [futureBarrier], evalTime);
      expect(check.eligible).toBe(true);
    });

    it("evaluates barrier as active when startsAt has passed and expiresAt is in the future", () => {
      const activeBarrier: Barrier = {
        id: "b_active",
        edgeId: BASE_EDGE.id,
        kind: "closed",
        hardBlock: true,
        severity: 3,
        note: "Active pipe repair",
        startsAt: "2026-10-19T08:00:00Z",
        expiresAt: "2026-10-19T18:00:00Z",
        demoOnly: true,
      };

      expect(isBarrierActive(activeBarrier, evalTime)).toBe(true);
      const activeList = filterActiveBarriers([activeBarrier], evalTime);
      expect(activeList).toHaveLength(1);

      const check = checkEdgeHardConstraints(BASE_EDGE, ROUTE_PROFILES.fastest, [activeBarrier], evalTime);
      expect(check.eligible).toBe(false);
    });

    it("evaluates barrier as inactive when expiresAt has passed (expired)", () => {
      const expiredBarrier: Barrier = {
        id: "b_expired",
        edgeId: BASE_EDGE.id,
        kind: "closed",
        hardBlock: true,
        severity: 3,
        note: "Completed maintenance yesterday",
        startsAt: "2026-10-18T08:00:00Z",
        expiresAt: "2026-10-19T10:00:00Z",
        demoOnly: true,
      };

      expect(isBarrierActive(expiredBarrier, evalTime)).toBe(false);
      const activeList = filterActiveBarriers([expiredBarrier], evalTime);
      expect(activeList).toHaveLength(0);

      const check = checkEdgeHardConstraints(BASE_EDGE, ROUTE_PROFILES.fastest, [expiredBarrier], evalTime);
      expect(check.eligible).toBe(true);
    });
  });
});
