"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowLeft, ExternalLink, Share2 } from 'lucide-react';
import { NewsItem } from '@/lib/services/newsService';
import { formatDate } from '@/lib/utils/dateUtils';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader } from '../ui/card';
import { NewsletterSubscription } from './NewsletterSubscription';

interface NewsDetailProps {
  newsItem: NewsItem;
}

export function NewsDetail({ newsItem }: NewsDetailProps) {
  if (!newsItem) {
    return null;
  }

  const formattedDate = formatDate(newsItem.published_date);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert('URLがクリップボードにコピーされました。');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
      <div className="flex items-center mb-4">
        <Link 
          href="/news" 
          className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to News</span>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {newsItem.source_logo && (
              <Image
                src={newsItem.source_logo}
                alt={`${newsItem.source_name} logo`}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">{newsItem.source_name}</span>
            <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{formattedDate}</span>
          </div>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Share article"
          >
            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{newsItem.title}</h1>

        {newsItem.image_url && (
          <Image
            src={newsItem.image_url}
            alt={newsItem.title}
            width={800}
            height={400}
            className="w-full h-auto rounded-lg"
          />
        )}

        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{newsItem.summary}</p>

        <div className="flex flex-wrap gap-2">
          {newsItem.categories?.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>

        <a
          href={newsItem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <span>Read original article</span>
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>

      <div className="mt-12">
        <NewsletterSubscription color="blue" />
      </div>
    </div>
  );
} 