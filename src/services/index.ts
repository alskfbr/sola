import type { AuthService } from "./authService";
import type { TripService } from "./tripService";
import { mockAuthService } from "./mock/mockAuthService";
import { mockTripService } from "./mock/mockTripService";

// Single switch point: replace the mock implementations with HTTP ones when the backend exists.
export const authService: AuthService = mockAuthService;
export const tripService: TripService = mockTripService;

export { AuthError } from "./authService";
export { NotFoundError } from "./tripService";
export type { AuthService, TripService };
