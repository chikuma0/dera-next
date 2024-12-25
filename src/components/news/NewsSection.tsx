'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { NewsItem, AICategory } from '@/types/news';
import { Terminal, Calendar, MessageSquare, ThumbsUp } from 'lucide-react';

interface NewsSectionProps {
  news: NewsItem[];
  className?: string;
}

const categoryColors: Record<AICategory, { bg: string; text: string; border: string }> = {
  [AICategory.GENERATIVE_AI]: { 
    bg: 'bg-purple-400/10', 
    text: 'text-purple-400',
    border: 'border-purple-400/20'
  },
  [AICategory.COMPUTER_VISION]: { 
    bg: 'bg-green-400/10', 
    text: 'text-green-400',
    border: 'border-green-400/20'
  },
  [AICategory.NATURAL_LANGUAGE]: { 
    bg: 'bg-blue-400/10', 
    text: 'text-blue-400',
    border: 'border-blue-400/20'
  },
  [AICategory.AI_INFRASTRUCTURE]: { 
    bg: 'bg-gray-400/10', 
    text: 'text-gray-400',
    border: 'border-gray-400/20'
  },
  [AICategory.AI_SECURITY]: { 
    bg: 'bg-red-400/10', 
    text: 'text-red-400',
    border: 'border-red-400/20'
  },
  [AICategory.AI_RESEARCH]: { 
    bg: 'bg-yellow-400/10', 
    text: 'text-yellow-400',
    border: 'border-yellow-400/20'
  },
  [AICategory.BUSINESS_AI]: { 
    bg: 'bg-indigo-400/10', 
    text: 'text-indigo-400',
    border: 'border-indigo-400/20'
  },
  [AICategory.INDUSTRY_SPECIFIC]: { 
    bg: 'bg-orange-400/10', 
    text: 'text-orange-400',
    border: 'border-orange-400/20'
  },
  [AICategory.AI_ETHICS]: { 
    bg: 'bg-pink-400/10', 
    text: 'text-pink-400',
    border: 'border-pink-400/20'
  }
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit' 
  }).format(date);
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
    <section className={`py-20 bg-black/95 text-green-400 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Terminal className="w-8 h-8" />
            AI News & Insights
          </h2>
          
          <div className="flex gap-2 overflow-x-auto pb-2 max-w-[60%]">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors
                ${!selectedCategory ? 'bg-green-400/20 text-green-400' : 'bg-green-400/5 hover:bg-green-400/10'}`}
            >
              All Categories
            </button>
            {Object.entries(categoryColors).map(([category, colors]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as AICategory)}
                className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors
                  ${selectedCategory === category ? colors.bg : 'bg-gray-800/50 hover:bg-gray-800'}
                  ${selectedCategory === category ? colors.text : 'text-gray-400'}`}
              >
                {category.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item, index) => {
            const colors = categoryColors[item.primaryCategory];
            
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-black border rounded-lg overflow-hidden transition-shadow hover:shadow-lg
                  ${colors.border}`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
                      {item.primaryCategory.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-3 line-clamp-2 min-h-[3.5rem]">
                    {item.title.ja || item.title.en}
                  </h3>
                  
                  <p className="text-gray-400 mb-4 line-clamp-3 min-h-[4.5rem]">
                    {item.summary.ja || item.summary.en}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(item.publishedAt)}
                      </span>
                      {item.engagement && (
                        <div className="flex items-center gap-3">
                          {item.engagement.comments && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {item.engagement.comments}
                            </span>
                          )}
                          {item.engagement.points && (
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {item.engagement.points}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      Read More →
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
