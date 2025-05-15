'use client';

import { useTranslation } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import HeroSection to avoid SSR issues
const HeroSection = dynamic(
  () => import('@/components/hero/HeroSection'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black" />
    )
  }
);

const HomeContent = () => {
  const { translate: t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on the server
  if (!isClient) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <>
      <HeroSection />
      
      <div className="container mx-auto px-4 py-16 text-green-400">
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {t('home.title')}
          </h2>
          <p className="text-lg text-center max-w-3xl mx-auto mb-12">
            {t('home.welcome')}
          </p>
          
          <h3 className="text-2xl font-semibold mb-6 text-center">
            {t('home.features.title')}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-green-400/20">
              <h3 className="text-xl font-semibold mb-3 text-green-300">
                {t('home.features.1.title')}
              </h3>
              <p className="text-gray-300">
                {t('home.features.1.description')}
              </p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-green-400/20">
              <h3 className="text-xl font-semibold mb-3 text-green-300">
                {t('home.features.2.title')}
              </h3>
              <p className="text-gray-300">
                {t('home.features.2.description')}
              </p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-green-400/20">
              <h3 className="text-xl font-semibold mb-3 text-green-300">
                {t('home.features.3.title')}
              </h3>
              <p className="text-gray-300">
                {t('home.features.3.description')}
              </p>
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg text-center max-w-2xl mx-auto mb-8">
            {t('home.cta.description')}
          </p>
          <div className="flex justify-center">
            <Link 
              href="/contact" 
              className="px-8 py-3 bg-green-400 text-black font-medium rounded-md hover:bg-green-300 transition-colors"
            >
              {t('home.cta.button')}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomeContent;
