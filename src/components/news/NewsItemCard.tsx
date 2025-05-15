import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { formatDate } from '../../lib/utils/dateUtils';
import { TechnicalInsight } from './TechnicalInsight';
import { TranslationService } from '../../lib/services/translationService';
import { NewsItem } from '@/types/news';

interface NewsItemCardProps {
  item: NewsItem;
  showInsights?: boolean;
}

export function NewsItemCard({ item, showInsights = false }: NewsItemCardProps) {
  const { locale } = useTranslation();
  const [showOriginal, setShowOriginal] = useState(false);
  const [technologies, setTechnologies] = useState<string[]>([]);

  const translateItem = useCallback(async () => {
    if (locale === 'ja' && (!item.translated_title || item.translation_status !== 'completed')) {
      try {
        const translationService = new TranslationService();
        await translationService.translateNewsItem(item.id);
      } catch (error) {
        console.error('Error translating news item:', error);
      }
    }
  }, [locale, item.id, item.translated_title, item.translation_status]);

  useEffect(() => {
    translateItem();
  }, [translateItem]);

  const loadTechnologies = async () => {
    // ... existing loadTechnologies code ...
  };

  const displayTitle = locale === 'ja' && !showOriginal && item.translated_title
    ? item.translated_title
    : item.title;

  const displaySummary = locale === 'ja' && !showOriginal && item.translated_summary
    ? item.translated_summary
    : item.summary;

  return (
    <div className="p-4 border border-green-400/20 rounded-lg hover:border-green-400/40 transition-colors bg-black/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300"
          >
            {displayTitle}
          </a>
        </h3>
        {locale === 'ja' && item.translated_title && (
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="text-xs text-green-400/60 hover:text-green-300/80"
          >
            {showOriginal ? '日本語で表示' : 'Show Original'}
          </button>
        )}
      </div>
      {displaySummary && (
        <p className="text-sm text-green-300/80 mb-2 line-clamp-2">
          {displaySummary}
        </p>
      )}
      <div className="text-sm text-green-400/60">
        <span>{item.source_id}</span>
        <span className="mx-2">•</span>
        <time dateTime={new Date(item.published_date).toISOString()}>
          {formatDate(item.published_date)}
        </time>
      </div>
      
      {showInsights && (
        <div onClick={loadTechnologies}>
          <TechnicalInsight newsItem={item} technologies={technologies} />
        </div>
      )}
    </div>
  );
} 