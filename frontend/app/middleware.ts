// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = !!request.cookies.get('jwt'); // Check if the JWT cookie exists

  // Define paths that should be protected (e.g., '/profile', '/dashboard')
  const protectedPaths = ['/profile', '/dashboard'];

  // Redirect to login if trying to access protected paths and not logged in
  if (!isLoggedIn && protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed if the user is logged in or accessing public routes
  return NextResponse.next();
}

// This line is important to apply middleware to specific routes
export const config = {
  matcher: ['/profile', '/dashboard'], // Specify the paths to protect
};
