export type StoredAuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredToken(): string | null {
  if (!isBrowser()) return null;
  try {
    const token = window.localStorage.getItem("token");
    return token && token.trim() ? token : null;
  } catch {
    return null;
  }
}

export function getStoredUser(): StoredAuthUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthUser;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
  } catch {
    // ignore
  }
}

export function clearClientSession() {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.clear();
    window.localStorage.removeItem("registration");
  } catch {
    // ignore
  }
}

export function clearAllClientAuthState() {
  clearClientSession();
  clearStoredAuth();
}
