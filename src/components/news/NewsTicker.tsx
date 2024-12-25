'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsItem } from '@/types/news';
import { Terminal } from 'lucide-react';

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
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, [news.length]);

  if (!newsItem) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 h-12 bg-black/80 backdrop-blur-sm z-50 ${className}`}>
      <div className="container mx-auto h-full px-4">
        <AnimatePresence mode='wait'>
          <motion.div
            key={newsItem.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between h-full text-green-400"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Terminal className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                {newsItem.title.ja || newsItem.title.en}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-green-400/10 px-2 py-1 rounded">
                {newsItem.primaryCategory}
              </span>
              <a
                href={newsItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:text-green-300 transition-colors"
              >
                Read More →
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
