import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/employees', '/organization', '/profile', '/tasks', '/activity'];
const AUTH_PATH = '/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has('token');

  // Protect dashboard routes
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if already logged in and visiting login
  if (pathname.startsWith(AUTH_PATH) && hasToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/employees/:path*', '/organization/:path*', '/profile/:path*', '/tasks/:path*', '/activity/:path*', '/login'],
};
