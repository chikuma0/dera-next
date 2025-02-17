'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/i18n';

interface MobileMenuProps {
  onLanguageChange: () => void;
}

export function MobileMenu({ onLanguageChange }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, translate } = useTranslation();

  const navItems: Array<{ href: string; label: TranslationKey }> = [
    { href: '/solutions', label: 'common.solutions' },
    { href: '/portfolio', label: 'common.portfolio' },
    { href: '/news', label: 'common.news' },
    { href: '/contact', label: 'common.contact' }
  ];

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-green-400 hover:text-green-300"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-xl font-medium text-green-400 hover:text-green-300 transition-colors"
              >
                {translate(item.label)}
              </Link>
            ))}
            <button
              onClick={() => {
                onLanguageChange();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Switch language"
            >
              <Globe className="w-6 h-6 text-green-400" />
              <span className="text-lg text-green-400 font-medium">
                {locale === 'en' ? '日本語' : 'English'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}