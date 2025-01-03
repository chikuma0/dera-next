import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { NewsItem } from '@/types/news'; // Make sure to import the NewsItem type

const MatrixNewsTicker = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news?language=en');
        const data = await response.json();
        if (data.success && data.data) {
          const sortedNews = data.data
            .sort((a: NewsItem, b: NewsItem) => 
              new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
            )
            .slice(0, 10);
          setNews(sortedNews);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((current) => (current + 1) % news.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [news.length]);

  if (isLoading) {
    return (
      <div className="w-full text-green-400 py-3">
        <div className="container mx-auto">
          <div className="h-8 animate-pulse bg-green-900/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full text-green-400 py-3"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center space-x-2 px-4">
          <div className="flex-shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex-shrink-0">
            <span className="px-2 py-1 text-xs font-medium border border-green-400 rounded">
              LATEST AI INTEL
            </span>
          </div>
          <div className="flex-1 relative h-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center"
              >
                <a 
                  href={news[currentIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-300 transition-colors truncate text-sm"
                >
                  <span className="truncate">{news[currentIndex].title}</span>
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex-shrink-0 text-sm font-mono">
            [{currentIndex + 1}/{news.length}]
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MatrixNewsTicker;