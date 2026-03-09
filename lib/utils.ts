import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const ALLOWED_REMOTE_IMAGE_HOSTS = new Set(["res.cloudinary.com"])

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAED(amount: number | string | null | undefined) {
  const numeric = typeof amount === "string" ? Number(amount) : (amount ?? 0)
  const safe = Number.isFinite(numeric) ? numeric : 0
  return `${safe.toLocaleString(undefined, { maximumFractionDigits: 2 })} AED`
}

export function getSafeImageSrc(
  value: string | null | undefined,
  fallback = "/dummy-product.png",
) {
  if (!value) return fallback

  const trimmed = value.trim()
  if (!trimmed) return fallback

  if (trimmed.startsWith("/")) return trimmed

  try {
    const parsed = new URL(trimmed)
    const isAllowedProtocol =
      parsed.protocol === "https:" || parsed.protocol === "http:"

    if (!isAllowedProtocol) return fallback

    return ALLOWED_REMOTE_IMAGE_HOSTS.has(parsed.hostname) ? trimmed : fallback
  } catch {
    return fallback
  }
}

export function getSafeImageFromValue(
  value: string | string[] | null | undefined,
  fallback = "/dummy-product.png",
) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const safeSrc = getSafeImageSrc(item, "")
      if (safeSrc) return safeSrc
    }

    return fallback
  }

  return getSafeImageSrc(value, fallback)
}
