import {
  CampusDataset,
  CampusEdge,
  CampusNode,
  RouteProfile,
  Barrier,
  RouteResult,
  CostBreakdown,
  FastestRouteBaseline,
  RejectedEdgeProof,
} from "./types";
import {
  checkEdgeHardConstraints,
  getActiveHardConstraintDescriptions,
  filterActiveBarriers,
} from "./constraints";

/**
 * Calculates normalized multi-objective soft cost for traversing an edge.
 */
export function calculateEdgeCost(
  edge: CampusEdge,
  profile: RouteProfile,
  activeBarriers: Barrier[]
): { totalCost: number; breakdown: CostBreakdown } {
  const w = profile.weights;

  // Normalized components:
  // 1. Time: converted to minutes
  const timeNorm = edge.durationSec / 60;
  const timeCost = timeNorm * w.time;

  // 2. Slope: scale factor (e.g. 5% slope = 0.5)
  const slopeVal = edge.slopePct || 0;
  const slopeNorm = slopeVal / 10;
  const slopeCost = slopeNorm * w.slope;

  // 3. Low Light: lighting 0=2 (penalty), 1=1, 2=0
  const lightPenalty = 2 - edge.lighting;
  const lightCost = lightPenalty * w.lowLight;

  // 4. Sensory Load: 0=quiet, 1=moderate, 2=high
  const sensoryPenalty = edge.sensoryLoad;
  const sensoryCost = sensoryPenalty * w.sensoryLoad;

  // 5. Heat / Sun exposure: shade 0=2 (exposed), 1=1, 2=0 (covered)
  const heatPenalty = 2 - edge.shade;
  const heatCost = heatPenalty * w.exposedHeat;

  // 6. Rest Distance: 0 if nearby rest, 1.5 if no rest point nearby
  const restPenalty = edge.hasRestNearby ? 0 : 1.5;
  const restCost = restPenalty * w.distanceFromRest;

  // 7. Active Soft Barriers on this edge (e.g., crowding, construction delay)
  let barrierPenalty = 0;
  const softBarriers = activeBarriers.filter(
    (b) => b.edgeId === edge.id && !b.hardBlock
  );
  for (const b of softBarriers) {
    barrierPenalty += b.severity * 1.8;
  }

  const totalCost =
    timeCost +
    slopeCost +
    lightCost +
    sensoryCost +
    heatCost +
    restCost +
    barrierPenalty;

  return {
    totalCost,
    breakdown: {
      timeCost,
      slopeCost,
      lightCost,
      sensoryCost,
      heatCost,
      restCost,
      barrierPenalty,
    },
  };
}

interface PathState {
  nodeId: string;
  totalCost: number;
  totalDurationSec: number;
  totalDistanceM: number;
  edges: CampusEdge[];
  nodes: string[];
  pathKey: string;
}

/**
 * Computes deterministic shortest path in campus graph.
 * Enforces strict hard constraints first, then optimizes soft costs.
 * Employs deterministic tie-breaking:
 *   1. Total Cost
 *   2. Total Duration
 *   3. Total Distance
 *   4. Lexicographic edge IDs pathKey
 */
