'use client';

import React, { createContext, useContext, useState } from 'react';
import { Locale, defaultLocale, t, TranslationKey } from '@/i18n';

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
  React.useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  const translate = (key: TranslationKey) => t(key, locale);

  return (
    <LanguageContext.Provider value={{ locale, translate }}>
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