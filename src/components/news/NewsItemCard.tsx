import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { formatDate } from '../../lib/utils/dateUtils';
import { TechnicalInsight } from './TechnicalInsight';
import { TranslationService } from '../../lib/services/translationService';

interface NewsItemCardProps {
  item: {
    id: string;
    title: string;
    summary?: string;
    source_id: string;
    published_date: string | Date;
    url: string;
    translated_title?: string;
    translated_summary?: string;
    translation_status?: string;
  };
  showInsights?: boolean;
}

export function NewsItemCard({ item, showInsights = false }: NewsItemCardProps) {
  const { t, i18n } = useTranslation();
  const [showOriginal, setShowOriginal] = useState(false);
  const [technologies, setTechnologies] = useState<string[]>([]);

  const translateItem = useCallback(async () => {
    if (i18n.language === 'ja' && (!item.translated_title || item.translation_status !== 'completed')) {
      try {
        const translationService = new TranslationService();
        await translationService.translateNewsItem(item.id);
      } catch (error) {
        console.error('Error translating news item:', error);
      }
    }
  }, [i18n.language, item.id, item.translated_title, item.translation_status]);

  useEffect(() => {
    translateItem();
  }, [translateItem]);

  const loadTechnologies = async () => {
    // ... existing loadTechnologies code ...
  };

  const displayTitle = i18n.language === 'ja' && !showOriginal && item.translated_title
    ? item.translated_title
    : item.title;

  const displaySummary = i18n.language === 'ja' && !showOriginal && item.translated_summary
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
        {i18n.language === 'ja' && item.translated_title && (
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