'use client';
// components/news/NewsList.tsx

import React from 'react';
import { NewsItem } from '@/types/news';
import Link from 'next/link';

interface NewsListProps {
  news: NewsItem[];
  language?: string;
}

export function NewsList({ news, language = 'en' }: NewsListProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {news.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400">
            No news items available. Try refreshing or check back later.
          </div>
        ) : (
          news.map((item) => (
            <article key={item.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-blue-400">{item.source}</span>
                <time className="text-sm text-gray-400">
                  {new Date(item.published_date).toISOString().split('T')[0]}
                </time>
              </div>
              <h3 className="font-semibold mb-2 hover:text-blue-400 transition">
                <Link href={`news/${item.id}`} className="block">
                  {item.title}
                </Link>
              </h3>
              {item.summary && (
                <p className="text-sm text-gray-400 line-clamp-3">
                  {item.summary.replace(/<[^>]*>/g, '')}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}