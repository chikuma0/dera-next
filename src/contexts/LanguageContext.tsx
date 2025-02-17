'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Locale, TranslationKey } from '@/i18n';
import { defaultLocale, t } from '@/i18n';

interface LanguageContextType {
  locale: Locale;
  translate: (key: TranslationKey) => string | string[];
}

const LanguageContext = createContext<LanguageContextType>({
  locale: defaultLocale,
  translate: (key) => t(key, defaultLocale),
});

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  // Update locale when initialLocale changes
  useEffect(() => {
    console.log('LanguageProvider: initialLocale changed to', initialLocale);
    setLocale(initialLocale);
  }, [initialLocale]);

  const translate = (key: TranslationKey) => {
    console.log('LanguageProvider: translating key', key, 'for locale', locale);
    return t(key, locale);
  };

  const contextValue = {
    locale,
    translate,
  };

  console.log('LanguageProvider: rendering with locale', locale);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}