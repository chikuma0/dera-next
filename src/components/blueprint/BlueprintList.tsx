import React from 'react';
import Link from 'next/link';
import { Search, Sliders, FilterX } from 'lucide-react';
import { BlueprintCategory, BlueprintDifficulty, ProgrammingLanguage } from '@/types/blueprint';
import { BlueprintCard } from './BlueprintCard';
import BlueprintService from '@/services/blueprintService';

type SearchParams = {
  category?: BlueprintCategory;
  difficulty?: BlueprintDifficulty;
  language?: ProgrammingLanguage;
  query?: string;
  page?: string;
};

type FilterLabels = {
  [key: string]: string;
};

export default async function BlueprintList({ searchParams }: { searchParams: SearchParams }) {
  const blueprintService = new BlueprintService();
  
  // Get filter parameters from URL
  const category = searchParams?.category;
  const difficulty = searchParams?.difficulty;
  const language = searchParams?.language;
  const query = searchParams?.query;
  const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  
  // Fetch blueprints with filters
  const { data: blueprints, count } = await blueprintService.getPublishedBlueprints({
    category,
    difficulty,
    programmingLanguage: language,
    searchTerm: query,
    page,
    limit: 9, // Show 9 items per page
  });
  
  // Calculate pagination info
  const totalPages = Math.ceil(count / 9);
  
  // Format the filter display string
  const formatFilterDisplay = () => {
    const filters = [];
    if (category) {
      const categoryLabels: FilterLabels = {
        'chatbot': 'チャットボット',
        'recommendation-system': 'レコメンデーションシステム',
        'content-generation': 'コンテンツ生成',
        'image-recognition': '画像認識',
        'data-analysis': 'データ分析',
        'nlp': '自然言語処理',
        'voice-ai': '音声AI',
        'other': 'その他'
      };
      filters.push(`カテゴリ: ${categoryLabels[category] || category}`);
    }
    
    if (difficulty) {
      const difficultyLabels: FilterLabels = {
        'beginner': '初級',
        'intermediate': '中級', 
        'advanced': '上級'
      };
      filters.push(`難易度: ${difficultyLabels[difficulty] || difficulty}`);
    }
    
    if (language) {
      const languageLabels: FilterLabels = {
        'python': 'Python',
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'java': 'Java',
        'csharp': 'C#',
        'rust': 'Rust',
        'go': 'Go',
        'ruby': 'Ruby',
        'php': 'PHP'
      };
      filters.push(`言語: ${languageLabels[language] || language}`);
    }
    
    if (query) {
      filters.push(`検索: ${query}`);
    }
    
    return filters.length > 0 ? filters.join(' / ') : '';
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          AI実装ガイド
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          グローバルAIトレンドを日本のビジネスに実装するための実践的なガイド集
        </p>
      </div>
      
      {/* Search and filters */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full md:w-auto">
            <form action="/blueprints" method="get">
              {/* Preserve existing filters in hidden inputs */}
              {category && <input type="hidden" name="category" value={category} />}
              {difficulty && <input type="hidden" name="difficulty" value={difficulty} />}
              {language && <input type="hidden" name="language" value={language} />}
              
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="query"
                placeholder="ガイドを検索..."
                defaultValue={query}
                className="block w-full md:w-80 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              />
            </form>
          </div>
          
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Link 
              href={{
                pathname: '/blueprints/filters',
                query: { ...searchParams }
              }}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Sliders className="h-4 w-4 mr-2" />
              絞り込み
            </Link>
            
            {(category || difficulty || language || query) && (
              <Link 
                href="/blueprints"
                className="flex items-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-md bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <FilterX className="h-4 w-4 mr-2" />
                フィルタをクリア
              </Link>
            )}
          </div>
        </div>
        
        {/* Active filters display */}
        {(category || difficulty || language || query) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium">フィルタ:</span> {formatFilterDisplay()}
            </p>
          </div>
        )}
      </div>
      
      {/* Results */}
      {blueprints.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blueprints.map((blueprint) => (
              <BlueprintCard key={blueprint.id} blueprint={blueprint} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-1">
                {page > 1 && (
                  <Link
                    href={{
                      pathname: '/blueprints',
                      query: { ...searchParams, page: page - 1 }
                    }}
                    className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    前へ
                  </Link>
                )}
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={{
                      pathname: '/blueprints',
                      query: { ...searchParams, page: pageNum }
                    }}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
                
                {page < totalPages && (
                  <Link
                    href={{
                      pathname: '/blueprints',
                      query: { ...searchParams, page: page + 1 }
                    }}
                    className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    次へ
                  </Link>
                )}
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            ガイドが見つかりませんでした
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            検索条件に一致するガイドはありません。フィルタを変更して再試行してください。
          </p>
          <Link 
            href="/blueprints"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            すべてのガイドを表示
          </Link>
        </div>
      )}
      
      {/* Pro Plan CTA */}
      <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden shadow-lg">
        <div className="px-6 py-8 md:p-10 md:flex md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-white sm:text-3xl">
              さらに多くの実装ガイドにアクセス
            </h3>
            <p className="mt-3 max-w-3xl text-lg text-blue-100">
              プロフェッショナルプランにアップグレードして、すべての実装ガイドにアクセスしましょう。
            </p>
          </div>
          <div className="mt-8 md:mt-0 md:ml-8">
            <Link
              href="/subscription"
              className="inline-flex px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:px-8 md:text-lg"
            >
              プランを見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 