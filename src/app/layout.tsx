import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from '@/components/ui/Header';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { headers } from 'next/headers';
import { Locale } from "@/i18n";
import MatrixBackground from "@/components/hero/MatrixBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DERA",
  description: "AI Horsepower for Distributed Era",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'en';

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider initialLocale={locale as Locale}>
          <MatrixBackground />
          <Header />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
