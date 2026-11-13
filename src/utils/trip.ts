import type { Trip, TripStatus } from "../types";

const DAY_MS = 86_400_000;

/** Parses "YYYY-MM-DD" as a local date (avoids UTC shift). */
export function parseDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(a: Date, b: Date): number {
  return Math.round(
    (startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS,
  );
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function getTripStatus(trip: Trip, today = new Date()): TripStatus {
  if (!trip.startDate || !trip.endDate) return "draft";
  if (diffDays(parseDate(trip.startDate), today) > 0) return "upcoming";
  if (diffDays(today, parseDate(trip.endDate)) > 0) return "completed";
  return "ongoing";
}

/** Explicit title, else province/state names, else country names. */
export function getTripTitle(trip: Trip): string {
  const title = trip.title?.trim();
  if (title) return title;
  const regions = unique(
    trip.destinations.flatMap((d) => (d.regionName ? [d.regionName] : [])),
  );
  const names = regions.length
    ? regions
    : unique(trip.destinations.map((d) => d.countryName));
  if (names.length === 0) return "Untitled trip";
  if (names.length <= 2) return names.join(" & ");
  return `${names[0]}, ${names[1]} +${names.length - 2} more`;
}

export function getTripCountries(trip: Trip): string[] {
  return unique(trip.destinations.map((d) => d.countryName));
}

export function getTripDurationDays(trip: Trip): number {
  if (trip.startDate && trip.endDate) {
    return diffDays(parseDate(trip.endDate), parseDate(trip.startDate)) + 1;
  }
  return trip.days.length;
}

export function formatDateRange(trip: Trip): string | null {
  if (!trip.startDate || !trip.endDate) return null;
  const fmt = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return fmt.formatRange(parseDate(trip.startDate), parseDate(trip.endDate));
}

export function formatDayDate(trip: Trip, dayNumber: number): string | null {
  if (!trip.startDate) return null;
  const date = parseDate(trip.startDate);
  date.setDate(date.getDate() + dayNumber - 1);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatRelativeDays(days: number): string {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const abs = Math.abs(days);
  if (abs < 14) return rtf.format(days, "day");
  if (abs < 60) return rtf.format(Math.round(days / 7), "week");
  if (abs < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
}

/** Human-readable timing relative to today, e.g. "Starts in 3 weeks", "Ended 8 months ago". */
export function getRelativeDateLabel(trip: Trip, today = new Date()): string {
  const status = getTripStatus(trip, today);
  if (status === "draft" || !trip.startDate || !trip.endDate)
    return "Dates not set";
  const start = parseDate(trip.startDate);
  const end = parseDate(trip.endDate);
  switch (status) {
    case "upcoming":
      return `Starts ${formatRelativeDays(diffDays(start, today))}`;
    case "ongoing":
      return `Day ${diffDays(today, start) + 1} of ${getTripDurationDays(trip)}`;
    case "completed":
      return `Ended ${formatRelativeDays(diffDays(end, today))}`;
  }
}

const STATUS_ORDER: Record<TripStatus, number> = {
  ongoing: 0,
  upcoming: 1,
  draft: 2,
  completed: 3,
};

/** Ongoing → upcoming (soonest first) → drafts → completed (most recent first). */
export function sortTrips(trips: Trip[], today = new Date()): Trip[] {
  return [...trips].sort((a, b) => {
    const sa = getTripStatus(a, today);
    const sb = getTripStatus(b, today);
    if (sa !== sb) return STATUS_ORDER[sa] - STATUS_ORDER[sb];
    const da = a.startDate ?? a.updatedAt;
    const db = b.startDate ?? b.updatedAt;
    return sa === "completed" ? db.localeCompare(da) : da.localeCompare(db);
  });
}

export type HighlightStatus = "visited" | "planned";

/**
 * Map of country (ISO3) and region (ISO 3166-2) codes to highlight status.
 * "visited" (a completed trip) wins over "planned".
 */
export function getHighlightMap(
  trips: Trip[],
  today = new Date(),
): Map<string, HighlightStatus> {
  const map = new Map<string, HighlightStatus>();
  for (const trip of trips) {
    const status: HighlightStatus =
      getTripStatus(trip, today) === "completed" ? "visited" : "planned";
    for (const d of trip.destinations) {
      for (const code of [d.countryCode, d.regionCode]) {
        if (code && map.get(code) !== "visited") map.set(code, status);
      }
    }
  }
  return map;
}

export function tripMatchesPlace(
  trip: Trip,
  level: "country" | "region",
  code: string,
): boolean {
  return trip.destinations.some(
    (d) => (level === "country" ? d.countryCode : d.regionCode) === code,
  );
}
