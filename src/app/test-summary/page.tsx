'use client';

import React, { useState } from 'react';
import { ArticleSummary } from '@/components/news/ArticleSummary';

export default function TestSummaryPage() {
  const [showSummary, setShowSummary] = useState(false);
  const testArticle = {
    url: 'https://www.theverge.com/2024/2/15/24073875/openai-sora-text-to-video-ai-generation-model',
    title: 'OpenAI\'s Sora: A Breakthrough in Text-to-Video AI'
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Article Summary Test
          </h1>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {testArticle.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {testArticle.url}
              </p>
            </div>

            <button
              onClick={() => setShowSummary(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Summary
            </button>
          </div>
        </div>
      </div>

      {showSummary && (
        <ArticleSummary
          url={testArticle.url}
          title={testArticle.title}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
} 