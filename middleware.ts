import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_URL = process.env.NEXT_PUBLIC_APP_AUTH_URL || 'http://localhost:3003';

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get('Authentication')

    // List of protected base paths that require auth
    const protectedPaths = ['/dashboard', '/automations', '/analytics', '/integrations', '/settings'];
    const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    // If authenticated user tries to visit home page or local auth pages, redirect to dashboard
    if (authCookie && (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If going to a protected route but not authenticated, send to central login
    if (!authCookie && isProtectedPath) {
        const loginUrl = new URL(`${AUTH_URL}/login`);
        loginUrl.searchParams.set('redirect', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If going to local sign-in/up page (and NOT authenticated), immediately redirect to central Auth
    if (!authCookie && (request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up'))) {
        const target = `${AUTH_URL}/login?redirect=${encodeURIComponent(`${request.nextUrl.origin}/dashboard`)}`;
        return NextResponse.redirect(target);
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