export function findRoute(
  dataset: CampusDataset,
  originId: string,
  destinationId: string,
  profile: RouteProfile,
  activeBarriers: Barrier[],
  evaluationTime: Date = new Date()
): RouteResult {
  const effectiveBarriers = filterActiveBarriers(activeBarriers, evaluationTime);

  const nodeMap = new Map<string, CampusNode>();
  for (const n of dataset.nodes) {
    nodeMap.set(n.id, n);
  }

  // Pre-audit: Record which edges fail hard constraints
  const rejectedEdges: RejectedEdgeProof[] = [];
  const eligibleEdges: CampusEdge[] = [];

  for (const edge of dataset.edges) {
    const check = checkEdgeHardConstraints(edge, profile, effectiveBarriers, evaluationTime);
    if (check.eligible) {
      eligibleEdges.push(edge);
    } else {
      for (const v of check.violations) {
        rejectedEdges.push({
          edgeId: edge.id,
          from: edge.from,
          to: edge.to,
          reason: v.reason,
          constraint: v.constraint,
        });
      }
    }
  }

  // Adjacency map for eligible edges
  const adj = new Map<string, Array<{ neighborId: string; edge: CampusEdge }>>();
  for (const node of dataset.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of eligibleEdges) {
    adj.get(edge.from)?.push({ neighborId: edge.to, edge });
    if (edge.bidirectional) {
      adj.get(edge.to)?.push({ neighborId: edge.from, edge });
    }
  }

  // Priority Queue / Min-Cost State Tracker (Dijkstra)
  const bestCost = new Map<string, number>();
  const bestDuration = new Map<string, number>();
  const bestDistance = new Map<string, number>();
  const bestPathKey = new Map<string, string>();

  const openSet: PathState[] = [
    {
      nodeId: originId,
      totalCost: 0,
      totalDurationSec: 0,
      totalDistanceM: 0,
      edges: [],
      nodes: [originId],
      pathKey: "",
    },
  ];

  bestCost.set(originId, 0);
  bestDuration.set(originId, 0);
  bestDistance.set(originId, 0);
  bestPathKey.set(originId, "");

  let targetState: PathState | null = null;

  while (openSet.length > 0) {
    // Sort deterministically: cost -> duration -> distance -> pathKey
    openSet.sort((a, b) => {
      if (Math.abs(a.totalCost - b.totalCost) > 0.0001) {
        return a.totalCost - b.totalCost;
      }
      if (a.totalDurationSec !== b.totalDurationSec) {
        return a.totalDurationSec - b.totalDurationSec;
      }
      if (a.totalDistanceM !== b.totalDistanceM) {
        return a.totalDistanceM - b.totalDistanceM;
      }
      return a.pathKey.localeCompare(b.pathKey);
    });

    const current = openSet.shift()!;

    if (current.nodeId === destinationId) {
      targetState = current;
      break;
    }

    const currentBest = bestCost.get(current.nodeId);
    if (currentBest !== undefined && current.totalCost > currentBest + 0.0001) {
      continue;
    }

    const neighbors = adj.get(current.nodeId) || [];
    for (const { neighborId, edge } of neighbors) {
      if (current.nodes.includes(neighborId)) {
        // Prevent cycles
        continue;
      }

      const { totalCost: edgeCost } = calculateEdgeCost(
        edge,
        profile,
        effectiveBarriers
      );
      const nextCost = current.totalCost + edgeCost;
      const nextDuration = current.totalDurationSec + edge.durationSec;
      const nextDistance = current.totalDistanceM + edge.distanceM;
      const nextEdges = [...current.edges, edge];
      const nextKey = nextEdges.map((e) => e.id).join("->");

      const prevBestCost = bestCost.get(neighborId);

      let isBetter = false;
      if (prevBestCost === undefined) {
        isBetter = true;
      } else if (nextCost < prevBestCost - 0.0001) {
        isBetter = true;
      } else if (Math.abs(nextCost - prevBestCost) <= 0.0001) {
        const prevDuration = bestDuration.get(neighborId) || Infinity;
        if (nextDuration < prevDuration) {
          isBetter = true;
        } else if (nextDuration === prevDuration) {
          const prevDistance = bestDistance.get(neighborId) || Infinity;
          if (nextDistance < prevDistance) {
            isBetter = true;
          } else if (nextDistance === prevDistance) {
            const prevKey = bestPathKey.get(neighborId) || "";
            if (nextKey.localeCompare(prevKey) < 0) {
              isBetter = true;
            }
          }
        }
      }

      if (isBetter) {
        bestCost.set(neighborId, nextCost);
        bestDuration.set(neighborId, nextDuration);
        bestDistance.set(neighborId, nextDistance);
        bestPathKey.set(neighborId, nextKey);

        openSet.push({
          nodeId: neighborId,
          totalCost: nextCost,
          totalDurationSec: nextDuration,
          totalDistanceM: nextDistance,
          edges: nextEdges,
          nodes: [...current.nodes, neighborId],
          pathKey: nextKey,
        });
      }
    }
  }

  // Calculate fastest unconstrained baseline for comparison
  const fastestBaseline = computeFastestBaseline(
    dataset,
    originId,
    destinationId
  );

  const activeConstraints = getActiveHardConstraintDescriptions(profile);

  if (!targetState) {
    // Collect diagnostic information on why no route was found
    const blockingBarriers = effectiveBarriers.filter((b) => b.hardBlock);
    const failedConstraints = Array.from(
      new Set(rejectedEdges.map((r) => r.constraint))
    );

    return {
      found: false,
      originId,
      destinationId,
      profileId: profile.id,
      nodes: [],
      edges: [],
      totalDistanceM: 0,
      totalDurationSec: 0,
      totalCost: 0,
      costBreakdown: {
        timeCost: 0,
        slopeCost: 0,
        lightCost: 0,
        sensoryCost: 0,
        heatCost: 0,
        restCost: 0,
        barrierPenalty: 0,
      },
      activeConstraints,
      fastestBaseline,
      rejectedEdges,
      explanation: generateNoRouteExplanation(
        originId,
        destinationId,
        profile,
        failedConstraints,
        blockingBarriers
      ),
      warnings: ["No path satisfies all active hard constraints."],
      noRouteDiagnostic: {
        reason: "Graph network disconnected under active hard constraints.",
        blockingEdges: rejectedEdges.map((r) => r.edgeId),
        blockingBarriers,
        failedConstraints,
        suggestedAction:
          "Inspect active barrier overrides or relax slope/step constraints to view alternative path availability.",
      },
    };
  }

  // Sum up exact cost breakdown for chosen path
  const breakdown: CostBreakdown = {
    timeCost: 0,
    slopeCost: 0,
    lightCost: 0,
    sensoryCost: 0,
    heatCost: 0,
    restCost: 0,
    barrierPenalty: 0,
  };

  for (const edge of targetState.edges) {
    const { breakdown: edgeBreakdown } = calculateEdgeCost(
      edge,
      profile,
      effectiveBarriers
    );
    breakdown.timeCost += edgeBreakdown.timeCost;
    breakdown.slopeCost += edgeBreakdown.slopeCost;
    breakdown.lightCost += edgeBreakdown.lightCost;
    breakdown.sensoryCost += edgeBreakdown.sensoryCost;
    breakdown.heatCost += edgeBreakdown.heatCost;
    breakdown.restCost += edgeBreakdown.restCost;
    breakdown.barrierPenalty += edgeBreakdown.barrierPenalty;
  }

  const resultNodes = targetState.nodes.map((id) => nodeMap.get(id)!);

  const explanation = generateRouteExplanation(
    targetState,
    fastestBaseline,
    profile,
    rejectedEdges,
    effectiveBarriers
  );

  return {
    found: true,
    originId,
    destinationId,
    profileId: profile.id,
    nodes: resultNodes,
    edges: targetState.edges,
    totalDistanceM: targetState.totalDistanceM,
    totalDurationSec: targetState.totalDurationSec,
    totalCost: targetState.totalCost,
    costBreakdown: breakdown,
    activeConstraints,
    fastestBaseline,
    rejectedEdges,
    explanation,
    warnings: [],
  };
}

