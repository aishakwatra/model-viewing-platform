import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// NOTE: This middleware is simplified because we're using localStorage-based auth
// The main protection happens on the client-side via useProtectedRoute hook and AuthProvider

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all routes by default
  // Client-side protection via useProtectedRoute hook and AuthProvider will handle auth checks
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
