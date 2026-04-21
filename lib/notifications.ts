export type NotificationTone = "success" | "error" | "info";

export type NotificationPayload = {
  tone: NotificationTone;
  message: string;
};

type Notifier = (payload: NotificationPayload) => void;

let notifier: Notifier | null = null;
let lastKey: string | null = null;
let lastAt = 0;

export function setNotifier(next: Notifier | null) {
  notifier = next;
}

export function notify(payload: NotificationPayload) {
  const message = String(payload?.message || "").trim();
  if (!message) return;

  const key = `${payload.tone}:${message}`;
  const now = Date.now();

  // Basic de-dupe to avoid double toasts (e.g. axios interceptor + react-query cache).
  if (lastKey === key && now - lastAt < 700) return;
  lastKey = key;
  lastAt = now;

  if (notifier) {
    notifier({ ...payload, message });
  } else if (process.env.NODE_ENV !== "production") {
    // Avoid crashing when notifier isn't mounted yet.
    console.warn("Notification:", payload.tone, message);
  }
}

export function notifyError(error: unknown, fallbackMessage = "Something went wrong") {
  const anyErr = error as any;

  const status = anyErr?.response?.status || anyErr?.status;

  const message =
    anyErr?.response?.data?.message ||
    anyErr?.data?.message ||
    anyErr?.message ||
    fallbackMessage;

  const normalizedMessage = String(message);

  // Common case on reload: user is on a protected dashboard but token isn't
  // available (or expired). Clear any stored auth and avoid noisy toasts.
  if (
    status === 401 &&
    /token missing|token is invalid|unauthorized|not authorized/i.test(normalizedMessage)
  ) {
    try {
      if (typeof window !== "undefined") {
        const hadToken = !!window.localStorage.getItem("token");
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-change"));

        // Only notify if there was an active session.
        if (hadToken) {
          notify({ tone: "info", message: "Session expired. Please sign in again." });
        }
      }
    } catch {
      // ignore
    }
    return;
  }

  notify({ tone: "error", message: normalizedMessage });
}
