'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { NewsItem } from '@/types/news';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { Locale } from '@/i18n';

interface MatrixNewsTickerProps {
  language?: Locale;
}

const MatrixNewsTicker = ({ language }: MatrixNewsTickerProps) => {
  const { locale: contextLocale, translate } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Use provided language prop or fall back to context locale
  const activeLocale = language || contextLocale;

  useEffect(() => {
    let mounted = true;

    const fetchNews = async () => {
      try {
        const response = await fetch(`/api/news?language=${activeLocale}`);
        const data = await response.json();
        if (mounted && data.success && data.data) {
          // News items are already sorted by importance_score and limited to 10 from the API
          setNews(data.data);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      mounted = false;
    };
  }, [activeLocale]);

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
      <div className="w-full text-green-400 py-2 sm:py-3">
        <div className="container mx-auto px-4">
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
      className="w-full text-green-400 py-2 sm:py-3"
    >
      <div className="container mx-auto max-w-4xl px-4">
        <Link href="/news" className="block group">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 hidden sm:block">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex-shrink-0">
              <span className="px-2 py-1 text-xs font-medium border border-green-400 rounded group-hover:bg-green-400/10 transition-colors">
                {translate('common.latestAiNews')}
              </span>
            </div>
            <div className="flex-1 relative h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center"
                >
                  <div className="hover:text-green-300 transition-colors truncate text-sm flex items-center gap-2 w-full">
                    <span className="truncate">{news[currentIndex].title}</span>
                    <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:inline-block">
                      {translate('common.viewAllNews')} →
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex-shrink-0 text-sm font-mono hidden sm:block">
              [{currentIndex + 1}/{news.length}]
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

export default MatrixNewsTicker;