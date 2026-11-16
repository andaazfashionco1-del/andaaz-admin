import { useAuthStore } from "./auth-store";
import type { MediaAsset } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | boolean | null | undefined>;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  /** Set false for endpoints that must not send the token or trigger logout (login). */
  auth?: boolean;
};

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

function handleUnauthorized() {
  useAuthStore.getState().logout();
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = useAuthStore.getState().token;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?", 0);
  }

  const text = await res.text();
  const data = text ? parseJson(text) : null;

  if (!res.ok) {
    if (res.status === 401 && auth) {
      handleUnauthorized();
      throw new ApiError("Your session has expired. Please sign in again.", 401);
    }
    throw new ApiError(extractMessage(data, `Request failed (${res.status})`), res.status);
  }

  return data as T;
}

/** Uploads files to `/admin/uploads` (field `files`, max 10 per request) reporting combined progress 0–100. */
export async function uploadFiles(
  files: File[],
  onProgress?: (percent: number) => void,
): Promise<MediaAsset[]> {
  const batches: File[][] = [];
  for (let i = 0; i < files.length; i += 10) batches.push(files.slice(i, i + 10));

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0) || 1;
  let uploadedBytes = 0;
  const results: MediaAsset[] = [];

  for (const batch of batches) {
    const batchBytes = batch.reduce((sum, f) => sum + f.size, 0);
    // Reaches 100 once the last byte is sent; the server may still be storing the files (e.g. to S3).
    const assets = await uploadBatch(batch, (fraction) => {
      onProgress?.(Math.min(100, Math.round(((uploadedBytes + fraction * batchBytes) / totalBytes) * 100)));
    });
    uploadedBytes += batchBytes;
    results.push(...assets);
  }
  onProgress?.(100);
  return results;
}

function uploadBatch(files: File[], onSent: (fraction: number) => void): Promise<MediaAsset[]> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/admin/uploads`);
    const token = useAuthStore.getState().token;
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) onSent(event.loaded / event.total);
    };
    xhr.onerror = () => reject(new ApiError("Upload failed. Is the API running?", 0));
    xhr.onload = () => {
      const data = xhr.responseText ? parseJson(xhr.responseText) : null;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as MediaAsset[]);
        return;
      }
      if (xhr.status === 401) {
        handleUnauthorized();
        reject(new ApiError("Your session has expired. Please sign in again.", 401));
        return;
      }
      reject(new ApiError(extractMessage(data, `Upload failed (${xhr.status})`), xhr.status));
    };
    xhr.send(form);
  });
}
