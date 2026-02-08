import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/api/webhooks/instagram',
  '/api/integrations(.*)',
  '/api/webhooks(.*)', // Important: Webhooks must be public for Instagram to hit them
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)', // OAuth callback route
  '/features',
  '/pricing',
  '/privacy',
  '/terms',
  '/contact',
  '/about',
  '/blog',
  '/blog/(.*)',
  '/terms-of-service',
  '/privacy-policy',
  '/debug',
  '/api/public(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};