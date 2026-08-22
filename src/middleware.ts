import { NextResponse } from 'next/server';
import { securityHeaders, getCspHeader } from './lib/security/headers';
import { auth } from './auth';

export default auth((request) => {
    const session = request.auth as any;
    const isLoggedIn = !!session && !!session.backendToken && session.error !== "RefreshAccessTokenError";
    const userRole = session?.user?.role;
    const { pathname } = request.nextUrl;

    const isAdminRoute = pathname.startsWith('/admin');
    const isAdminLogin = pathname === '/admin/login';
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/team-login';

    if (isAdminRoute) {
        if (!isLoggedIn) {
            if (!isAdminLogin) {
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }
        } else {
            if (userRole !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard/marketplace', request.url));
            } else if (isAdminLogin) {
                return NextResponse.redirect(new URL('/admin/overview', request.url));
            }
        }
    } else if (isDashboardRoute) {
        if (!isLoggedIn) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
            return NextResponse.redirect(loginUrl);
        }
        if (pathname === '/dashboard' || pathname === '/dashboard/') {
            return NextResponse.redirect(new URL('/dashboard/marketplace', request.url));
        }
    } else if (isAuthPage) {
        if (isLoggedIn) {
            if (userRole === 'admin') {
                return NextResponse.redirect(new URL('/admin/overview', request.url));
            } else {
                return NextResponse.redirect(new URL('/dashboard/marketplace', request.url));
            }
        }
    }

    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const cspHeader = getCspHeader(nonce);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set(cspHeader.key, cspHeader.value);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Set security headers
    securityHeaders.forEach(({ key, value }) => {
        response.headers.set(key, value);
    });

    // Set CSP header
    response.headers.set(cspHeader.key, cspHeader.value);

    return response;
});

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
