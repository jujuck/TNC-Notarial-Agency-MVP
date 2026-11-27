import { NextResponse, type NextRequest } from 'next/server';

import { resolveAdminRedirect } from './lib/adminAccess';

/**
 * Convention `proxy` de Next.js 16 (anciennement `middleware`).
 * Confort de navigation uniquement : l'API reste la frontiere de securite.
 */
export function proxy(request: NextRequest) {
  const redirect = resolveAdminRedirect({
    pathname: request.nextUrl.pathname,
    hasAuthToken: request.cookies.has('auth_token'),
    hasDemoSession: request.cookies.has('demo_session'),
  });

  if (!redirect) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(redirect, request.url));
}

export const config = {
  matcher: ['/admin/:path*'],
};
