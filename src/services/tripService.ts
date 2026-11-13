import type { CreateTripInput, Trip, UpdateTripInput } from "../types";

/** All methods operate on the currently authenticated user's trips. */
export interface TripService {
  listTrips(): Promise<Trip[]>;
  getTrip(id: string): Promise<Trip | null>;
  createTrip(input: CreateTripInput): Promise<Trip>;
  updateTrip(id: string, input: UpdateTripInput): Promise<Trip>;
  deleteTrip(id: string): Promise<void>;
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
