import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BlueprintCategory, BlueprintDifficulty, ProgrammingLanguage } from '@/types/blueprint';

export const metadata: Metadata = {
  title: 'フィルタ設定 | AI実装ガイド',
  description: 'AI実装ガイドの検索フィルタ設定',
};

type SearchParams = {
  category?: BlueprintCategory;
  difficulty?: BlueprintDifficulty;
  language?: ProgrammingLanguage;
  query?: string;
};

export default async function FiltersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Get current filter values from searchParams
  const params = await searchParams;
  const currentCategory = params?.category || '';
  const currentDifficulty = params?.difficulty || '';
  const currentLanguage = params?.language || '';
  const currentQuery = params?.query || '';
  
  // Categories
  const categories: { id: BlueprintCategory; name: string }[] = [
    { id: 'chatbot', name: 'チャットボット' },
    { id: 'recommendation-system', name: 'レコメンデーションシステム' },
    { id: 'content-generation', name: 'コンテンツ生成' },
    { id: 'image-recognition', name: '画像認識' },
    { id: 'data-analysis', name: 'データ分析' },
    { id: 'nlp', name: '自然言語処理' },
    { id: 'voice-ai', name: '音声AI' },
    { id: 'other', name: 'その他' }
  ];
  
  // Difficulty levels
  const difficultyLevels: { id: BlueprintDifficulty; name: string }[] = [
    { id: 'beginner', name: '初級' },
    { id: 'intermediate', name: '中級' },
    { id: 'advanced', name: '上級' }
  ];
  
  // Programming languages
  const programmingLanguages: { id: ProgrammingLanguage; name: string }[] = [
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'java', name: 'Java' },
    { id: 'csharp', name: 'C#' },
    { id: 'rust', name: 'Rust' },
    { id: 'go', name: 'Go' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'php', name: 'PHP' }
  ];
  
  // Function to create URL with updated params
  const createFilterUrl = (params: {
    category?: string;
    difficulty?: string;
    language?: string;
    query?: string;
  }) => {
    const urlParams = new URLSearchParams();
    
    if (params.category) urlParams.set('category', params.category);
    if (params.difficulty) urlParams.set('difficulty', params.difficulty);
    if (params.language) urlParams.set('language', params.language);
    if (params.query) urlParams.set('query', params.query);
    
    return `/blueprints?${urlParams.toString()}`;
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link 
          href={createFilterUrl({
            category: currentCategory,
            difficulty: currentDifficulty,
            language: currentLanguage,
            query: currentQuery
          })}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          検索結果に戻る
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          フィルタ設定
        </h1>
        
        <form method="get" action="/blueprints">
          {/* Keep the current query if present */}
          {currentQuery && (
            <input type="hidden" name="query" value={currentQuery} />
          )}
          
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                カテゴリ
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <label 
                    key={category.id} 
                    className={`
                      flex items-center p-3 rounded-md border cursor-pointer
                      ${currentCategory === category.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={currentCategory === category.id}
                      className="sr-only"
                      onChange={() => {}}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
                
                {/* Option to clear category */}
                <label 
                  className={`
                    flex items-center p-3 rounded-md border cursor-pointer
                    ${!currentCategory 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!currentCategory}
                    className="sr-only"
                    onChange={() => {}}
                  />
                  <span>すべて</span>
                </label>
              </div>
            </div>
            
            {/* Difficulty */}
            <div>
              <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                難易度
              </label>
              <div className="flex flex-wrap gap-2">
                {difficultyLevels.map((level) => (
                  <label 
                    key={level.id} 
                    className={`
                      flex items-center p-3 rounded-md border cursor-pointer
                      ${currentDifficulty === level.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={level.id}
                      checked={currentDifficulty === level.id}
                      className="sr-only"
                      onChange={() => {}}
                    />
                    <span>{level.name}</span>
                  </label>
                ))}
                
                {/* Option to clear difficulty */}
                <label 
                  className={`
                    flex items-center p-3 rounded-md border cursor-pointer
                    ${!currentDifficulty 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value=""
                    checked={!currentDifficulty}
                    className="sr-only"
                    onChange={() => {}}
                  />
                  <span>すべて</span>
                </label>
              </div>
            </div>
            
            {/* Programming Language */}
            <div>
              <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                プログラミング言語
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {programmingLanguages.map((lang) => (
                  <label 
                    key={lang.id} 
                    className={`
                      flex items-center p-3 rounded-md border cursor-pointer
                      ${currentLanguage === lang.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang.id}
                      checked={currentLanguage === lang.id}
                      className="sr-only"
                      onChange={() => {}}
                    />
                    <span>{lang.name}</span>
                  </label>
                ))}
                
                {/* Option to clear language */}
                <label 
                  className={`
                    flex items-center p-3 rounded-md border cursor-pointer
                    ${!currentLanguage 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <input
                    type="radio"
                    name="language"
                    value=""
                    checked={!currentLanguage}
                    className="sr-only"
                    onChange={() => {}}
                  />
                  <span>すべて</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/blueprints"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                フィルタを適用
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 