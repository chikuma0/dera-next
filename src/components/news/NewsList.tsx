'use client';

import { useEffect, useState } from 'react';
import { NewsItem } from '@/types/news';
import { NewsItemCard } from './NewsItem';
import { getLatestNews } from '@/lib/news/fetcher';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function NewsList({ language = 'en' }: { language?: 'en' | 'ja' }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNews() {
      try {
        setLoading(true);
        setError(null);
        const items = await getLatestNews(language);
        if (mounted) {
          setNews(items);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load news');
          console.error(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      mounted = false;
    };
  }, [language]);

  if (loading) {
    return (
      <div className="py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 py-8 text-center">
        {error}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-gray-500 py-8 text-center">
        No news articles found
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {news.map(item => (
        <NewsItemCard key={item.id} item={item} />
      ))}
    </div>
  );
} 