/**
 * Computes shortest unconstrained route by raw travel time (ignoring profile hard constraints).
 * Fully deterministic with tie-breaking on duration, distance, and pathKey.
 */
export function computeFastestBaseline(
  dataset: CampusDataset,
  originId: string,
  destinationId: string
): FastestRouteBaseline | undefined {
  const adj = new Map<string, Array<{ neighborId: string; edge: CampusEdge }>>();
  for (const node of dataset.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of dataset.edges) {
    adj.get(edge.from)?.push({ neighborId: edge.to, edge });
    if (edge.bidirectional) {
      adj.get(edge.to)?.push({ neighborId: edge.from, edge });
    }
  }

  const bestDuration = new Map<string, number>();
  const bestDistance = new Map<string, number>();
  const bestPathKey = new Map<string, string>();

  bestDuration.set(originId, 0);
  bestDistance.set(originId, 0);
  bestPathKey.set(originId, "");

  const queue: Array<{
    nodeId: string;
    duration: number;
    distance: number;
    edges: CampusEdge[];
    nodes: string[];
    pathKey: string;
  }> = [
    {
      nodeId: originId,
      duration: 0,
      distance: 0,
      edges: [],
      nodes: [originId],
      pathKey: "",
    },
  ];

  let targetState: {
    duration: number;
    distance: number;
    edges: CampusEdge[];
    nodes: string[];
    pathKey: string;
  } | null = null;

  while (queue.length > 0) {
    queue.sort((a, b) => {
      if (a.duration !== b.duration) return a.duration - b.duration;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.pathKey.localeCompare(b.pathKey);
    });
    const curr = queue.shift()!;

    if (curr.nodeId === destinationId) {
      targetState = curr;
      break;
    }

    const currBest = bestDuration.get(curr.nodeId);
    if (currBest !== undefined && curr.duration > currBest) {
      continue;
    }

    const neighbors = adj.get(curr.nodeId) || [];
    for (const { neighborId, edge } of neighbors) {
      if (curr.nodes.includes(neighborId)) continue;
      const nextDur = curr.duration + edge.durationSec;
      const nextDist = curr.distance + edge.distanceM;
      const nextEdges = [...curr.edges, edge];
      const nextKey = nextEdges.map((e) => e.id).join("->");

      const prevDur = bestDuration.get(neighborId);
      let isBetter = false;

      if (prevDur === undefined || nextDur < prevDur) {
        isBetter = true;
      } else if (nextDur === prevDur) {
        const prevDist = bestDistance.get(neighborId) || Infinity;
        if (nextDist < prevDist) {
          isBetter = true;
        } else if (nextDist === prevDist) {
          const prevKey = bestPathKey.get(neighborId) || "";
          if (nextKey.localeCompare(prevKey) < 0) {
            isBetter = true;
          }
        }
      }

      if (isBetter) {
        bestDuration.set(neighborId, nextDur);
        bestDistance.set(neighborId, nextDist);
        bestPathKey.set(neighborId, nextKey);
        queue.push({
          nodeId: neighborId,
          duration: nextDur,
          distance: nextDist,
          edges: nextEdges,
          nodes: [...curr.nodes, neighborId],
          pathKey: nextKey,
        });
      }
    }
  }

  if (!targetState) return undefined;

  const hasStairs = targetState.edges.some((e) => e.mode === "stairs");
  const hasLift = targetState.edges.some((e) => e.mode === "lift");

  return {
    nodeIds: targetState.nodes,
    edgeIds: targetState.edges.map((e) => e.id),
    distanceM: targetState.distance,
    durationSec: targetState.duration,
    containsStairs: hasStairs,
    containsElevator: hasLift,
  };
}

