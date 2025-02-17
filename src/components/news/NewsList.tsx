'use client';

import React, { useState, useEffect } from 'react';
import { NewsItem } from '@/types/news';
import { useTranslation } from '@/contexts/LanguageContext';
import { Locale } from '@/i18n';
import { NewsLeaderboard } from '@/components/ui/NewsLeaderboard';

interface NewsListProps {
  language?: Locale;
  autoRefresh?: number; // Refresh interval in seconds
}

export function NewsList({ language, autoRefresh }: NewsListProps) {
  const { locale: contextLocale, translate } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use provided language prop or fall back to context locale
  const activeLocale = language || contextLocale;

  const fetchNews = async (refresh: boolean = false) => {
    try {
      setIsRefreshing(refresh);
      const response = await fetch(`/api/news?language=${activeLocale}${refresh ? '&refresh=true' : ''}`);
      const data = await response.json();
      if (data.success && data.data) {
        setNews(data.data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeLocale]);

  // Set up auto-refresh if interval is provided
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchNews(true);
      }, autoRefresh * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, activeLocale]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-green-400/20 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-green-400/20 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {isRefreshing && (
          <div className="text-sm text-green-400 animate-pulse pixel-font">
            {translate('common.refreshing')}
          </div>
        )}
        <button
          onClick={() => fetchNews(true)}
          disabled={isRefreshing}
          className="ml-auto px-3 py-1 bg-green-400/10 hover:bg-green-400/20 text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm border border-green-400/20 hover:border-green-400/40"
        >
          {isRefreshing ? '...' : '↻ Refresh'}
        </button>
      </div>
      <NewsLeaderboard items={news} />
      {news.length === 0 && (
        <div className="text-center text-green-400 pixel-font mt-8">
          NO NEWS FOUND
        </div>
      )}
    </div>
  );
}