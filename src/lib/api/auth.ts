import { apiFetch } from "./client";
import type { CurrentUser, LoginResponse } from "./types";

export function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
      // Deliberately short-lived per the brief, so token expiry is
      // exercisable during testing rather than a 30-minute wait.
      expiresInMins: 1,
    }),
  });
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>("/auth/me");
}
