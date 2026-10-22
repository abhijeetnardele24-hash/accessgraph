/**
 * RouteWitness — Signature Regression Demo Fixture
 *
 * Demonstrates the core RouteWitness value proposition:
 * An apparently innocent building identifier change passes all normal tests
 * but silently removes ALL step-free routes to the Science Lab.
 *
 * GRAPH TOPOLOGY (Synthetic Demo Campus):
 *
 * Step-free paths to Science Lab (via lift):
 *   Path A: Gate → Admin → Courtyard → SciQuad → SciForoyer
 *     → node_sci_lift_ground → [lift] node_sci_lift_f2
 *     → StairsTop → SciLab
 *
 *   Path B (ramp backup): Gate → ... → Courtyard
 *     → [ramp] node_ramp_landing_f2 → node_sci_lift_f2
 *     → StairsTop → SciLab
 *
 * BOTH paths converge on node_sci_lift_f2.
 *
 * Regression scenario:
 *   Candidate renames "node_sci_lift_f2" → "node_sci_elevator_f2"
 *   (building code change: "lift" → "elevator" to match new labeling standard).
 *   Edges still reference the old ID "node_sci_lift_f2" → all lift/ramp paths
 *   to Floor 2 of Science Complex become dangling.
 *   Step-free profile: DISCONNECTED from Science Lab ❌
 *   Fastest profile (uses stairs): CONNECTED ✅ (does not depend on node_sci_lift_f2)
 *
 * All data is SYNTHETIC. isSyntheticDemo: true.
 */

import type { CampusDataset } from "../../../src/domain/types.js";
import { DEMO_CAMPUS } from "../../../src/data/demoCampus.js";

/**
 * BASELINE: Correct campus data where node_sci_lift_f2 exists and connects
 * both the lift shaft and the ramp landing to the stairs-top mezzanine.
 */
export const BASELINE_DATASET: CampusDataset = {
  ...DEMO_CAMPUS,
  // Remove default barriers for clean structural regression test
  defaultBarriers: [],
};

/**
 * CANDIDATE: Building identifier change — "lift" renamed to "elevator".
 * node_sci_lift_f2 renamed to node_sci_elevator_f2.
 * Edges still reference node_sci_lift_f2 → ALL lift-dependent paths dangling.
 * Step-free profile loses ALL paths to Science Lab.
 * Fastest (stair) profile is unaffected.
 */
export const CANDIDATE_DATASET: CampusDataset = {
  ...DEMO_CAMPUS,
  version: "1.0.1-candidate",
  attribution:
    "Candidate dataset — lift→elevator identifier rename. RouteWitness regression demo. SYNTHETIC.",
  nodes: DEMO_CAMPUS.nodes.map((node) => {
    // Simulate: rename "node_sci_lift_f2" → "node_sci_elevator_f2"
    if (node.id === "node_sci_lift_f2") {
      return {
        ...node,
        id: "node_sci_elevator_f2",
        label: node.label.replace("Lift", "Elevator"),
      };
    }
    return node;
  }),
  // Edges NOT updated — still reference "node_sci_lift_f2" (old ID).
  // Dangling edges:
  //   edge_sci_lift_shaft: from node_sci_lift_ground TO node_sci_lift_f2 (dangling)
  //   edge_ramplanding_liftf2: from node_ramp_landing_f2 TO node_sci_lift_f2 (dangling)
  //   edge_liftf2_stairstop: from node_sci_lift_f2 TO node_sci_stairs_top (dangling)
  edges: DEMO_CAMPUS.edges,
  defaultBarriers: [],
};

/**
 * Benchmark scenarios.
 * Profile IDs match ROUTE_PROFILES keys in src/domain/profiles.ts.
 */
export const REGRESSION_SCENARIOS = [
  {
    id: "scenario_stepfree_gate_to_scilab",
    description:
      "Step-free (wheelchair) journey from Main Gate to Science Lab. " +
      "Baseline: CONNECTED via lift path (node_sci_lift_f2). " +
      "Candidate: DISCONNECTED — node_sci_lift_f2 renamed to node_sci_elevator_f2, " +
      "making all lift-dependent step-free paths to Floor 2 dangling.",
    originId: "node_gate",
    destinationId: "node_sci_lab",
    profileId: "step_free",
    activeBarrierIds: [],
    invariantId: "inv_stepfree_connectivity",
    invariantDescription:
      "A step-free (wheelchair) route must exist between any structurally connected campus origin " +
      "and destination accessible under the step_free profile when no hard barriers are active.",
    requiresConnected: true,
  },
  {
    id: "scenario_fastest_gate_to_scilab",
    description:
      "Default (fastest/unconstrained) journey from Main Gate to Science Lab. " +
      "Uses stairs — must remain connected after the lift identifier rename.",
    originId: "node_gate",
    destinationId: "node_sci_lab",
    profileId: "fastest",
    activeBarrierIds: [],
    invariantId: "inv_default_connectivity",
    invariantDescription:
      "The fastest (unconstrained) profile must remain connected between campus nodes after " +
      "any routing data change that does not remove ordinary stair or corridor edges.",
    requiresConnected: true,
  },
  {
    id: "scenario_stepfree_gate_to_library",
    description:
      "Step-free journey from Main Gate to Library — must not regress as a side-effect " +
      "of the Science Complex lift identifier rename.",
    originId: "node_gate",
    destinationId: "node_lib_entrance",
    profileId: "step_free",
    activeBarrierIds: [],
    invariantId: "inv_stepfree_connectivity",
    invariantDescription:
      "A step-free route must exist between any structurally connected campus origin and destination " +
      "under the step_free profile when no hard barriers are active.",
    requiresConnected: true,
  },
] as const;

export type RegressionScenario = (typeof REGRESSION_SCENARIOS)[number];

export const FIXTURE_VERSION = "1.0.0";
export const FIXTURE_DESCRIPTION =
  "Signature regression fixture: Science Complex lift node identifier rename " +
  "(lift→elevator) silently disconnects ALL step-free paths to Science Lab " +
  "while leaving the default (stair-using) profile unaffected. SYNTHETIC data only.";
