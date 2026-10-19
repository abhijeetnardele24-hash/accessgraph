import { Barrier } from "../domain/types";
import { DEMO_CAMPUS } from "../data/demoCampus";

const BARRIERS_STORAGE_KEY = "accessgraph_active_barriers_v1";
const PROFILE_STORAGE_KEY = "accessgraph_selected_profile_v1";

/**
 * Loads active barriers from local storage, falling back to synthetic demo defaults.
 */
export function loadStoredBarriers(): Barrier[] {
  try {
    const raw = localStorage.getItem(BARRIERS_STORAGE_KEY);
    if (!raw) return DEMO_CAMPUS.defaultBarriers;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return DEMO_CAMPUS.defaultBarriers;
  } catch {
    return DEMO_CAMPUS.defaultBarriers;
  }
}

/**
 * Persists active barriers locally (strictly private, zero cloud transmission).
 */
export function saveStoredBarriers(barriers: Barrier[]): void {
  try {
    localStorage.setItem(BARRIERS_STORAGE_KEY, JSON.stringify(barriers));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

/**
 * Loads stored profile preference.
 */
export function loadStoredProfileId(): string {
  try {
    return localStorage.getItem(PROFILE_STORAGE_KEY) || "fastest";
  } catch {
    return "fastest";
  }
}

/**
 * Saves stored profile preference.
 */
export function saveStoredProfileId(profileId: string): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, profileId);
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Resets local barriers back to canonical demo default.
 */
export function resetToDefaultBarriers(): Barrier[] {
  try {
    localStorage.removeItem(BARRIERS_STORAGE_KEY);
  } catch {
    // Ignore
  }
  return DEMO_CAMPUS.defaultBarriers;
}
