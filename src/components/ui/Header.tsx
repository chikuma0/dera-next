'use client';

import { Logo } from './Logo';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';

type NavItem = {
  name: string;
  href: string;
  translationKey: string;
};

const navigation: NavItem[] = [
  { name: 'Home', href: '/', translationKey: 'navigation.home' },
  { name: 'Portfolio', href: '/portfolio', translationKey: 'navigation.portfolio' },
  { name: 'News', href: '/news', translationKey: 'navigation.news' },
  { name: 'Contact', href: '/contact', translationKey: 'navigation.contact' },
];

export function Header() {
  const { translate } = useTranslation();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-none">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
        <div className="flex-1">
          <Link href="/">
            <Logo className="relative -ml-1.5 hover:opacity-80 transition-opacity" />
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {navigation.map((item) => {
            const translatedName = translate(item.translationKey as any);
            return (
              <Link
                key={item.name}
                href={item.href}
                className="text-green-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                {typeof translatedName === 'string' ? translatedName : item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  )
}