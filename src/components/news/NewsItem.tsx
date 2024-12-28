import { NewsItem } from '@/types/news';

export function NewsItemCard({ item }: { item: NewsItem }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">
        <a href={item.url} target="_blank" rel="noopener noreferrer" 
           className="text-blue-600 hover:text-blue-800">
          {item.title}
        </a>
      </h3>
      <div className="text-sm text-gray-600">
        <span>{item.source}</span>
        <span className="mx-2">•</span>
        <span>{new Date(item.publishedDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

// src/components/NewsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { NewsItem } from '@/types/news';
import { NewsItemCard } from './NewsItem';
import { getLatestNews } from '@/lib/rss';

export function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      const items = await getLatestNews();
      setNews(items);
      setLoading(false);
    }

    loadNews();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading news...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {news.map(item => (
        <NewsItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}