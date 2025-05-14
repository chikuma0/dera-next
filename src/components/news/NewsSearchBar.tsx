"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export function NewsSearchBar() {
  const { locale } = useTranslation();
  return (
    <div className="relative w-full sm:w-auto">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-80 pl-10 p-2.5"
        placeholder={locale === 'ja' ? 'ニュースを検索...' : 'Search news...'}
        disabled // Will be enabled when we implement search
      />
    </div>
  );
} 