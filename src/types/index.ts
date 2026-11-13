// ---------- Auth ----------

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  /** ISO 8601 timestamp */
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ---------- Trips ----------

/** Derived from dates; never stored. `draft` = start/end date not set. */
export type TripStatus = "draft" | "upcoming" | "ongoing" | "completed";

/** One place a trip visits. A trip may span several countries. */
export interface TripDestination {
  /** ISO 3166-1 alpha-3, e.g. "LKA" */
  countryCode: string;
  countryName: string;
  /** ISO 3166-2, e.g. "LK-2". Optional when only the country is known. */
  regionCode?: string;
  regionName?: string;
}

export type ItineraryCategory =
  | "sightseeing"
  | "food"
  | "transport"
  | "lodging"
  | "activity"
  | "note";

export interface ItineraryItem {
  id: string;
  /** "HH:mm" local time */
  time?: string;
  title: string;
  description?: string;
  category: ItineraryCategory;
}

export interface ItineraryDay {
  /** 1-based; the calendar date is derived from trip.startDate */
  dayNumber: number;
  title?: string;
  /** ISO 3166-2 code of where the day is spent */
  regionCode?: string;
  items: ItineraryItem[];
}

export interface Trip {
  id: string;
  ownerId: string;
  /** Optional; UI falls back to the destination province/state names */
  title?: string;
  /** "YYYY-MM-DD" */
  startDate?: string;
  /** "YYYY-MM-DD" (inclusive) */
  endDate?: string;
  destinations: TripDestination[];
  days: ItineraryDay[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTripInput = Pick<
  Trip,
  "title" | "startDate" | "endDate" | "destinations"
> & {
  days?: ItineraryDay[];
  notes?: string;
};

export type UpdateTripInput = Partial<CreateTripInput>;
