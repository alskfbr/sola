import type { Trip } from "../../types";
import { AuthError } from "../authService";
import { NotFoundError, type TripService } from "../tripService";
import { delay } from "./delay";
import { readStoredSession } from "./mockAuthService";
import { MOCK_TRIPS } from "./mockData";

// In-memory store; resets on page reload.
let trips: Trip[] = structuredClone(MOCK_TRIPS);

function requireUserId(): string {
  const session = readStoredSession();
  if (!session) throw new AuthError("Not authenticated.");
  return session.user.id;
}

function findOwned(id: string, ownerId: string): Trip {
  const trip = trips.find((t) => t.id === id && t.ownerId === ownerId);
  if (!trip) throw new NotFoundError(`Trip ${id} not found.`);
  return trip;
}

export const mockTripService: TripService = {
  async listTrips() {
    await delay();
    const ownerId = requireUserId();
    return structuredClone(trips.filter((t) => t.ownerId === ownerId));
  },

  async getTrip(id) {
    await delay();
    const ownerId = requireUserId();
    const trip = trips.find((t) => t.id === id && t.ownerId === ownerId);
    return trip ? structuredClone(trip) : null;
  },

  async createTrip(input) {
    await delay();
    const now = new Date().toISOString();
    const trip: Trip = {
      id: `trip_${crypto.randomUUID()}`,
      ownerId: requireUserId(),
      days: [],
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    trips = [...trips, trip];
    return structuredClone(trip);
  },

  async updateTrip(id, input) {
    await delay();
    const existing = findOwned(id, requireUserId());
    const updated: Trip = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    trips = trips.map((t) => (t.id === id ? updated : t));
    return structuredClone(updated);
  },

  async deleteTrip(id) {
    await delay();
    findOwned(id, requireUserId());
    trips = trips.filter((t) => t.id !== id);
  },
};
