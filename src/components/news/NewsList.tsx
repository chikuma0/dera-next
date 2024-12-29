// components/news/NewsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { NewsItem } from '@/types/news';

interface NewsListProps {
  language?: 'en' | 'ja';
  autoRefresh?: number; // minutes
}

export function NewsList({ language = 'en', autoRefresh = 30 }: NewsListProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>();

  const fetchNews = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
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
    }
  };

  useEffect(() => {
    fetchNews();

    // Set up auto-refresh
    if (autoRefresh > 0) {
      const interval = setInterval(() => {
        fetchNews(true); // Force refresh from sources
      }, autoRefresh * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [language, autoRefresh]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {lastUpdated && (
        <div className="text-sm text-gray-400">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
      
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