'use client';

import React, { useEffect, useState } from 'react';

interface ArticleSummaryProps {
  url: string;
  title: string;
  onClose?: () => void;
  locale?: string;
}

export const ArticleSummary: React.FC<ArticleSummaryProps> = ({ url, title, onClose, locale = 'ja' }) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/news/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, title, targetLang: locale })
        });
        const data = await res.json();
        if (res.ok) {
          setSummary(data.summary);
        } else {
          setError(data.error || 'Failed to fetch summary');
        }
      } catch (err) {
        setError('Failed to fetch summary');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, title, locale]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="text-lg font-bold mb-2">記事要約 (Summary)</h3>
        {isLoading ? (
          <div className="text-blue-600">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="whitespace-pre-line text-gray-800">{summary}</div>
        )}
      </div>
    </div>
  );
}; 