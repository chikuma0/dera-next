import { Locale } from '@/i18n';

export function getLocaleFromPath(pathname: string): Locale {
  if (!pathname) return 'en';
  
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  
  return ['en', 'ja'].includes(maybeLocale) ? maybeLocale as Locale : 'en';
}

export function getPathWithoutLocale(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  // If the first segment is a supported locale, remove it
  if (['en', 'ja'].includes(firstSegment)) {
    const pathWithoutLocale = '/' + segments.slice(1).join('/');
    return pathWithoutLocale === '' ? '/' : pathWithoutLocale;
  }
  
  return pathname;
}

export function getLocalizedPath(pathname: string, locale: Locale): string {
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  return `/${locale}${pathWithoutLocale}`;
}
