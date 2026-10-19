export type NodeKind = "entrance" | "junction" | "room" | "lift" | "rest" | "water";

export interface CampusNode {
  id: string;
  label: string;
  kind: NodeKind;
  building: string;
  floor: number;
  x: number;
  y: number;
  landmark?: string;
}

export type EdgeMode = "corridor" | "outdoor" | "ramp" | "stairs" | "lift";
export type SurfaceQuality = "smooth" | "paved" | "gravel" | "uneven";

export interface CampusEdge {
  id: string;
  from: string;
  to: string;
  bidirectional: boolean;
  distanceM: number;
  durationSec: number;
  mode: EdgeMode;
  slopePct?: number; // Incline percentage (e.g., 0, 4, 8, 14)
  widthCm?: number;  // Usable clear width in centimeters (e.g., 85, 120, 180)
  surface: SurfaceQuality;
  lighting: 0 | 1 | 2;     // 0=poor, 1=adequate, 2=bright/daylight
  sensoryLoad: 0 | 1 | 2;  // 0=quiet/calm, 1=moderate, 2=loud/crowded
  shade: 0 | 1 | 2;        // 0=exposed sun, 1=partial shade, 2=covered/indoor
  tactileGuidance: boolean;
  hasRestNearby: boolean;
}

export interface RouteProfileWeights {
  time: number;
  slope: number;
  lowLight: number;
  sensoryLoad: number;
  exposedHeat: number;
  distanceFromRest: number;
}

export interface RouteProfile {
  id: string;
  name: string;
  description: string;
  noStairs: boolean;
  requireWorkingLift: boolean;
  maxSlopePct?: number;
  minWidthCm?: number;
  excludeUnevenSurface: boolean;
  weights: RouteProfileWeights;
  isCustom?: boolean;
}

export type BarrierKind = "closed" | "lift_outage" | "obstruction" | "crowding" | "poor_light";

export interface Barrier {
  id: string;
  edgeId: string;
  kind: BarrierKind;
  hardBlock: boolean;
  severity: 1 | 2 | 3; // 1=minor delay, 2=moderate impediment, 3=severe/impassable
  note: string;
  startsAt: string;
  expiresAt?: string;
  demoOnly: true;
}

export interface CostBreakdown {
  timeCost: number;
  slopeCost: number;
  lightCost: number;
  sensoryCost: number;
  heatCost: number;
  restCost: number;
  barrierPenalty: number;
}

export interface RejectedEdgeProof {
  edgeId: string;
  from: string;
  to: string;
  reason: string;
  constraint: string;
}

export interface FastestRouteBaseline {
  nodeIds: string[];
  edgeIds: string[];
  distanceM: number;
  durationSec: number;
  containsStairs: boolean;
  containsElevator: boolean;
}

export interface NoRouteDiagnostic {
  reason: string;
  blockingEdges: string[];
  blockingBarriers: Barrier[];
  failedConstraints: string[];
  suggestedAction: string;
}

export interface RouteResult {
  found: boolean;
  originId: string;
  destinationId: string;
  profileId: string;
  nodes: CampusNode[];
  edges: CampusEdge[];
  totalDistanceM: number;
  totalDurationSec: number;
  totalCost: number;
  costBreakdown: CostBreakdown;
  activeConstraints: string[];
  fastestBaseline?: FastestRouteBaseline;
  rejectedEdges: RejectedEdgeProof[];
  explanation: string;
  warnings: string[];
  noRouteDiagnostic?: NoRouteDiagnostic;
}

export interface CampusDataset {
  id: string;
  name: string;
  version: string;
  isSyntheticDemo: true;
  attribution: string;
  nodes: CampusNode[];
  edges: CampusEdge[];
  defaultBarriers: Barrier[];
}

export interface ScenarioTest {
  id: string;
  name: string;
  originId: string;
  destinationId: string;
  profileId: string;
  description: string;
}

export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  profileId: string;
  connected: boolean;
  durationSec: number;
  fastestSec: number;
  accessPenalty: number; // durationSec / fastestSec (1.0 = equal, >1.0 = detour penalty)
}

export interface RepairCandidate {
  barrierId: string;
  barrierKind: BarrierKind;
  edgeId: string;
  note: string;
  severity: 1 | 2 | 3;
  restoredScenariosCount: number;
  minutesRecovered: number;
  profilesHelpedCount: number;
  rank: number;
}

export interface AccessDebtReport {
  timestamp: string;
  totalScenariosEvaluated: number;
  disconnectedScenariosCount: number;
  averageAccessPenalty: number;
  activeBarriersCount: number;
  repairCandidates: RepairCandidate[];
  scenarioResults: ScenarioResult[];
}
