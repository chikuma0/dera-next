'use client';

import { useTranslation } from '@/contexts/LanguageContext';
import Link from 'next/link';

export const Footer = () => {
  const { translate } = useTranslation();
  
  return (
    <footer className="w-full text-green-400 py-4 border-t border-green-900/30 mt-4">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex flex-wrap justify-center items-center gap-2 text-sm">
          <Link href="/company" className="hover:text-green-300 transition-colors">
            {translate('footer.companyInfo')}
          </Link>
          <span className="text-green-700">|</span>
          <Link href="/privacy" className="hover:text-green-300 transition-colors">
            {translate('footer.privacyPolicy')}
          </Link>
          <span className="text-green-700">|</span>
          <Link href="/transactions" className="hover:text-green-300 transition-colors">
            {translate('footer.transactions')}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;