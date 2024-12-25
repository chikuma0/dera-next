'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NewsItem, AICategory } from '@/types/news';

interface NewsSectionProps {
  news: NewsItem[];
  className?: string;
}

export function NewsSection({ news: initialNews, className = '' }: NewsSectionProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<AICategory | null>(null);
  const [news, setNews] = React.useState(initialNews);

  React.useEffect(() => {
    if (!selectedCategory) {
      setNews(initialNews);
      return;
    }

    const filtered = initialNews.filter(item => 
      item.primaryCategory === selectedCategory ||
      item.secondaryCategories?.includes(selectedCategory)
    );

    setNews(filtered);
  }, [selectedCategory, initialNews]);

  return (
    <section className="min-h-screen bg-black text-green-400">
      <div className="container mx-auto px-4 py-20">
        {news.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/20 backdrop-blur-sm border border-green-900 rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">
                    {item.title.ja || item.title.en}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {item.summary.ja || item.summary.en}
                  </p>
                  <div className="flex justify-between items-end">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      Read More →
                    </a>
                    <span className="text-sm text-gray-500">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl">No news articles found</p>
          </div>
        )}
      </div>
    </section>
  );
}
