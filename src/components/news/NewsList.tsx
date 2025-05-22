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

export function NewsList({ language = 'en', autoRefresh }: NewsListProps) {
  const { translate } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNews = React.useCallback(async (refresh: boolean = false) => {
    if (!language) return;
    
    try {
      setIsRefreshing(refresh);
      const response = await fetch(`/api/news?language=${language}${refresh ? '&refresh=true' : ''}`);
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
  }, [language]);

  // Handle language changes and initial fetch
  useEffect(() => {
    console.log('NewsList useEffect - language changed:', language);
    setIsLoading(true);
    setNews([]); // Clear current news before fetching new ones
    fetchNews();
  }, [language, fetchNews]); // Include fetchNews since it's properly memoized

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    // Regular refresh from database (every 30 seconds typically)
    const dbRefreshInterval = setInterval(() => {
      fetchNews(false);
    }, autoRefresh * 1000);

    // Full refresh from RSS sources every 10 minutes
    const fullRefreshInterval = setInterval(() => {
      console.log("Triggering full RSS refresh");
      fetchNews(true);
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      clearInterval(dbRefreshInterval);
      clearInterval(fullRefreshInterval);
    };
  }, [autoRefresh, fetchNews]);

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
      <NewsLeaderboard items={news} />
      {news.length === 0 && (
        <div className="text-center text-green-400 pixel-font mt-8">
          NO NEWS FOUND
        </div>
      )}
    </div>
  );
}
