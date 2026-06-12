import { apiRequest } from "../lib/api-client";
import type { AuthUser } from "./auth-service";

export type CreateUserInput = {
  email: string;
  password?: string;
  role: "user" | "admin";
  status: "allowed" | "blocked";
};

export async function createUser(input: CreateUserInput) {
  const response = await apiRequest<{ user: AuthUser }>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.user;
}

export async function getUsers() {
  const response = await apiRequest<{ users: AuthUser[] }>("/users");
  return response.users;
}

export async function updateUser(id: number, input: CreateUserInput) {
  const response = await apiRequest<{ user: AuthUser }>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return response.user;
}

export async function deleteUser(id: number) {
  await apiRequest<{ deleted: boolean }>(`/users/${id}`, {
    method: "DELETE",
  });
}
