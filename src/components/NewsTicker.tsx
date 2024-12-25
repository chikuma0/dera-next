import React from 'react';
import { motion } from 'framer-motion';
import { NewsItem } from '@/types/news';

interface NewsTickerProps {
  news: NewsItem[];
  className?: string;
}

export function NewsTicker({ news, className = '' }: NewsTickerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const newsItem = news[currentIndex];

  React.useEffect(() => {
    if (news.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [news.length]);

  if (!newsItem) return null;

  return (
    <div className={`bg-black/5 backdrop-blur-sm fixed top-0 left-0 right-0 h-12 flex items-center ${className}`}>
      <div className="container mx-auto px-4 overflow-hidden">
        <motion.div
          key={newsItem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
            AI NEWS
          </span>
          <span className="font-medium truncate">
            {newsItem.title.ja || newsItem.title.en}
          </span>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {new Date(newsItem.publishedAt).toLocaleDateString()}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
