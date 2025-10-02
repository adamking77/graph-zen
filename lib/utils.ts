import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the URL for the chart maker app based on environment
 * In production: https://charts.graph-zen.app
 * In development: /app
 */
export function getAppUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NODE_ENV === 'production'
      ? 'https://charts.graph-zen.app'
      : '/app'
  }

  // Client-side
  const hostname = window.location.hostname

  if (hostname === 'graph-zen.app') {
    return 'https://charts.graph-zen.app'
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/app'
  }

  return '/app'
}

/**
 * Get the URL for the landing page based on environment
 * In production: https://graph-zen.app
 * In development: /landing
 */
export function getLandingUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NODE_ENV === 'production'
      ? 'https://graph-zen.app'
      : '/landing'
  }

  // Client-side
  const hostname = window.location.hostname

  if (hostname === 'charts.graph-zen.app') {
    return 'https://graph-zen.app'
  } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/landing'
  }

  return '/landing'
}
