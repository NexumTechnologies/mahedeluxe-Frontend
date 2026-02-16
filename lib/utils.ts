import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAED(amount: number | string | null | undefined) {
  const numeric = typeof amount === "string" ? Number(amount) : (amount ?? 0)
  const safe = Number.isFinite(numeric) ? numeric : 0
  return `${safe.toLocaleString(undefined, { maximumFractionDigits: 2 })} AED`
}
