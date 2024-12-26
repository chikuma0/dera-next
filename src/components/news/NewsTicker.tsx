'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { NewsItem } from '@/types/news';

interface NewsTickerProps {
  maxItems?: number;
  initialNews?: NewsItem[];
}

export function NewsTicker({ maxItems = 5, initialNews }: NewsTickerProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialNews) {
      async function fetchNews() {
        try {
          const res = await fetch('/api/news');
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data = await res.json();
          if (data.items) {
            setNews(data.items.slice(0, maxItems));
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to fetch news');
          console.error('News fetch error:', e);
        }
      }
      fetchNews();
    }
  }, [maxItems, initialNews]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (news.length === 0) {
    return <div>Loading news...</div>;
  }

  return (
    <div className="bg-black/50 backdrop-blur-sm p-4">
      {news.map(item => (
        <div key={item.id} className="text-white mb-2">
          <a 
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400"
          >
            {item.title} <ArrowUpRight className="inline w-4 h-4" />
          </a>
        </div>
      ))}
    </div>
  );
}