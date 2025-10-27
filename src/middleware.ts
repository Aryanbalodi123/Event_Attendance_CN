import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = {
  admin: ['/admin'],
  student: ['/student'],
};

const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  let session = null;
  
  if (sessionCookie) {
    session = await decrypt(sessionCookie);
  }

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = protectedRoutes.admin.some(route => pathname.startsWith(route));
  const isStudentRoute = protectedRoutes.student.some(route => pathname.startsWith(route));

  // 1. If user is logged in
  if (session) {
    // 1a. If they try to access /login or /signup, redirect them
    if (isAuthRoute) {
      const redirectUrl = session.role === 'admin' ? '/admin' : '/student';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // 1b. If they are an admin accessing a student route
    if (session.role === 'admin' && isStudentRoute) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // 1c. If they are a student accessing an admin route
    if (session.role === 'student' && isAdminRoute) {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    
    // 1d. User is authenticated and has correct role. Continue.
    return NextResponse.next();
  }

  // 2. If user is NOT logged in and trying to access a protected route
  if (!session && (isAdminRoute || isStudentRoute)) {
    // Redirect to login, but preserve the intended URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. All other cases (e.g., public home page), allow access
  return NextResponse.next();
}

// Config matcher to run middleware on specific paths
export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/login',
    '/signup',
  ],
};