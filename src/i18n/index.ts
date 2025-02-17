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
  console.log('Getting translation for locale:', locale);
  console.log('Available translations:', Object.keys(translations));
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
  console.log('Getting nested value for path:', path);
  console.log('From object:', JSON.stringify(obj, null, 2));
  const result = path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
  console.log('Result:', result);
  return result;
}

// Get translation with key
export function t(key: TranslationKey, locale: Locale = defaultLocale): string | string[] {
  console.log('Translating key:', key, 'for locale:', locale);
  const translation = getTranslation(locale);
  const value = getNestedValue(translation, key);
  if (!value) {
    console.log('No translation found, returning key');
    return key;
  }
  console.log('Found translation:', value);
  return value;
}