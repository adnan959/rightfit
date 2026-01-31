import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cookie name for admin session
const ADMIN_SESSION_COOKIE = 'rightfit_admin_session';

// Routes that don't require authentication
const PUBLIC_ADMIN_ROUTES = ['/admin/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow public admin routes
  if (PUBLIC_ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE);

  if (!sessionCookie || !sessionCookie.value) {
    // Redirect to login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify session (simple hash check)
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not configured');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Simple session validation - the cookie should contain a hash of the password
  const expectedHash = Buffer.from(adminPassword).toString('base64');
  if (sessionCookie.value !== expectedHash) {
    // Invalid session, redirect to login
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
