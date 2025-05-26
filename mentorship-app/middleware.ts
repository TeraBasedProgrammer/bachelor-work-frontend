import { auth } from '@/auth';
import acceptLanguage from 'accept-language';
import { NextResponse } from 'next/server';

import { cookieName, fallbackLng, languages } from './app/i18n/settings';

export async function middleware(req: any) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  if (req.nextUrl.pathname.indexOf('icon') > -1 || req.nextUrl.pathname.indexOf('chrome') > -1)
    return NextResponse.next();

  const [, , route] = pathname.split('/');

  let lng;
  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName).value);
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'));
  if (!lng) lng = fallbackLng;

  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.redirect(
      new URL(`/${lng}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url),
    );
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer'));
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`));
    const response = NextResponse.next();
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
    return response;
  }

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
