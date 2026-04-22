import {
  decrementPendingRequests,
  incrementPendingRequests,
} from "@/lib/requestTracker";
import { getStoredToken } from "@/lib/authStorage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

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
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const message = data?.message || res.statusText || "Request failed";
    const error: any = new Error(message);
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

export async function createSellerProfile(payload: any) {
  // expects authenticated cookie to be set (credentials: include)
  return request("/seller", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createBuyerProfile(payload: any) {
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
