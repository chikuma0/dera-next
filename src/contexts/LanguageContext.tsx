'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Locale, TranslationKey } from '@/i18n';
import { defaultLocale, getTranslation } from '@/i18n';
import type en from '@/i18n/locales/en.json';

type TranslationsType = typeof en;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translate: (key: TranslationKey) => string | string[];
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale = defaultLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [translations, setTranslations] = useState<TranslationsType | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state on client
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Load translations when locale changes
  useEffect(() => {
    if (!isMounted) return;
    
    let isActive = true;
    
    const loadTranslations = async () => {
      try {
        const trans = await getTranslation(locale);
        if (isActive) {
          setTranslations(trans);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        if (isActive) {
          setTranslations({} as TranslationsType);
        }
      }
    };
    
    loadTranslations();
    
    return () => {
      isActive = false;
    };
  }, [locale, isMounted]);

  // Update locale and save to cookie
  const setLocale = (newLocale: Locale) => {
    if (!isMounted || newLocale === locale) return;
    
    setLocaleState(newLocale);
    
    // Save to cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    
    // Update the document's lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
  };

  // Simple translation function
  const translate = (key: TranslationKey): string | string[] => {
    if (!translations) return key;
    
    try {
      const value = key.split('.').reduce((anyObj: any, k) => {
        if (anyObj && typeof anyObj === 'object' && k in anyObj) {
          return anyObj[k];
        }
        return undefined;
      }, translations);
      
      return value !== undefined ? value : key;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  const isReady = isMounted && translations !== null;

  return (
    <LanguageContext.Provider value={{
      locale,
      setLocale,
      translate,
      isReady,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}