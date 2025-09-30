
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;
  
  // If no database URL is configured, and we're not already on the setup page, redirect to setup
  if (!process.env.POSTGRES_URL && pathname !== '/setup') {
      return NextResponse.redirect(new URL('/setup', request.url));
  }
  
  // If the user is not logged in and is trying to access an admin route
  if (!session && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is logged in and tries to access login or signup page
  if (session && (pathname === '/login' || pathname === '/signup' || pathname === '/setup')) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // Clone the request headers and set a new header `x-pathname`
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Apply the new headers to the response
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

    