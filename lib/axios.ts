import axios from "axios";
import {
  decrementPendingRequests,
  incrementPendingRequests,
} from "@/lib/requestTracker";
import { notifyError } from "@/lib/notifications";
import { getStoredToken } from "@/lib/authStorage";

// Prefer an explicit NEXT_PUBLIC_API_BASE_URL when provided (for staging/backend).
// For local Next.js API routes default to relative "/api" so axios will call the app's
// internal handlers (e.g. /api/categories) instead of the separate backend server.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    (config as any).__tracked = true;
    const headers: any = config.headers || {};

    if (typeof headers["Cache-Control"] === "undefined") {
      headers["Cache-Control"] = "no-cache";
    }
    if (typeof headers.Pragma === "undefined") {
      headers.Pragma = "no-cache";
    }

    // If the backend expects `Authorization: Bearer <token>` and the app stored
    // a token in localStorage, attach it automatically.
    const token = getStoredToken();
    if (token) {
      const hasAuthHeader =
        typeof headers.Authorization !== "undefined" ||
        typeof headers.authorization !== "undefined";
      if (!hasAuthHeader) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    // When the body is FormData, the Content-Type must include the multipart
    // boundary which only the browser/axios can compute automatically.
    // Remove any preset Content-Type so axios sets it correctly.
    if (config.data instanceof FormData) {
      delete headers["Content-Type"];
      delete headers["content-type"];
    }

    config.headers = headers;

    incrementPendingRequests();
    return config;
  },
  (error) => {
    decrementPendingRequests();
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    const cfg = response?.config as any;
    if (cfg?.__tracked) decrementPendingRequests();
    return response;
  },
  (error) => {
    const cfg = error?.config as any;
    if (cfg?.__tracked) decrementPendingRequests();
    notifyError(error);
    return Promise.reject(error);
  },
);

export default api;
