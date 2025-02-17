'use client';

import { Suspense } from 'react';
import { NewsList } from '@/components/news/NewsList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import { useTranslation } from '@/contexts/LanguageContext';

export default function NewsPage() {
  const { translate } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8 mt-20 text-green-400">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {translate('common.latestAiNews')}
        </h1>
        <p className="text-xl text-green-300/80">
          {translate('news.subtitle')}
        </p>
      </div>

      {/* Language Tabs */}
      <Tabs defaultValue="en" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto bg-black/50 p-1 border-2 border-green-400/20">
          <TabsTrigger
            value="en"
            className="data-[state=active]:bg-green-400/20 data-[state=active]:text-green-400 text-green-400/60"
          >
            English
          </TabsTrigger>
          <TabsTrigger
            value="ja"
            className="data-[state=active]:bg-green-400/20 data-[state=active]:text-green-400 text-green-400/60"
          >
            日本語
          </TabsTrigger>
        </TabsList>

        <TabsContent value="en" className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <section>
              <div className="flex justify-end items-center mb-6">
                <div className="flex gap-2">
                  <select className="bg-green-400/5 rounded-lg px-3 py-1 text-sm border border-green-400/20 hover:border-green-400/40 transition-colors">
                    <option value="latest">{translate('news.latest')}</option>
                    <option value="popular">{translate('news.popular')}</option>
                    <option value="trending">{translate('news.trending')}</option>
                  </select>
                </div>
              </div>
              <NewsList language="en" autoRefresh={30} />
            </section>
          </Suspense>
        </TabsContent>

        <TabsContent value="ja" className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <section>
              <div className="flex justify-end items-center mb-6">
                <div className="flex gap-2">
                  <select className="bg-green-400/5 rounded-lg px-3 py-1 text-sm border border-green-400/20 hover:border-green-400/40 transition-colors">
                    <option value="latest">最新</option>
                    <option value="popular">人気</option>
                    <option value="trending">トレンド</option>
                  </select>
                </div>
              </div>
              <NewsList language="ja" autoRefresh={30} />
            </section>
          </Suspense>
        </TabsContent>
      </Tabs>
    </main>
  );
}