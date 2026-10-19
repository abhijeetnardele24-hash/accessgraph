import { CampusEdge, RouteProfile, Barrier } from "./types";

export interface ConstraintCheckResult {
  eligible: boolean;
  violations: Array<{
    constraint: string;
    reason: string;
  }>;
}

/**
 * Centralized barrier active state evaluator respecting lifecycle timestamps.
 * - Future startsAt: inactive.
 * - Past expiresAt: inactive.
 */
export function isBarrierActive(barrier: Barrier, evaluationTime: Date = new Date()): boolean {
  const evalMs = evaluationTime.getTime();
  if (barrier.startsAt) {
    const startMs = new Date(barrier.startsAt).getTime();
    if (!isNaN(startMs) && evalMs < startMs) {
      return false;
    }
  }
  if (barrier.expiresAt) {
    const expireMs = new Date(barrier.expiresAt).getTime();
    if (!isNaN(expireMs) && evalMs >= expireMs) {
      return false;
    }
  }
  return true;
}

/**
 * Filters a barrier collection to only currently active incidents.
 */
export function filterActiveBarriers(
  barriers: Barrier[],
  evaluationTime: Date = new Date()
): Barrier[] {
  return barriers.filter((b) => isBarrierActive(b, evaluationTime));
}

/**
 * Checks whether an edge satisfies all active hard constraints for a profile
 * and is not blocked by an active hard barrier.
 *
 * Hard constraints MUST exclude edges before any soft cost scoring occurs.
 */
export function checkEdgeHardConstraints(
  edge: CampusEdge,
  profile: RouteProfile,
  activeBarriers: Barrier[],
  evaluationTime: Date = new Date()
): ConstraintCheckResult {
  const violations: Array<{ constraint: string; reason: string }> = [];
  const effectiveBarriers = filterActiveBarriers(activeBarriers, evaluationTime);

  // 1. Hard Barrier Check
  const blockingBarriers = effectiveBarriers.filter(
    (b) => b.edgeId === edge.id && b.hardBlock
  );
  for (const barrier of blockingBarriers) {
    violations.push({
      constraint: "hard_barrier",
      reason: `Blocked by active barrier: ${barrier.note} (${barrier.kind})`,
    });
  }

  // 2. Stairs Constraint
  if (profile.noStairs && edge.mode === "stairs") {
    violations.push({
      constraint: "no_stairs",
      reason: `Edge mode is 'stairs' while step-free profile strictly prohibits steps.`,
    });
  }

  // 3. Lift Outage Constraint
  if (profile.requireWorkingLift && edge.mode === "lift") {
    const liftOutages = effectiveBarriers.filter(
      (b) => b.edgeId === edge.id && b.kind === "lift_outage"
    );
    if (liftOutages.length > 0) {
      violations.push({
        constraint: "require_working_lift",
        reason: `Lift is currently decommissioned due to reported outage.`,
      });
    }
  }

  // 4. Maximum Slope Constraint
  if (
    profile.maxSlopePct !== undefined &&
    edge.slopePct !== undefined &&
    edge.slopePct > profile.maxSlopePct
  ) {
    violations.push({
      constraint: "max_slope",
      reason: `Incline of ${edge.slopePct}% exceeds profile limit of ${profile.maxSlopePct}%.`,
    });
  }

  // 5. Minimum Clear Width Constraint
  if (
    profile.minWidthCm !== undefined &&
    edge.widthCm !== undefined &&
    edge.widthCm < profile.minWidthCm
  ) {
    violations.push({
      constraint: "min_width",
      reason: `Clear width of ${edge.widthCm}cm is below minimum required width of ${profile.minWidthCm}cm.`,
    });
  }

  // 6. Uneven Surface Constraint
  if (profile.excludeUnevenSurface && edge.surface === "uneven") {
    violations.push({
      constraint: "exclude_uneven_surface",
      reason: `Surface is classified as 'uneven', which is prohibited for this profile.`,
    });
  }

  return {
    eligible: violations.length === 0,
    violations,
  };
}

/**
 * Returns human-readable summary of active hard constraints for a profile.
 */
export function getActiveHardConstraintDescriptions(profile: RouteProfile): string[] {
  const list: string[] = [];
  if (profile.noStairs) list.push("Strictly Step-Free (No Stairs)");
  if (profile.requireWorkingLift) list.push("Requires Operational Elevators");
  if (profile.maxSlopePct !== undefined) list.push(`Maximum Incline: ${profile.maxSlopePct}%`);
  if (profile.minWidthCm !== undefined) list.push(`Minimum Clear Path Width: ${profile.minWidthCm}cm`);
  if (profile.excludeUnevenSurface) list.push("Excludes Uneven Surfaces");
  return list;
}
