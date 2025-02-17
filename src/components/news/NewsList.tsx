'use client';

import React, { useState, useEffect } from 'react';
import { NewsItem } from '@/types/news';
import { useTranslation } from '@/contexts/LanguageContext';
import { Locale } from '@/i18n';

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
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isRefreshing && (
        <div className="text-sm text-green-400 animate-pulse">
          {translate('common.refreshing')}
        </div>
      )}
      {news.map((item) => (
        <article key={item.id} className="group">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-green-400 group-hover:text-green-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                  {item.summary}
                </p>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-xs text-gray-500">
                    {new Date(item.published_date).toLocaleDateString(
                      activeLocale === 'ja' ? 'ja-JP' : 'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.source}
                  </span>
                </div>
              </div>
            </div>
          </a>
        </article>
      ))}
      {news.length === 0 && (
        <div className="text-center text-gray-500">
          No news articles found.
        </div>
      )}
    </div>
  );
}