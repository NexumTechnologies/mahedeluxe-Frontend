import { NextRequest } from "next/server";

export const runtime = "nodejs";

const ALLOWED_HOSTS = new Set(["res.cloudinary.com"]);
const DEFAULT_BACKEND_API_BASE = "http://localhost:5000/api/v1";

function getBackendApiBase() {
  const value =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    DEFAULT_BACKEND_API_BASE;
  return value.replace(/\/$/, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");

  if (!urlParam) {
    return new Response("Missing url", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  let parsed: URL;
  try {
    parsed = new URL(urlParam);
  } catch {
    return new Response("Invalid url", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return new Response("Invalid protocol", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return new Response("Host not allowed", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const range = request.headers.get("range");
  const backendApiBase = getBackendApiBase();

  let backendProxy: Response | null = null;
  try {
    //========================= API CALLS ==========================//
    //==============================================================//
    backendProxy = await fetch(
      `${backendApiBase}/upload/document-proxy?url=${encodeURIComponent(parsed.toString())}`,
      {
        headers: {
          ...(range ? { range } : null),
          accept: "application/pdf,*/*",
        },
        cache: "no-store",
      },
    );
  } catch {
    backendProxy = null;
  }

  const backendType = (backendProxy?.headers.get("content-type") || "").toLowerCase();
  if (backendProxy && backendProxy.ok && backendType.includes("application/pdf")) {
    const headers = new Headers();
    for (const key of [
      "accept-ranges",
      "content-length",
      "content-range",
      "etag",
      "last-modified",
    ]) {
      const value = backendProxy.headers.get(key);
      if (value) headers.set(key, value);
    }

    headers.set("content-type", backendProxy.headers.get("content-type") || "application/pdf");
    headers.set("content-disposition", "inline");
    headers.set("cache-control", "no-store");

    return new Response(backendProxy.body, {
      status: backendProxy.status,
      headers,
    });
  }

  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString(), {
      redirect: "follow",
      headers: {
        ...(range ? { range } : null),
        accept: "application/pdf,*/*",
      },
    });
  } catch {
    return new Response(
      `<!doctype html><meta charset="utf-8" />
      <title>Document preview</title>
      <body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 16px;">
        <h3 style="margin:0 0 8px 0;">Document preview error</h3>
        <div style="color:#444; font-size: 14px;">Unable to fetch the document from the remote host.</div>
      </body>`,
      {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      },
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "";

  if (upstream.ok && contentType.toLowerCase().includes("application/pdf")) {
    const headers = new Headers();

    // Pass through headers that make PDF viewing smoother (range requests, etc.)
    for (const key of [
      "accept-ranges",
      "content-length",
      "content-range",
      "etag",
      "last-modified",
    ]) {
      const value = upstream.headers.get(key);
      if (value) headers.set(key, value);
    }

    headers.set("content-type", contentType);
    headers.set("content-disposition", "inline");
    headers.set("cache-control", "no-store");

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  }

  const cldError = upstream.headers.get("x-cld-error") ?? "";
  const safeTarget = escapeHtml(`${parsed.origin}${parsed.pathname}`);
  const safeContentType = escapeHtml(contentType || "(none)");
  const safeStatus = escapeHtml(String(upstream.status));
  const safeCldError = escapeHtml(cldError);

  return new Response(
    `<!doctype html><meta charset="utf-8" />
    <title>Document preview</title>
    <body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 16px;">
      <h3 style="margin:0 0 8px 0;">Document canÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢t be displayed</h3>
      <div style="color:#444; font-size: 14px; line-height: 1.5;">
        <div><strong>Status:</strong> ${safeStatus}</div>
        <div><strong>Content-Type:</strong> ${safeContentType}</div>
        ${safeCldError ? `<div><strong>Cloudinary:</strong> ${safeCldError}</div>` : ""}
        <div style="margin-top: 8px;">URL: ${safeTarget}</div>
        <div style="margin-top: 12px;">Try opening the document in a new tab to download/view it.</div>
      </div>
    </body>`,
    {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}
