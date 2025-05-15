import './globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/ui/Header';
import { cookies } from 'next/headers';
import { locales } from '@/i18n';

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: 'DERA - AI Solutions for the Future',
  description: 'DERA provides cutting-edge AI solutions to help businesses transform and innovate.',
};

export default async function RootLayout({ children }: Props) {
  // Get initial locale from cookie or default to 'en'
  const cookieStore = await cookies();
  const initialLocale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  
  // Validate locale
  const locale = locales.includes(initialLocale as any) ? initialLocale : 'en';

  return (
    <html lang={locale}>
      <body>
        <LanguageProvider initialLocale={locale as any}>
          <div className="min-h-screen bg-black text-green-400">
            <Header locale={locale} />
            <main className="min-h-screen pt-20">
              {children}
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}