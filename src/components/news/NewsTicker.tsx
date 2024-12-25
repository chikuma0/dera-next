'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NewsItem } from '@/types';
import { Terminal } from 'lucide-react';

interface NewsTickerProps {
  items: NewsItem[];
}

export function NewsTicker({ items }: NewsTickerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div className="bg-black/80 border-t border-b border-green-900 py-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-4">
          <Terminal className="text-green-400" size={20} />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-green-400 font-mono"
            >
              {items[currentIndex]?.title || 'Loading news...'}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
