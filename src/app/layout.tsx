import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DERA - AI Solutions',
  description: 'Forward-thinking company specializing in leveraging artificial intelligence (AI) to deliver high-quality, efficient solutions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
