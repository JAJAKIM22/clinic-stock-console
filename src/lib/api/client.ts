import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth";
import type { LoginResponse } from "./types";

const BASE_URL = "https://dummyjson.com";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data: LoginResponse = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

// Central fetcher: attaches the bearer token, and on a 401 makes one silent
// attempt to refresh and retry before giving up. This is what lets a user's
// short-lived token (expiresInMins: 1) expire mid-session without losing
// their place or hitting a blank screen — see decision log.
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const accessToken = getAccessToken();

  const doFetch = (token: string | null) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed`, res.status);
  }

  return res.json() as Promise<T>;
}

export { ApiError };