function generateRouteExplanation(
  route: PathState,
  fastest: FastestRouteBaseline | undefined,
  profile: RouteProfile,
  rejectedEdges: RejectedEdgeProof[],
  activeBarriers: Barrier[]
): string {
  if (!fastest) {
    return `Selected route spans ${route.totalDistanceM}m with an estimated duration of ${Math.round(
      route.totalDurationSec / 60
    )} min.`;
  }

  const durationDiffSec = route.totalDurationSec - fastest.durationSec;
  const minutesAdded = Math.round(durationDiffSec / 60);

  // If identical to fastest route
  if (route.totalDurationSec === fastest.durationSec) {
    return `Selected route matches the fastest baseline (${route.totalDistanceM}m, ${Math.round(
      route.totalDurationSec / 60
    )} min) and satisfies all active ${profile.name} constraints.`;
  }

  // Look for key rejected features (stairs or lift outage)
  const rejectedStairs = rejectedEdges.find((r) => r.constraint === "no_stairs");
  const rejectedLift = rejectedEdges.find(
    (r) => r.constraint === "require_working_lift" || r.constraint === "hard_barrier"
  );

  let rationale = "";
  if (profile.noStairs && fastest.containsStairs && rejectedStairs) {
    rationale = `The ${fastest.distanceM}m unconstrained shortest route contains stairs (${rejectedStairs.edgeId}) and was rejected by the Step-free policy. `;
  } else if (activeBarriers.length > 0 && rejectedLift) {
    rationale = `A direct route via the elevator was rejected due to an active outage. `;
  }

  if (minutesAdded > 0) {
    rationale += `This route adds ${minutesAdded} min (${route.totalDistanceM}m total) using accessible paths.`;
  } else {
    rationale += `Route adjusted to comply with ${profile.name} preferences (${route.totalDistanceM}m).`;
  }

  return rationale;
}

function generateNoRouteExplanation(
  originId: string,
  destinationId: string,
  profile: RouteProfile,
  failedConstraints: string[],
  blockingBarriers: Barrier[]
): string {
  const parts: string[] = [];
  parts.push(
    `No viable route could be found connecting '${originId}' to '${destinationId}' under the ${profile.name} profile.`
  );

  if (failedConstraints.length > 0) {
    parts.push(`Active constraints violated along all connecting edges: ${failedConstraints.join(", ")}.`);
  }

  if (blockingBarriers.length > 0) {
    parts.push(
      `Active impassable barriers: ${blockingBarriers
        .map((b) => `${b.kind} on ${b.edgeId}`)
        .join("; ")}.`
    );
  }

  return parts.join(" ");
}
