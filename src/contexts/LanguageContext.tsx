'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Locale, TranslationKey } from '@/i18n';
import { defaultLocale, t, getTranslation } from '@/i18n';
import type en from '@/i18n/locales/en.json';

type TranslationsType = typeof en;

interface LanguageContextType {
  locale: Locale;
  translate: (key: TranslationKey) => string | string[];
}

const LanguageContext = createContext<LanguageContextType>({
  locale: defaultLocale,
  translate: (key) => key,
});

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [translations, setTranslations] = useState<TranslationsType | null>(null);

  // Load translations when locale changes
  useEffect(() => {
    const loadTranslations = async () => {
      const trans = await getTranslation(locale);
      setTranslations(trans);
    };
    loadTranslations();
  }, [locale]);

  // Simple translation function that uses loaded translations
  const translate = (key: TranslationKey): string | string[] => {
    if (!translations) return key;
    
    const value = key.split('.').reduce((obj, k) => obj?.[k], translations as any);
    if (typeof value === 'string' || Array.isArray(value)) {
      return value;
    }
    return key;
  };

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
