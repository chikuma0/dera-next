'use client';

import { useEffect, useState } from 'react';
import { NewsItem } from '@/types/news';
import { NewsItemCard } from './NewsItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function NewsList({ language = 'en' }: { language?: 'en' | 'ja' }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  async function loadNews(refresh: boolean = false) {
    try {
      setError(null);
      if (!refresh) setLoading(true);
      
      console.log('Client: Fetching news for language:', language);
      const response = await fetch(`/api/news?language=${language}${refresh ? '&refresh=true' : ''}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch news');
      }

      console.log('Client: Received news items:', result.data.length);
      setNews(result.data || []);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load news';
      setError(errorMessage);
      console.error('Client error details:', err);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    loadNews();
  }, [language]);

  // Auto refresh
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadNews(true); // true for refresh
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [language]);

  if (loading && !news.length) {
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

  if (!news.length) {
    return (
      <div className="text-gray-500 py-8 text-center">
        No news articles found
      </div>
    );
  }

  return (
    <div>
      {lastRefresh && (
        <div className="text-sm text-gray-500 mb-4">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {news.map(item => (
          <NewsItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}