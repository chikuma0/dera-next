import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

// Get the preferred locale from Accept-Language header
function getPreferredLocale(request: NextRequest) {
  // Check for forced locale in query parameter
  const { searchParams } = new URL(request.url);
  const forcedLocale = searchParams.get('lang');
  if (forcedLocale && locales.includes(forcedLocale as any)) {
    console.log('Using forced locale:', forcedLocale);
    return forcedLocale;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  // Parse the Accept-Language header
  const preferredLocales = acceptLanguage
    .split(',')
    .map(lang => {
      // Handle formats like "en-US,en;q=0.9"
      const [code, priority = '1.0'] = lang.trim().split(';q=');
      // Get primary language code and clean it
      const primaryLang = code.split('-')[0].toLowerCase().trim();
      
      return {
        locale: primaryLang,
        priority: parseFloat(priority),
      };
    })
    .sort((a, b) => b.priority - a.priority);

  // Find the first preferred locale that we support
  const matchedLocale = preferredLocales.find(({ locale }) => 
    locales.includes(locale as any)
  );

  const selectedLocale = matchedLocale ? matchedLocale.locale : defaultLocale;
  console.log('Selected locale from Accept-Language:', selectedLocale);
  return selectedLocale;
}

export function middleware(request: NextRequest) {
  // Get locale from cookie, query param, or Accept-Language header
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  
  // If cookie exists and is valid, use it unless there's a lang query param
  const { searchParams } = new URL(request.url);
  const forcedLocale = searchParams.get('lang');
  
  let locale;
  if (forcedLocale && locales.includes(forcedLocale as any)) {
    locale = forcedLocale;
  } else if (cookieLocale && locales.includes(cookieLocale as any)) {
    locale = cookieLocale;
  } else {
    locale = getPreferredLocale(request);
  }
  
  // Create response and set locale
  const response = NextResponse.next();

  // Set cookie with a long expiration (1 year)
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31536000, // 1 year in seconds
    sameSite: 'lax'
  });
  
  response.headers.set('x-locale', locale);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};