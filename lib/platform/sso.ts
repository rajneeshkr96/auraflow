/**
 * SSO & Portal Navigation Helpers
 * ───────────────────────────────
 * Centralizes all cross-app links, upgrade URLs, and return parameters.
 */

const AUTH_URL = process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003";

export function getSsoLoginUrl(returnUrl?: string): string {
  const target = returnUrl || (typeof window !== "undefined" ? window.location.href : "/dashboard");
  return `${AUTH_URL}/sign-in?returnUrl=${encodeURIComponent(target)}`;
}

export function getSsoRegisterUrl(returnUrl?: string): string {
  const target = returnUrl || (typeof window !== "undefined" ? window.location.href : "/dashboard");
  return `${AUTH_URL}/sign-up?returnUrl=${encodeURIComponent(target)}`;
}

export function getUpgradeUrl(tier = "pro", returnUrl?: string): string {
  const target = returnUrl || (typeof window !== "undefined" ? window.location.href : "/dashboard");
  return `${AUTH_URL}/account/subscriptions?tier=${encodeURIComponent(tier)}&app=auraflow&returnUrl=${encodeURIComponent(target)}`;
}

export function getBillingPortalUrl(returnUrl?: string): string {
  const target = returnUrl || (typeof window !== "undefined" ? window.location.href : "/dashboard");
  return `${AUTH_URL}/account/billing?returnUrl=${encodeURIComponent(target)}`;
}

export function getCreditsPortalUrl(returnUrl?: string): string {
  const target = returnUrl || (typeof window !== "undefined" ? window.location.href : "/dashboard");
  return `${AUTH_URL}/account/credits?returnUrl=${encodeURIComponent(target)}`;
}
