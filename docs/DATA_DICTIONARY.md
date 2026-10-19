# AccessGraph — Data Dictionary & Entity Specifications

> **Domain Entity & Schema Reference**  
> **Repository:** `accessgraph`  
> **Source Definitions:** `src/domain/types.ts`

---

## 1. Campus Graph Entities

### 1.1 `CampusNode`
Represents an accessible waypoint, building entrance, room, lift landing, or transition junction on campus.

| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Unique identifier formatted as `node_{code}` | `"node_lib_entrance"` |
| `label` | `string` | Human-readable civic signpost name | `"Library Entrance"` |
| `kind` | `NodeKind` | Categorical classification: `entrance`, `junction`, `room`, `lift`, `rest`, `water` | `"entrance"` |
| `building` | `string` | Campus facility or zone name | `"University Library"` |
| `floor` | `number` | Vertical floor index (0 = Ground, 1 = First Floor, etc.) | `0` |
| `x` | `number` | Schematic SVG X coordinate (0 to 1000 grid) | `320` |
| `y` | `number` | Schematic SVG Y coordinate (0 to 700 grid) | `260` |
| `landmark` | `string?` | Optional visual or tactile description | `"Automatic Sliding Door"` |

### 1.2 `CampusEdge`
Represents a navigable path segment connecting two adjacent nodes.

| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Unique edge identifier formatted as `edge_{from}_{to}` | `"edge_sci_lift_shaft"` |
| `from` | `string` | Origin `CampusNode.id` | `"node_sci_lift_g"` |
| `to` | `string` | Destination `CampusNode.id` | `"node_sci_lift_f2"` |
| `bidirectional` | `boolean` | Whether travel is permitted in both directions | `true` |
| `distanceM` | `number` | Physical segment length in meters | `10` |
| `durationSec` | `number` | Baseline transit time in seconds | `25` |
| `mode` | `EdgeMode` | Pathway modality: `corridor`, `outdoor`, `ramp`, `stairs`, `lift` | `"lift"` |
| `slopePct` | `number?` | Path incline gradient percentage (e.g., 4.5 = 4.5% grade) | `0.0` |
| `widthCm` | `number?` | Usable unobstructed width in centimeters | `150` |
| `surface` | `SurfaceQuality`| Texture: `smooth`, `paved`, `gravel`, `uneven` | `"smooth"` |
| `lighting` | `0 \| 1 \| 2` | Ambient luminance: `0` (dim), `1` (moderate), `2` (bright) | `2` |
| `sensoryLoad`| `0 \| 1 \| 2` | Auditory/crowding intensity: `0` (quiet), `1` (moderate), `2` (loud) | `0` |
| `shade` | `0 \| 1 \| 2` | Weather protection: `0` (exposed sun), `1` (partial), `2` (covered/indoor) | `2` |
| `tactileGuidance`| `boolean`| Whether tactile paving tiles or handrails are present | `true` |
| `hasRestNearby` | `boolean` | Proximity to rest benches or seating (<20m) | `true` |

---

## 2. Accessibility Profiles

### 2.1 `RouteProfile`
Configures hard constraints and soft cost weights tailored to specific user mobility needs.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (`fastest`, `step_free`, `low_vision`, `low_sensory`, `shade_rest`) |
| `name` | `string` | Display name of the profile preset |
| `description` | `string` | Summary of optimization criteria and hard constraints |
| `noStairs` | `boolean` | If `true`, all edges with `mode === "stairs"` are strictly rejected |
| `requireWorkingLift`| `boolean`| If `true`, elevators with active outage incidents are impassable |
| `maxSlopePct` | `number?` | Absolute gradient threshold; steeper paths are rejected |
| `minWidthCm` | `number?` | Minimum required clearance; narrower paths are rejected |
| `excludeUnevenSurface`| `boolean`| If `true`, gravel and uneven ground are strictly prohibited |
| `weights` | `RouteProfileWeights`| Multi-objective soft penalty weights |

### 2.2 `RouteProfileWeights`
Multipliers applied to normalized pathway attributes:
- `time`: Weight on base walking duration ($1.0\times$ default).
- `slope`: Incline fatigue penalty.
- `lowLight`: Penalty for dimly lit segments.
- `sensoryLoad`: Penalty for loud, echoing, or crowded hallways.
- `exposedHeat`: Penalty for unshaded direct sun exposure.
- `distanceFromRest`: Penalty for long stretches without seating.

---

## 3. Incident Barriers

### 3.1 `Barrier`
Represents a temporary physical disruption, facility maintenance event, or environmental impediment.

| Property | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Unique identifier formatted as `barrier_{name}` | `"barrier_lift_outage"` |
| `edgeId` | `string` | Affected `CampusEdge.id` | `"edge_sci_lift_shaft"` |
| `kind` | `BarrierKind` | Category: `lift_outage`, `closed`, `obstruction`, `crowding`, `poor_light` | `"lift_outage"` |
| `hardBlock` | `boolean` | If `true`, edge is impassable. If `false`, edge applies soft cost penalty | `true` |
| `severity` | `1 \| 2 \| 3` | Severity rating: `1` (minor delay), `2` (moderate), `3` (severe impasse) | `3` |
| `note` | `string` | Contextual explanation of the incident | `"Traction motor overhaul"` |
| `startsAt` | `string` | ISO 8601 timestamp of incident initiation | `"2026-10-19T08:00:00Z"` |
| `demoOnly` | `true` | Explicit label verifying this is a synthetic demonstration fixture | `true` |

---

## 4. Diagnostics & Reporting

### 4.1 `AccessDebtReport`
Aggregate audit result generated by evaluating campus benchmark scenarios.

| Property | Type | Description |
| :--- | :--- | :--- |
| `timestamp` | `string` | Evaluation ISO timestamp |
| `totalScenariosEvaluated` | `number` | Count of benchmark campus routes tested |
| `disconnectedScenariosCount`| `number` | Number of trips currently blocked by active barriers |
| `averageAccessPenalty` | `number` | Mean ratio of accessible duration vs unconstrained baseline |
| `activeBarriersCount` | `number` | Total number of active disruptions currently reported |
| `repairCandidates` | `RepairCandidate[]` | Prioritized maintenance intervention ranking |
| `scenarioResults` | `ScenarioResult[]` | Detailed status of each evaluated benchmark scenario |

### 4.2 `RepairCandidate`
Calculated ROI for addressing a specific facility barrier.

| Property | Type | Description |
| :--- | :--- | :--- |
| `rank` | `number` | Priority order (`1` = highest immediate impact) |
| `barrierId` | `string` | Target barrier ID |
| `barrierKind` | `BarrierKind` | Infrastructure category of the disruption |
| `edgeId` | `string` | Targeted campus path segment |
| `restoredScenariosCount` | `number` | Previously impassable trips that become feasible once fixed |
| `minutesRecovered` | `number` | Cumulative transit minutes returned to campus travelers |
| `profilesHelpedCount` | `number` | Distinct user mobility profiles that benefit from the fix |
