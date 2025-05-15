'use client';

import { useTranslation } from '@/contexts/LanguageContext';
import { locales } from '@/i18n';
import React from 'react';

// Create a client-side only wrapper to avoid hydration issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <>{children}</>;
}

export function LanguageSwitcher() {
  const { locale, setLocale, isReady } = useTranslation();

  // SVG for earth icon (matches header color)
  const EarthIcon = (
    <svg className="w-5 h-5 mr-1 inline-block align-middle text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  );

  // Only show the other language
  const otherLocale = locale === 'en' ? 'ja' : 'en';
  const otherLabel = otherLocale === 'en' ? 'EN' : '日本語';
  const ariaLabel = otherLocale === 'en' ? 'Switch to English' : '日本語に切り替え';

  const switchLanguage = () => {
    if (!locales.includes(otherLocale as any) || !isReady) return;
    setLocale(otherLocale as any);
  };

  return (
    <ClientOnly>
      <button
        onClick={switchLanguage}
        className="flex items-center px-2 py-1 text-sm text-green-300 hover:text-green-400 transition-colors border-none bg-transparent font-medium focus:outline-none focus:underline hover:underline"
        aria-label={ariaLabel}
        disabled={!isReady}
        style={{ boxShadow: 'none' }}
      >
        {EarthIcon}
        {otherLabel}
      </button>
    </ClientOnly>
  );
}
