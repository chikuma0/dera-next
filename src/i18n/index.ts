import en from './locales/en.json';
import ja from './locales/ja.json';

export const defaultLocale = 'en';
export const locales = ['en', 'ja'] as const;
export type Locale = typeof locales[number];

export const translations = {
  en,
  ja,
};

export function getTranslation(locale: Locale = defaultLocale) {
  return translations[locale];
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
export function t(key: TranslationKey, locale: Locale = defaultLocale): string | string[] {
  const translation = getTranslation(locale);
  const value = getNestedValue(translation, key);
  if (!value) return key;
  return value;
}