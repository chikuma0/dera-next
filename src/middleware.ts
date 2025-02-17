import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

export function middleware(request: NextRequest) {
  // Get locale from query param or Accept-Language header
  const { searchParams } = new URL(request.url);
  const forcedLocale = searchParams.get('lang');
  
  let locale;
  if (forcedLocale && locales.includes(forcedLocale as any)) {
    locale = forcedLocale;
  } else {
    // Get from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (!acceptLanguage) {
      locale = defaultLocale;
    } else {
      // Get primary language code
      const primaryLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
      locale = locales.includes(primaryLang as any) ? primaryLang : defaultLocale;
    }
  }

  // Create response
  const response = NextResponse.next();

  // Set cookie
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31536000, // 1 year in seconds
    sameSite: 'lax'
  });
  
  // Set header
  response.headers.set('x-locale', locale);

  return response;
}

export const config = {
  matcher: [
    // Match all paths except:
    // - /api routes
    // - /_next (Next.js internals)
    // - /static (static files)
    // - /favicon.ico, /robots.txt, etc.
    '/((?!api|_next/static|_next/image|static|favicon.ico|robots.txt).*)',
  ],
};