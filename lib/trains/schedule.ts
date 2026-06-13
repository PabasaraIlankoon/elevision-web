export type RiskLevel = "very_high" | "high" | "medium";

export interface StationStop {
  station: string;
  arrival: string; // "HH:mm" 24h
  departure: string; // "HH:mm" 24h
}

export interface TrainSchedule {
  trainNumber: string;
  trainName: string;
  direction: string;
  riskLevel: RiskLevel;
  stops: StationStop[];
}

// Risk colors matching the Flutter app's riskColor getter
export const RISK_COLORS: Record<RiskLevel, string> = {
  very_high: "#DC2626", // red
  high: "#FF8C00", // orange
  medium: "#FACC15", // yellow
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  very_high: "Very High",
  high: "High",
  medium: "Medium",
};

/**
 * High-risk train schedule for the elephant corridor, ported from the
 * IDP README's documented schedule (lib/models/train_model.dart in the
 * Flutter app).
 */
export const TRAIN_SCHEDULES: TrainSchedule[] = [
  {
    trainNumber: "6076",
    trainName: "Pulathisi",
    direction: "Batticaloa → Colombo",
    riskLevel: "very_high",
    stops: [
      { station: "Welikanda", arrival: "03:01", departure: "03:02" },
      { station: "Manampitiya", arrival: "03:31", departure: "03:32" },
      { station: "Polonnaruwa", arrival: "03:46", departure: "03:47" },
      { station: "Hingurakgoda", arrival: "04:00", departure: "04:01" },
      { station: "Minneriya", arrival: "04:15", departure: "04:16" },
      { station: "Gal Oya Junction", arrival: "04:35", departure: "04:37" },
      { station: "Habarana", arrival: "04:55", departure: "04:57" },
      { station: "Palugaswewa", arrival: "05:10", departure: "05:11" },
    ],
  },
  {
    trainNumber: "6080",
    trainName: "Meenagaya",
    direction: "Batticaloa → Colombo",
    riskLevel: "very_high",
    stops: [
      { station: "Welikanda", arrival: "21:44", departure: "21:45" },
      { station: "Manampitiya", arrival: "22:14", departure: "22:15" },
      { station: "Polonnaruwa", arrival: "22:29", departure: "22:30" },
      { station: "Hingurakgoda", arrival: "22:45", departure: "22:46" },
      { station: "Minneriya", arrival: "23:00", departure: "23:01" },
      { station: "Gal Oya Junction", arrival: "23:20", departure: "23:22" },
      { station: "Habarana", arrival: "23:40", departure: "23:42" },
      { station: "Palugaswewa", arrival: "23:55", departure: "23:56" },
    ],
  },
  {
    trainNumber: "6075",
    trainName: "Pulathisi",
    direction: "Colombo → Batticaloa",
    riskLevel: "high",
    stops: [
      // Does not stop at Palugaswewa; placeholder corridor stops can be
      // extended here if more granular data becomes available.
      { station: "Habarana", arrival: "18:10", departure: "18:12" },
      { station: "Minneriya", arrival: "18:30", departure: "18:31" },
      { station: "Hingurakgoda", arrival: "18:45", departure: "18:46" },
      { station: "Polonnaruwa", arrival: "19:00", departure: "19:01" },
    ],
  },
  {
    trainNumber: "6011",
    trainName: "Udaya Devi",
    direction: "Colombo → Batticaloa",
    riskLevel: "medium",
    stops: [
      { station: "Habarana", arrival: "10:30", departure: "10:32" },
      { station: "Minneriya", arrival: "10:50", departure: "10:51" },
      { station: "Hingurakgoda", arrival: "11:05", departure: "11:06" },
      { station: "Polonnaruwa", arrival: "11:20", departure: "11:21" },
    ],
  },
  {
    trainNumber: "6012",
    trainName: "Udaya Devi",
    direction: "Batticaloa → Colombo",
    riskLevel: "medium",
    stops: [
      { station: "Polonnaruwa", arrival: "14:10", departure: "14:11" },
      { station: "Hingurakgoda", arrival: "14:26", departure: "14:27" },
      { station: "Minneriya", arrival: "14:40", departure: "14:41" },
      { station: "Habarana", arrival: "15:00", departure: "15:02" },
    ],
  },
];

