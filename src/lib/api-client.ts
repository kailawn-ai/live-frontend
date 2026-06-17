const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:4000");
const AUTH_TOKEN_KEY = "zostream_fifa_auth_token";
const AUTH_USER_KEY = "zostream_fifa_auth_user";

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getCachedAuthUser<T>() {
  const value = localStorage.getItem(AUTH_USER_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function setCachedAuthUser<T>(user: T) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = getAuthToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(payload?.error || "Request failed.", response.status);
  }

  return payload as T;
}

function resolveApiBaseUrl(configuredUrl: string) {
  if (typeof window === "undefined") return configuredUrl;

  const browserHost = window.location.hostname;
  const isBrowserLocalhost = browserHost === "127.0.0.1" || browserHost === "localhost";

  if (isBrowserLocalhost) return configuredUrl;

  try {
    const url = new URL(configuredUrl);
    const isConfiguredLocalhost = url.hostname === "127.0.0.1" || url.hostname === "localhost";

    if (isConfiguredLocalhost) {
      url.hostname = browserHost;
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    return configuredUrl;
  }

  return configuredUrl;
}
