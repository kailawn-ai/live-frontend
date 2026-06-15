import {
  apiRequest,
  clearAuthToken,
  getCachedAuthUser,
  hasAuthToken,
  setAuthToken,
  setCachedAuthUser,
} from "../lib/api-client";

export type AuthUser = {
  id: number;
  email: string;
  role: "user" | "admin";
  status: "allowed" | "blocked";
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function login(email: string, password: string) {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });

  setAuthToken(response.token);
  setCachedAuthUser(response.user);
  return response.user;
}

export async function getCurrentUser() {
  const response = await apiRequest<{ user: AuthUser }>("/auth/me");
  setCachedAuthUser(response.user);
  return response.user;
}

export function getCachedCurrentUser() {
  return getCachedAuthUser<AuthUser>();
}

export function isLoggedInBrowser() {
  return hasAuthToken();
}

export function logout() {
  clearAuthToken();
}
