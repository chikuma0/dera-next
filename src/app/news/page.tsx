'use client';

import { Suspense } from 'react';
import { NewsList } from '@/components/news/NewsList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/contexts/LanguageContext';

export default function NewsPage() {
  const { translate, locale } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8 mt-20 text-green-400">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {translate('common.latestAiNews')}
        </h1>
        <p className="text-xl text-green-300/80">
          {translate('news.subtitle')}
        </p>
      </div>

      <div className="space-y-8">
        <div className="mt-8">
          <Suspense fallback={<LoadingSpinner />}>
            <section>
              <NewsList language={locale} autoRefresh={30} key={`${locale}-news`} />
            </section>
          </Suspense>
        </div>
      </div>
    </main>
  );
}