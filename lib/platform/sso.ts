/**
 * SSO & Portal Navigation Helpers
 * ───────────────────────────────
 * Centralizes all cross-app links, upgrade URLs, and return parameters.
 */

const AUTH_URL = process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production" ? "https://aura.codeswayam.com" : "http://localhost:3006");

export function getSsoLoginUrl(returnUrl?: string): string {
  const authBase = AUTH_URL.replace(/\/$/, "");
  const ssoEndpoint = authBase.endsWith("/sso") ? authBase : `${authBase}/sso`;

  const appOrigin = typeof window !== "undefined" ? window.location.origin : APP_URL.replace(/\/$/, "");
  const callbackUrl = new URL("/auth/callback", appOrigin);

  const destination = returnUrl || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/dashboard");
  if (destination && destination !== "/auth/callback") {
    callbackUrl.searchParams.set("redirect", destination);
  }

  return `${ssoEndpoint}?redirect=${encodeURIComponent(callbackUrl.toString())}`;
}

export function getSsoRegisterUrl(returnUrl?: string): string {
  const authBase = AUTH_URL.replace(/\/$/, "").replace(/\/sso$/, "");
  const appOrigin = typeof window !== "undefined" ? window.location.origin : APP_URL.replace(/\/$/, "");
  const callbackUrl = new URL("/auth/callback", appOrigin);

  const destination = returnUrl || (typeof window !== "undefined" ? window.location.pathname + window.location.search : "/dashboard");
  if (destination && destination !== "/auth/callback") {
    callbackUrl.searchParams.set("redirect", destination);
  }

  return `${authBase}/signup?redirect=${encodeURIComponent(callbackUrl.toString())}`;
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
