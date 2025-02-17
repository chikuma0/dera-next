'use client';

import Link from 'next/link'
import { Logo } from './Logo'
import { useTranslation } from '@/contexts/LanguageContext'
import { Globe } from 'lucide-react';
import { TranslationKey } from '@/i18n';
import { useRouter } from 'next/navigation';

export function Header() {
  const { locale, translate } = useTranslation();
  const router = useRouter();

  const handleLanguageChange = () => {
    // Toggle between en and ja
    const newLocale = locale === 'en' ? 'ja' : 'en';
    console.log('Header: Changing language to', newLocale);
    
    // Get current path and search params
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Update lang parameter
    searchParams.set('lang', newLocale);
    
    // Construct new URL
    const newUrl = `${currentPath}?${searchParams.toString()}`;
    console.log('Header: Navigating to', newUrl);
    
    // Use router.push to trigger a client-side navigation
    router.push(newUrl);
  };

  const navItems: Array<{ href: string; label: TranslationKey }> = [
    { href: '/solutions', label: 'common.solutions' },
    { href: '/portfolio', label: 'common.portfolio' },
    { href: '/news', label: 'common.news' },
    { href: '/contact', label: 'common.contact' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-none">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
        <div className="flex-1">
          <Logo className="relative -ml-1.5" />
        </div>
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
            >
              {translate(item.label)}
            </Link>
          ))}
          <button
            onClick={handleLanguageChange}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Switch language"
          >
            <Globe className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400 font-medium">
              {locale === 'en' ? '日本語' : 'English'}
            </span>
          </button>
        </nav>
      </div>
    </header>
  )
}