import {
  decrementPendingRequests,
  incrementPendingRequests,
} from "@/lib/requestTracker";
import { getStoredToken } from "@/lib/authStorage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

type RequestError = Error & {
  status?: number;
  data?: unknown;
};

type JsonPayload = Record<string, unknown>;
 
async function request(path: string, opts: RequestInit = {}) {
  const shouldTrack = typeof window !== "undefined";
  if (shouldTrack) incrementPendingRequests();

  const token = getStoredToken();
  const headers = new Headers(opts.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-cache");
  if (!headers.has("Pragma")) headers.set("Pragma", "no-cache");
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      credentials: "include",
      headers,
      ...opts,
    });
  } finally {
    if (shouldTrack) decrementPendingRequests();
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: unknown }).message || res.statusText || "Request failed")
        : res.statusText || "Request failed";
    const error: RequestError = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function registerUser(payload: { name: string; email: string; password: string; confirm_password?: string; role?: string; mobileNumber?: string; }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: { email: string; password: string }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createSellerProfile(payload: JsonPayload) {
  // expects authenticated cookie to be set (credentials: include)
  return request("/seller", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createBuyerProfile(payload: JsonPayload) {
  return request("/buyer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminDashboardStats() {
  return request("/users/stats/dashboard", {
    method: "GET",
  });
}

export async function getAdminNotifications(limit = 10) {
  return request(`/admin-notifications?limit=${limit}`, {
    method: "GET",
  });
}

export async function markAdminNotificationRead(id: number | string) {
  return request(`/admin-notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllAdminNotificationsRead() {
  return request("/admin-notifications/mark-all-read", {
    method: "PATCH",
  });
}

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  message: string;
}) {
  return request("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
