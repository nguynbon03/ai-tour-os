const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetcher(path: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: (path: string) => fetcher(path),
  post: (path: string, body: unknown) => fetcher(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: unknown) => fetcher(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) => fetcher(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => fetcher(path, { method: "DELETE" }),
};
