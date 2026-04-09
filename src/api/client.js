const ADMIN_TOKEN_KEY = "portfolio_admin_token";

export async function fetchJSON(url, options = {}) {
  try {
    const { headers, body, ...rest } = options;
    const isJsonBody = body && typeof body === "string";
    const response = await fetch(url, {
      ...rest,
      headers: {
        ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body,
    });

    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";
    const payload = text
      ? contentType.includes("application/json")
        ? JSON.parse(text)
        : null
      : null;

    if (text && !contentType.includes("application/json")) {
      throw new Error("API returned HTML instead of JSON. Check the Vercel backend deployment and environment variables.");
    }

    if (!response.ok) {
      throw new Error(payload?.message || "Request failed.");
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Unable to reach the server. Check the API deployment or local backend and try again.");
    }

    throw error;
  }
}

export function getAdminToken() {
  return window.localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function setAdminToken(token) {
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getAdminHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAdminJSON(url, options = {}) {
  const { getFreshAdminToken } = await import("../lib/firebaseAuth");
  const token = (await getFreshAdminToken()) || getAdminToken();

  return fetchJSON(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function uploadAdminAsset(payload) {
  return fetchAdminJSON("/api/admin/assets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
