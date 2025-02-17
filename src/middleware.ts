import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n';

// Get the preferred locale from Accept-Language header
function getPreferredLocale(request: NextRequest) {
  // Check for forced locale in query parameter
  const { searchParams } = new URL(request.url);
  const forcedLocale = searchParams.get('lang');
  if (forcedLocale && locales.includes(forcedLocale as any)) {
    console.log('Middleware: Using forced locale:', forcedLocale);
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
  console.log('Middleware: Selected locale from Accept-Language:', selectedLocale);
  return selectedLocale;
}

export function middleware(request: NextRequest) {
  console.log('Middleware: Processing request for URL:', request.url);
  
  // Get locale from cookie, query param, or Accept-Language header
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  console.log('Middleware: Cookie locale:', cookieLocale);
  
  // If cookie exists and is valid, use it unless there's a lang query param
  const { searchParams } = new URL(request.url);
  const forcedLocale = searchParams.get('lang');
  console.log('Middleware: Forced locale from query param:', forcedLocale);
  
  let locale;
  if (forcedLocale && locales.includes(forcedLocale as any)) {
    locale = forcedLocale;
  } else if (cookieLocale && locales.includes(cookieLocale as any)) {
    locale = cookieLocale;
  } else {
    locale = getPreferredLocale(request);
  }
  
  console.log('Middleware: Final selected locale:', locale);
  
  // Create response and set locale
  const response = NextResponse.next();

  // Set cookie with a long expiration (1 year)
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31536000, // 1 year in seconds
    sameSite: 'lax'
  });
  
  response.headers.set('x-locale', locale);
  console.log('Middleware: Set x-locale header to:', locale);

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