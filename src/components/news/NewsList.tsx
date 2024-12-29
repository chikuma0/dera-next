// components/news/NewsList.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { NewsItem } from '@/types/news';
import { RefreshCw } from 'lucide-react';

interface NewsListProps {
  language?: 'en' | 'ja';
  autoRefresh?: number;
}

export function NewsList({ language = 'en', autoRefresh = 30 }: NewsListProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>();
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      }
      const response = await fetch(
        `/api/news?language=${language}${forceRefresh ? '&refresh=true' : ''}`
      );
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setNews(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [language]); // Add language as dependency

  const handleManualRefresh = async () => {
    await fetchNews(true);
  };

  useEffect(() => {
    fetchNews();

    if (autoRefresh > 0) {
      const interval = setInterval(() => {
        fetchNews(true);
      }, autoRefresh * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [fetchNews, autoRefresh]); // Added fetchNews and autoRefresh as dependencies

  if (loading && !refreshing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {lastUpdated && (
          <div className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}
        
        <button 
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-pulse' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news.map((item) => (
          <article key={item.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-blue-400">{item.source}</span>
              <time className="text-sm text-gray-400">
                {new Date(item.published_date).toLocaleDateString()}
              </time>
            </div>
            
            <h3 className="font-semibold mb-2 hover:text-blue-400 transition">
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </h3>
            
            {item.summary && (
              <p className="text-sm text-gray-400 line-clamp-3">{item.summary}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}