import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get('Authentication')

    // List of public paths that don't require auth
    const isPublicPath = request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/api/') ||
        request.nextUrl.pathname.startsWith('/sign-in') ||
        request.nextUrl.pathname.startsWith('/sign-up');

    // If going to dashboard but not authenticated, send to central login
    if (!authCookie && !isPublicPath) {
        const loginUrl = new URL('http://localhost:3003/login');
        loginUrl.searchParams.set('redirect', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // If going to local sign-in/up page, immediately redirect to central Auth
    if (request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up')) {
        const target = authCookie ? `${request.nextUrl.origin}/dashboard` : `http://localhost:3003/login?redirect=${request.nextUrl.origin}/dashboard`;
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
