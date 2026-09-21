import { withCSWAuth } from "@codeswayam/auth/middleware";

/**
 * Auraflow — SSO Middleware
 *
 * Protected paths: /dashboard, /automations, /analytics,
 *                  /integrations, /settings, /templates
 * Public paths:    everything else (home, marketing, API routes, webhook)
 *
 * After SSO login the user lands on /auth/callback which exchanges the
 * ticket for a JWT and saves it as both localStorage + Authentication cookie.
 */
const authBase = process.env.NEXT_PUBLIC_APP_AUTH_URL || "http://localhost:3003";
const ssoUrl = authBase.endsWith("/sso") ? authBase : `${authBase.replace(/\/$/, "")}/sso`;

export default withCSWAuth({
    ssoUrl,
    callbackPath: "/auth/callback",
    publicPaths: [
        "/",
        "/auth/callback",
        "/sign-in",
        "/sign-up",
        "/api",            // all /api/* routes (webhooks, integrations callbacks)
    ],
});

export const config = {
    matcher: [
        // Match everything except Next.js internals and static assets
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    ],
};

