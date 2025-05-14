import en from './locales/en.json';
import ja from './locales/ja.json';

export const defaultLocale = 'en';
export const locales = ['en', 'ja'] as const;
export type Locale = typeof locales[number];

// Use dynamic imports to prevent build-time caching
export async function getTranslation(locale: Locale = defaultLocale) {
  try {
    const translation = locale === 'en' 
      ? await import('./locales/en.json')
      : await import('./locales/ja.json');
    return translation.default;
  } catch (error) {
    console.error('Error loading translation:', error);
    return locale === 'en' ? en : ja;
  }
}

// Type-safe translation keys
type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

type DotNestedKeys<T> = (T extends (string | string[]) ? ''
  : T extends object
  ? { [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}` }[Exclude<keyof T, symbol>]
  : '') extends infer D ? Extract<D, string> : never;

export type TranslationKey = DotNestedKeys<typeof en>;

// Get nested object value with dot notation
export function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
}

// Get translation with key
export async function t(key: TranslationKey, locale: Locale = defaultLocale): Promise<string | string[]> {
  const translation = await getTranslation(locale);
  const value = getNestedValue(translation, key);
  if (!value) {
    console.warn(`No translation found for key: ${key}`);
    return key;
  }
  return value;
}