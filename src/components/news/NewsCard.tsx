"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ExternalLink } from 'lucide-react';
import { NewsItem } from '@/types/news';
import { useTranslation } from '@/contexts/LanguageContext';

interface NewsCardProps {
  news: NewsItem;
  isCompact?: boolean;
}

export function NewsCard({ news, isCompact = false }: NewsCardProps) {
  const { locale } = useTranslation();
  // Debug log
  console.log('NewsCard locale:', locale, 'news:', news);
  // Prefer translated title/summary in Japanese
  const displayTitle = locale === 'ja' && news.translated_title ? news.translated_title : news.title;
  const displaySummary = locale === 'ja' && news.translated_summary ? news.translated_summary : news.summary;
  // Helper function to format date
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const publishedDate = formatDate(news.published_date);

  const detailLabel = locale === 'ja' ? '詳細を見る' : 'View details';
  const originalLabel = locale === 'ja' ? '元の記事' : 'Original article';
  const uncategorizedLabel = locale === 'ja' ? '未分類' : 'Uncategorized';

  if (isCompact) {
    return (
      <Link 
        href={`/news/${news.id}`}
        className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-start gap-3">
          {news.image_url && (
            <div className="w-16 h-16 rounded-md overflow-hidden relative flex-shrink-0">
              <Image 
                src={news.image_url} 
                alt={displayTitle}
                fill
                sizes="(max-width: 768px) 100vw, 64px"
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">
              {displayTitle}
            </h3>
            <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3 mr-1" />
              {publishedDate}
            </div>
          </div>
        </div>
      </Link>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700">
      {news.image_url ? (
        <div className="w-full h-48 relative">
          <Image 
            src={news.image_url} 
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            onError={(e) => {
              // Fallback to a placeholder image if the image fails to load
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = '/images/news-placeholder.svg';
            }}
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <img 
            src="/images/news-placeholder.svg" 
            alt="No image available"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center mb-3">
          {news.source_logo && (
            <div className="w-5 h-5 mr-2 relative">
              <Image 
                src={news.source_logo} 
                alt={news.source_name || ''}
                fill
                sizes="20px"
                className="object-contain"
              />
            </div>
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {news.source_name}
          </span>
          <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {publishedDate}
          </span>
        </div>
        
        <Link href={`/news/${news.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {displayTitle}
          </h3>
        </Link>
        
        {displaySummary && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {displaySummary}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {news.categories && news.categories.length > 0 ? (
            news.categories.map((category: string) => (
              <Link 
                key={category} 
                href={`/news/category/${encodeURIComponent(category)}`}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {category}
              </Link>
            ))
          ) : (
            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
              {uncategorizedLabel}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <Link 
            href={`/news/${news.id}`}
            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
          >
            {detailLabel}
          </Link>
          
          <a 
            href={news.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 text-sm flex items-center hover:underline"
          >
            {originalLabel}
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
} 