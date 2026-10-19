import { RouteProfile } from "./types";

export const ROUTE_PROFILES: Record<string, RouteProfile> = {
  fastest: {
    id: "fastest",
    name: "Fastest / Unconstrained",
    description: "Shortest travel duration regardless of stairs, surface texture, or slope.",
    noStairs: false,
    requireWorkingLift: false,
    excludeUnevenSurface: false,
    weights: {
      time: 1.0,
      slope: 0.1,
      lowLight: 0.05,
      sensoryLoad: 0.05,
      exposedHeat: 0.05,
      distanceFromRest: 0.0,
    },
  },

  step_free: {
    id: "step_free",
    name: "Step-free / Wheelchair",
    description: "Strictly excludes stairs, requires working lifts, limits slope to 6%, requires 90cm minimum width, and excludes uneven surfaces.",
    noStairs: true,
    requireWorkingLift: true,
    maxSlopePct: 6,
    minWidthCm: 90,
    excludeUnevenSurface: true,
    weights: {
      time: 0.8,
      slope: 1.5,
      lowLight: 0.2,
      sensoryLoad: 0.1,
      exposedHeat: 0.3,
      distanceFromRest: 0.2,
    },
  },

  low_vision: {
    id: "low_vision",
    name: "Low Vision / Tactile Wayfinding",
    description: "Prioritizes well-lit, covered paths with tactile ground guidance and predictable surfaces; penalizes dark underpasses.",
    noStairs: false,
    requireWorkingLift: false,
    excludeUnevenSurface: true,
    weights: {
      time: 0.6,
      slope: 0.4,
      lowLight: 2.0, // High penalty for poor illumination
      sensoryLoad: 0.2,
      exposedHeat: 0.2,
      distanceFromRest: 0.3,
    },
  },

  low_sensory: {
    id: "low_sensory",
    name: "Low Sensory Load / Quiet",
    description: "Avoids loud, crowded main thoroughfares and reverberant echo corridors in favor of tranquil pathways.",
    noStairs: false,
    requireWorkingLift: false,
    excludeUnevenSurface: false,
    weights: {
      time: 1.0,
      slope: 0.2,
      lowLight: 0.2,
      sensoryLoad: 1.0, // Significant penalty for noise while maintaining ground transit efficiency
      exposedHeat: 0.3,
      distanceFromRest: 0.2,
    },
  },

  shade_rest: {
    id: "shade_rest",
    name: "Shade & Frequent Rest",
    description: "Prefers covered indoor corridors, shaded tree-lined avenues, and routes with frequent bench seating.",
    noStairs: false,
    requireWorkingLift: false,
    maxSlopePct: 8,
    excludeUnevenSurface: false,
    weights: {
      time: 0.5,
      slope: 0.8,
      lowLight: 0.1,
      sensoryLoad: 0.2,
      exposedHeat: 1.8, // Heavy penalty for direct open-sun segments
      distanceFromRest: 1.6, // Heavy penalty for long stretches without rest points
    },
  },
};

export const DEFAULT_PROFILE_ID = "fastest";
