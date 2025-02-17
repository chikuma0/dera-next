'use client';

import { Suspense, useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TabsList, TabsTrigger, Tabs, TabsContent } from '@/components/ui/tabs';
import { useTranslation } from '@/contexts/LanguageContext';

interface Article {
  title: string;
  published_date: string;
  url: string;
  score: {
    total: number;
    breakdown: {
      keywordScore: number;
      timeDecay: number;
      titleScore: number;
      summaryScore: number;
    };
  };
}

interface TestScoringResponse {
  success: boolean;
  data: {
    english: Article[];
    japanese: Article[];
  };
}

export default function TestScoringPage() {
  const { translate } = useTranslation();
  const [data, setData] = useState<TestScoringResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (refresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      if (refresh) {
        setIsRefreshing(true);
      }

      const response = await fetch(`/api/news/test-scoring${refresh ? '?refresh=true' : ''}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderScoreBreakdown = (article: Article) => {
    const { total, breakdown } = article.score;
    const scores = [
      {
        label: 'Total Score',
        value: total,
        tooltip: 'Overall article score combining all factors'
      },
      {
        label: 'Keyword Score',
        value: breakdown.keywordScore,
        tooltip: 'Score based on AI-related keywords and phrases'
      },
      {
        label: 'Time Relevance',
        value: breakdown.timeDecay,
        tooltip: 'Score based on article freshness (higher for newer articles)'
      },
      {
        label: 'Title Score',
        value: breakdown.titleScore,
        tooltip: 'Score based on AI relevance in the title'
      },
      {
        label: 'Summary Score',
        value: breakdown.summaryScore,
        tooltip: 'Score based on AI relevance in the article summary'
      }
    ];

    return (
      <div className="mt-2 space-y-2 text-sm">
        {scores.map(({ label, value, tooltip }) => (
          <div key={label} className="group relative">
            <div className="flex items-center gap-2">
              <div className="text-gray-400 min-w-[120px] flex items-center gap-1">
                {label}
                <span className="text-gray-600 text-xs">ⓘ</span>
              </div>
              <div className="flex-1 bg-gray-800 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                />
              </div>
              <div className="text-gray-400 min-w-[45px] text-right font-medium">
                {value.toFixed(1)}%
              </div>
            </div>
            <div className="absolute left-0 -top-8 bg-gray-900 text-gray-200 text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none w-48 z-10">
              {tooltip}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderArticles = (articles: Article[]) => {
    return (
      <div className="space-y-6">
        {articles.map((article, index) => (
          <div key={index} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
              <h3 className="text-lg font-semibold mb-2 text-white/90 hover:text-white">{article.title}</h3>
              <div className="text-sm text-gray-400 mb-2">{article.published_date}</div>
              {renderScoreBreakdown(article)}
            </a>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="container mx-auto px-4 py-8 mt-20">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          AI News Scoring Test
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          Analyzing scoring mechanism for English and Japanese articles
        </p>
        <button
          onClick={() => fetchData(true)}
          disabled={loading || isRefreshing}
          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium
            ${(loading || isRefreshing) ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-700'}`}
        >
          {isRefreshing ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner className="w-4 h-4" />
              Refreshing Scores...
            </span>
          ) : (
            'Refresh Scores'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Language Tabs */}
      <Tabs defaultValue="en" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto">
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="ja">日本語</TabsTrigger>
        </TabsList>

        <TabsContent value="en" className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Top Scored English Articles</h2>
              </div>
              {loading ? (
                <LoadingSpinner />
              ) : (
                data && renderArticles(data.data.english)
              )}
            </section>
          </Suspense>
        </TabsContent>

        <TabsContent value="ja" className="space-y-8">
          <Suspense fallback={<LoadingSpinner />}>
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">日本語記事のスコア</h2>
              </div>
              {loading ? (
                <LoadingSpinner />
              ) : (
                data && renderArticles(data.data.japanese)
              )}
            </section>
          </Suspense>
        </TabsContent>
      </Tabs>
    </main>
  );
}