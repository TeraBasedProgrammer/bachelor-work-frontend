import { auth } from '@/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  const [, lng, route] = pathname.split('/');

  const publicRoutes = ['login', 'sign-up', 'forgot-password', 'reset'];
  const isPublic = publicRoutes.includes(route);

  // 🔐 Redirect unauthenticated users away from protected pages
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL(`/${lng}/login`, req.url));
  }

  // 🔁 Redirect authenticated users away from public auth pages
  if (session && route === 'login') {
    return NextResponse.redirect(new URL(`/${lng}/profile`, req.url));
  }

  return NextResponse.next();
}

// ✅ Match all routes (except static and API)
export const config = {
  matcher: ['/((?!_next|favicon.ico|api|.*\\..*).*)'],
};
