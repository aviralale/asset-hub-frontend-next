import { TokenResponse } from "./types";

const TOKEN_KEY = "auth_token";
const REFRESH_KEY = "refresh_token";

export function getAccessToken(): string | null {
  // In production, use httpOnly cookies via server middleware
  // For now, store in memory with localStorage fallback
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: TokenResponse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
