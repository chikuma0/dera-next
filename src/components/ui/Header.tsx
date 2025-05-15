'use client';

import { Logo } from './Logo';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useEffect, useState } from 'react';

type NavItem = {
  name: string;
  href: string;
  translationKey: string;
};

export default function Header({ locale }: { locale: string }) {
  const { translate, isReady } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [clientSideTranslations, setClientSideTranslations] = useState<Record<string, string>>({});
  
  const navigation = [
    { name: 'Home', href: '/', translationKey: 'navigation.home' },
    { name: 'Portfolio', href: '/portfolio', translationKey: 'navigation.portfolio' },
    { name: 'News', href: `/${locale}/news`, translationKey: 'navigation.news' },
    { name: 'Contact', href: '/contact', translationKey: 'navigation.contact' },
  ];

  // Load translations on the client side
  useEffect(() => {
    if (isReady) {
      const translations: Record<string, string> = {};
      navigation.forEach(item => {
        const translated = translate(item.translationKey as any);
        if (typeof translated === 'string') {
          translations[item.translationKey] = translated;
        }
      });
      setClientSideTranslations(translations);
    }
  }, [isReady, translate]);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-none">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
        <div className="flex-1">
          <Link href="/">
            <Logo className="relative -ml-1.5 hover:opacity-80 transition-opacity" />
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const displayName = clientSideTranslations[item.translationKey] || item.name;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-green-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {displayName}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}