export interface ApproachingTrain {
  train: TrainSchedule;
  station: string;
  minutesAway: number; // negative = passed
}

/**
 * Normalize an alert's locationName (e.g. "Palugaswewa Railway Section")
 * to a bare station name for matching against the schedule (e.g.
 * "Palugaswewa"). Mirrors the loose matching used in the Flutter app.
 */
function normalizeLocation(locationName: string): string {
  return locationName
    .replace(/railway section/i, "")
    .replace(/junction/i, "Junction")
    .trim()
    .toLowerCase();
}

function stationMatches(stationName: string, locationName: string): boolean {
  const a = normalizeLocation(stationName);
  const b = normalizeLocation(locationName);
  return a === b || b.includes(a) || a.includes(b);
}

/**
 * Given a station's scheduled time ("HH:mm") and "now", compute minutes
 * away (can be negative if already passed today). Handles trains whose
 * schedule crosses midnight by checking both today and tomorrow/yesterday.
 */
function minutesAwayFromNow(timeStr: string, now: Date): number {
  const [h, m] = timeStr.split(":").map(Number);

  const candidate = new Date(now);
  candidate.setHours(h, m, 0, 0);

  let diffMin = Math.round((candidate.getTime() - now.getTime()) / 60000);

  // If the scheduled time is more than 12h in the past, it's more likely
  // "tomorrow" (relevant for late-night services); if more than 12h in
  // the future, it's more likely "yesterday" already passed.
  if (diffMin < -12 * 60) diffMin += 24 * 60;
  else if (diffMin > 12 * 60) diffMin -= 24 * 60;

  return diffMin;
}

/**
 * Find trains scheduled to pass through (or near) the given location
 * within `windowMinutes` of now (in either direction — approaching or
 * recently passed). Mirrors TrainData.getApproachingTrains in the
 * Flutter app.
 */
export function getApproachingTrains(
  locationName: string | null | undefined,
  windowMinutes = 60,
  now: Date = new Date(),
): ApproachingTrain[] {
  if (!locationName) return [];

  const results: ApproachingTrain[] = [];

  for (const train of TRAIN_SCHEDULES) {
    for (const stop of train.stops) {
      if (!stationMatches(stop.station, locationName)) continue;

      const minutesAway = minutesAwayFromNow(stop.arrival, now);
      if (Math.abs(minutesAway) <= windowMinutes) {
        results.push({ train, station: stop.station, minutesAway });
      }
    }
  }

  // Soonest arrivals first; passed trains sort after upcoming ones
  results.sort((a, b) => {
    const aPassed = a.minutesAway < 0;
    const bPassed = b.minutesAway < 0;
    if (aPassed !== bPassed) return aPassed ? 1 : -1;
    return a.minutesAway - b.minutesAway;
  });

  return results;
}

/**
 * Get all high-risk trains scheduled at a given location, regardless of
 * time window (used for showing the full day's risk schedule for a
 * location). Mirrors TrainData.getHighRiskTrainsAtLocation.
 */
export function getHighRiskTrainsAtLocation(
  locationName: string | null | undefined,
  now: Date = new Date(),
): ApproachingTrain[] {
  if (!locationName) return [];

  const results: ApproachingTrain[] = [];

  for (const train of TRAIN_SCHEDULES) {
    if (train.riskLevel === "medium") continue;
    for (const stop of train.stops) {
      if (!stationMatches(stop.station, locationName)) continue;
      const minutesAway = minutesAwayFromNow(stop.arrival, now);
      results.push({ train, station: stop.station, minutesAway });
    }
  }

  results.sort((a, b) => Math.abs(a.minutesAway) - Math.abs(b.minutesAway));
  return results;
}

/** All unique station names across the schedule, for the Train Schedule page. */
export function getAllStations(): string[] {
  const set = new Set<string>();
  for (const train of TRAIN_SCHEDULES) {
    for (const stop of train.stops) set.add(stop.station);
  }
  return Array.from(set).sort();
}
