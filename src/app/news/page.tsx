'use client';

import { Suspense } from 'react';
import { NewsList } from '@/components/news/NewsList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import { useTranslation } from '@/contexts/LanguageContext';

export default function NewsPage() {
  const { translate } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8 mt-20">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          {translate('common.latestAiNews')}
        </h1>
        <p className="text-xl text-gray-400">
          {translate('news.subtitle')}
        </p>
      </div>

      {/* Language Tabs */}
      <Tabs defaultValue="en" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto">
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="ja">日本語</TabsTrigger>
        </TabsList>

        <TabsContent value="en" className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">{translate('news.topStories')}</h2>
                <div className="flex gap-2">
                  <select className="bg-white/5 rounded-lg px-3 py-1 text-sm">
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">トップニュース</h2>
                <div className="flex gap-2">
                  <select className="bg-white/5 rounded-lg px-3 py-1 text-sm">
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