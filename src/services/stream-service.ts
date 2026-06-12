import { apiRequest } from "../lib/api-client";

export type LiveStream = {
  id: string;
  title: string;
  description: string | null;
  teams: string | null;
  status: "live";
  hlsUrl: string | null;
  startedAt: string | null;
};

export type AdminStream = {
  id: string;
  title: string;
  description: string | null;
  teams: string | null;
  status: "offline" | "live" | "disabled";
  streamKey: string;
  hlsUrl: string;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  endedAt: string | null;
};

export type CreateStreamInput = {
  title: string;
  teams?: string;
  description?: string;
  streamKey?: string;
  hlsUrl?: string;
  status?: "offline" | "live" | "disabled";
};

export async function getLiveStreams() {
  const response = await apiRequest<{ streams: LiveStream[] }>("/public/streams");
  return response.streams;
}

export async function getPublicStream(id: string) {
  const response = await apiRequest<{ stream: LiveStream }>(`/streams/${encodeURIComponent(id)}`);
  return response.stream;
}

export async function getAdminStreams() {
  const response = await apiRequest<{ streams: AdminStream[] }>("/streams");
  return response.streams;
}

export async function createStream(input: CreateStreamInput) {
  const response = await apiRequest<{ stream: AdminStream }>("/streams", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.stream;
}

export async function updateStream(id: string, input: CreateStreamInput) {
  const response = await apiRequest<{ stream: AdminStream }>(`/streams/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return response.stream;
}
