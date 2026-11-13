import type { AuthSession } from "../../types";
import { AuthError, type AuthService } from "../authService";
import { delay } from "./delay";
import { MOCK_ACCOUNTS } from "./mockData";

const STORAGE_KEY = "drift.session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function readStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export const mockAuthService: AuthService = {
  async login({ email, password }) {
    await delay(500);
    const account = MOCK_ACCOUNTS.find(
      (a) => a.user.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!account || account.password !== password) {
      throw new AuthError("Invalid email or password.");
    }
    const session: AuthSession = {
      token: `mock-${crypto.randomUUID()}`,
      user: account.user,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  async logout() {
    await delay(100);
    localStorage.removeItem(STORAGE_KEY);
  },

  async getSession() {
    await delay(100);
    return readStoredSession();
  },
};
