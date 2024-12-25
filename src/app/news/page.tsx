'use client';

import { useEffect, useState } from 'react';
import { NewsService } from '@/lib/news/news-service';
import { NewsSection } from '@/components/news/NewsSection';
import type { NewsItem } from '@/types/index';

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsService = new NewsService();
        const data = await newsService.fetchAllNews();
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-green-400">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl animate-pulse">Loading AI News...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <NewsSection news={news} />
    </main>
  );
}
