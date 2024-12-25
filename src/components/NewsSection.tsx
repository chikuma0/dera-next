import React from 'react';
import { motion } from 'framer-motion';
import { NewsItem, AIApplication } from '@/types/news';

interface NewsSectionProps {
  news: NewsItem[];
  className?: string;
}

const categoryColors: Record<AIApplication, { bg: string; text: string }> = {
  [AIApplication.GENERATIVE_AI]: { bg: 'bg-purple-100', text: 'text-purple-800' },
  [AIApplication.COMPUTER_VISION]: { bg: 'bg-green-100', text: 'text-green-800' },
  [AIApplication.NATURAL_LANGUAGE]: { bg: 'bg-blue-100', text: 'text-blue-800' },
  [AIApplication.AUTOMATION]: { bg: 'bg-orange-100', text: 'text-orange-800' },
  [AIApplication.AI_SECURITY]: { bg: 'bg-red-100', text: 'text-red-800' },
  [AIApplication.DECISION_MAKING]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [AIApplication.PROCESS_OPTIMIZATION]: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  [AIApplication.PREDICTIVE_ANALYTICS]: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  [AIApplication.CUSTOMER_SERVICE]: { bg: 'bg-pink-100', text: 'text-pink-800' },
  [AIApplication.AUTONOMOUS_SYSTEMS]: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  [AIApplication.AI_INFRASTRUCTURE]: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export function NewsSection({ news, className = '' }: NewsSectionProps) {
  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Latest AI News & Insights</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-medium px-2 py-1 rounded
                    ${categoryColors[item.applicationCategory.primary].bg}
                    ${categoryColors[item.applicationCategory.primary].text}`}
                  >
                    {item.applicationCategory.primary.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {item.title.ja || item.title.en}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {item.summary.ja || item.summary.en}
                </p>
                
                <div className="flex items-center justify-between">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Read more →
                  </a>
                  
                  {item.applicationCategory.secondary && item.applicationCategory.secondary.length > 0 && (
                    <div className="flex gap-1">
                      {item.applicationCategory.secondary.map(cat => (
                        <span
                          key={cat}
                          className={`text-xs px-1.5 py-0.5 rounded
                            ${categoryColors[cat].bg} ${categoryColors[cat].text}`}
                        >
                          {cat.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
