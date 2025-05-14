import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function BlueprintNotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
        <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        実装ガイドが見つかりませんでした
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
        お探しの実装ガイドは存在しないか、削除された可能性があります。別のガイドを探すか、トップページに戻ってください。
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/blueprints"
          className="px-5 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ガイド一覧に戻る
        </Link>
        
        <Link
          href="/"
          className="px-5 py-2.5 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          トップページへ
        </Link>
      </div>
    </div>
  );
} 