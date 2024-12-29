"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

const ScoringDebug = () => {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [language, setLanguage] = useState('en');
  const [timeframe, setTimeframe] = useState('24');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/debug/scores?language=${language}&hours=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      console.log('Fetched data:', result); // Debug log
      setData(result);
    } catch (err) {
      console.error('Error fetching debug data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language, timeframe]);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
  };

  const handleReprocess = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setLoading(true);
    try {
      const response = await fetch('/api/debug/reprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, hours: parseInt(timeframe) })
      });
      if (!response.ok) throw new Error('Failed to reprocess articles');
      await fetchData(); // Refresh data after reprocessing
    } catch (err) {
      console.error('Error reprocessing:', err);
      setError(err instanceof Error ? err.message : 'Failed to reprocess articles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-16">
          <h1 className="text-2xl font-bold">Article Scoring Debug Dashboard</h1>
          <div className="flex gap-4">
            <Select 
              value={language} 
              onValueChange={handleLanguageChange}
              name="language"
            >
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={timeframe}
              onValueChange={handleTimeframeChange}
              name="timeframe"
            >
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={handleReprocess}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Reprocess Articles
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {data?.stats && Object.entries(data.stats).map(([key, value]) => (
            <Card key={key} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">{key}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {typeof value === 'number' ? value.toFixed(1) : '0'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Articles */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Top Scored Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topArticles?.map((article: any, index: number) => (
                <div key={index} className="border-b border-gray-700 pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">
                        <a href={article.url} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-400 hover:text-blue-300 hover:underline">
                          {article.title}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-400">
                        {article.source} • {new Date(article.published_date).toLocaleString()}
                      </p>
                      <p className="text-sm mt-1 text-gray-400">
                        Categories: {article.categories?.length ? article.categories.join(', ') : 'No categories'}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                        Score: {article.score?.toFixed(1) || '0'}
                      </span>
                    </div>
                  </div>
                  {article.scoreBreakdown && (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(article.scoreBreakdown).map(([key, value]: [string, any]) => (
                        <div key={key} className="bg-gray-900 p-2 rounded">
                          <span className="text-gray-400 capitalize">{key}: </span>
                          <span className="font-medium text-gray-200">{value.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScoringDebug;