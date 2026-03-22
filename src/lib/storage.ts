import { type TrackerState, type DayRecord } from "./types";

const DEFAULT_STATE: TrackerState = {
  records: {},
  commitment: "my daily commitment",
};

// Fetch all records and settings from the database
export async function getTrackerState(): Promise<TrackerState> {
  try {
    const [recordsResponse, settingsResponse] = await Promise.all([
      fetch("/api/records"),
      fetch("/api/settings"),
    ]);

    if (!recordsResponse.ok || !settingsResponse.ok) {
      console.error("Failed to fetch tracker state");
      return DEFAULT_STATE;
    }

    const recordsData = await recordsResponse.json();
    const settingsData = await settingsResponse.json();

    return {
      records: recordsData.records || {},
      commitment: settingsData.commitment || "my daily commitment",
    };
  } catch (error) {
    console.error("Error fetching tracker state:", error);
    return DEFAULT_STATE;
  }
}

// Save a single day record to the database
export async function saveDayRecord(record: DayRecord): Promise<void> {
  try {
    const response = await fetch("/api/records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      console.error("Failed to save day record");
    }
  } catch (error) {
    console.error("Error saving day record:", error);
  }
}

// Update the commitment setting
export async function saveCommitment(commitment: string): Promise<void> {
  try {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ commitment }),
    });

    if (!response.ok) {
      console.error("Failed to save commitment");
    }
  } catch (error) {
    console.error("Error saving commitment:", error);
  }
}