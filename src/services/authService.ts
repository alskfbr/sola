import type { AuthSession, LoginCredentials } from "../types";

export interface AuthService {
  /** Throws `AuthError` on invalid credentials. */
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  /** Returns the persisted session, or null if absent/expired. */
  getSession(): Promise<AuthSession | null>;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
