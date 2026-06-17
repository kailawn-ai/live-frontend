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

type CurrentUserResponse = {
  token?: string;
  user: AuthUser;
};

export async function login(email: string, password: string) {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });

  assertLoginResponse(response);
  setAuthToken(response.token);
  setCachedAuthUser(response.user);
  return response.user;
}

export async function getCurrentUser() {
  const response = await apiRequest<CurrentUserResponse>("/auth/me");
  assertAuthUser(response.user);

  if (response.token) {
    setAuthToken(response.token);
  }

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

function assertLoginResponse(response: LoginResponse) {
  if (!response || typeof response.token !== "string" || !response.token) {
    throw new Error("Login succeeded, but the server did not return a session token.");
  }

  assertAuthUser(response.user);
}

function assertAuthUser(user: AuthUser) {
  if (!user || typeof user.email !== "string" || (user.role !== "user" && user.role !== "admin")) {
    throw new Error("Login succeeded, but the server returned invalid user data.");
  }
}
