import { Barrier, RouteProfile } from "../domain/types";
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

const CUSTOM_PROFILE_STORAGE_KEY = "accessgraph_custom_profile_v1";

/**
 * Loads stored custom profile, or null if none saved.
 */
export function loadStoredCustomProfile(): RouteProfile | null {
  try {
    const raw = localStorage.getItem(CUSTOM_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.id === "custom") {
      return parsed as RouteProfile;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves custom profile locally.
 */
export function saveStoredCustomProfile(profile: RouteProfile): void {
  try {
    localStorage.setItem(CUSTOM_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Clears custom profile from local storage.
 */
export function clearStoredCustomProfile(): void {
  try {
    localStorage.removeItem(CUSTOM_PROFILE_STORAGE_KEY);
  } catch {
    // Ignore
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
