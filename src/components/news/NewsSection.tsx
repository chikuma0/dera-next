'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { NewsItem } from '@/types';

interface NewsSectionProps {
  items: NewsItem[];
}

export function NewsSection({ items }: NewsSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.length > 0 ? (
        items.map((item, index) => (
          <motion.article
            key={item.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-black/20 backdrop-blur-sm border border-green-900 rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
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
        ))
      ) : (
        <div className="col-span-full text-center py-20">
          <p className="text-xl">No news articles found</p>
        </div>
      )}
    </div>
  );
}
