"use client";

export function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers = new Headers(options?.headers);

  if (!headers.has("content-type") && !(options?.body instanceof FormData)) {
    headers.set("content-type", "application/json");
  }

  return fetch(url, { ...options, headers, credentials: "same-origin" });
}
