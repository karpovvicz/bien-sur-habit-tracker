import { type TrackerState } from "./types";

const STORAGE_KEY = "bien-sur-state";

const DEFAULT_STATE: TrackerState = {
  records: {},
  commitment: "my daily commitment",
};

function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const test = "__storage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getTrackerState(): TrackerState {
  if (!isStorageAvailable()) return DEFAULT_STATE;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;

    const parsed = JSON.parse(stored) as TrackerState;
    return parsed;
  } catch {
    return DEFAULT_STATE;
  }
}

export function setTrackerState(state: TrackerState): void {
  if (!isStorageAvailable()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silent fail
  }
}