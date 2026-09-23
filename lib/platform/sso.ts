/**
 * SSO & Portal Navigation Helpers
 * ───────────────────────────────
 * Centralizes all cross-app links, upgrade URLs, and return parameters.
 */

const AUTH_URL = process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production" ? "https://aura.codeswayam.com" : "http://localhost:3006");

const APP_ORIGIN = APP_URL.replace(/\/$/, "");

export function getSsoLoginUrl(returnUrl?: string): string {
  const authBase = AUTH_URL.replace(/\/$/, "");
  const ssoEndpoint = authBase.endsWith("/sso") ? authBase : `${authBase}/sso`;

  const callbackUrl = new URL("/auth/callback", APP_ORIGIN);
  const destination = returnUrl || "/dashboard";
  if (destination && destination !== "/auth/callback") {
    callbackUrl.searchParams.set("redirect", destination);
  }

  return `${ssoEndpoint}?redirect=${encodeURIComponent(callbackUrl.toString())}`;
}

export function getSsoRegisterUrl(returnUrl?: string): string {
  const authBase = AUTH_URL.replace(/\/$/, "").replace(/\/sso$/, "");
  const callbackUrl = new URL("/auth/callback", APP_ORIGIN);
  const destination = returnUrl || "/dashboard";
  if (destination && destination !== "/auth/callback") {
    callbackUrl.searchParams.set("redirect", destination);
  }

  return `${authBase}/signup?redirect=${encodeURIComponent(callbackUrl.toString())}`;
}

export function getUpgradeUrl(tier = "pro", returnUrl?: string): string {
  const target = returnUrl || `${APP_ORIGIN}/dashboard`;
  return `${AUTH_URL}/account/subscriptions?tier=${encodeURIComponent(tier)}&app=auraflow&returnUrl=${encodeURIComponent(target)}`;
}

export function getBillingPortalUrl(returnUrl?: string): string {
  const target = returnUrl || `${APP_ORIGIN}/dashboard`;
  return `${AUTH_URL}/account/billing?returnUrl=${encodeURIComponent(target)}`;
}

export function getCreditsPortalUrl(returnUrl?: string): string {
  const target = returnUrl || `${APP_ORIGIN}/dashboard`;
  return `${AUTH_URL}/account/credits?returnUrl=${encodeURIComponent(target)}`;
}

export function getProfileUrl(returnUrl?: string): string {
  const authBase = AUTH_URL.replace(/\/$/, "");
  const target = returnUrl || APP_ORIGIN;
  return `${authBase}/profile?app=auraflow&redirect=${encodeURIComponent(target)}`;
}
