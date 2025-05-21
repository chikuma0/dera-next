'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SonarWeeklyDigest, SonarDigestTopic } from '@/lib/services/sonarDigestService';
import DOMPurify from 'dompurify';
import { ArticleSummary } from './ArticleSummary';

interface SonarDigestProps {
  // Props can be added if needed
}

export function SonarDigest({}: SonarDigestProps) {
  const { translate, locale } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [digest, setDigest] = useState<SonarWeeklyDigest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'html' | 'structured'>('structured');
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<{ url: string; title: string } | null>(null);

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchDigest = async () => {
      try {
        setIsLoading(true);
        
        // Check if the URL has a nocache parameter
        const urlParams = new URLSearchParams(window.location.search);
        const nocacheParam = urlParams.get('nocache');
        const noCache = nocacheParam !== null;
        
        // If nocache parameter is present, clear all sonarDigest_ items from localStorage
        if (noCache) {
          console.log('Nocache parameter detected, clearing all sonarDigest_ items from localStorage');
          // Get all keys from localStorage
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sonarDigest_')) {
              localStorage.removeItem(key);
            }
          }
        }
        
        // Check if we have a cached digest in localStorage
        const cacheKey = `sonarDigest_${locale}`;
        const cachedDigestStr = localStorage.getItem(cacheKey);
        const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        
        // Check if there's a server-side last update timestamp
        let serverLastUpdate = null;
        try {
          // Try to fetch the last update timestamp from the server
          const timestampResponse = await fetch('/data/sonar-digest-last-update.json');
          if (timestampResponse.ok) {
            const timestampData = await timestampResponse.json();
            serverLastUpdate = new Date(timestampData.lastUpdated).getTime();
            console.log(`Server last update: ${new Date(serverLastUpdate).toLocaleString()}`);
          }
        } catch (timestampError) {
          console.log('No server timestamp found, using cache age check only');
        }
        
        // Use cached data if conditions are met:
        // 1. nocache is not set
        // 2. We have cached data
        // 3. Either:
        //    a. The cache is less than 7 days old, or
        //    b. The cache is newer than the server's last update
        if (!noCache && cachedDigestStr && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          const cacheAge = now - timestamp;
          const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
          
          // Check if cache is valid (less than a week old or newer than server update)
          const isCacheValid = cacheAge < oneWeekInMs ||
                               (serverLastUpdate && timestamp > serverLastUpdate);
          
          if (isCacheValid) {
            try {
              const cachedDigest = JSON.parse(cachedDigestStr);
              setDigest(cachedDigest);
              setIsLoading(false);
              console.log(`Using cached Sonar digest for ${locale}`);
              return;
            } catch (parseError) {
              console.error('Error parsing cached digest:', parseError);
              // Continue to fetch from API if parsing fails
            }
          } else {
            console.log('Cache is outdated, fetching fresh data');
          }
        }
        
        // Fetch from API if no valid cache exists or nocache is set
        const apiUrl = `/api/news/sonar-digest?language=${locale}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          setError(`Failed to load Sonar digest: ${response.status} ${response.statusText}`);
          return;
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setDigest(data.data);
          
          // Cache the digest in localStorage
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data.data));
            localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
            console.log(`Cached Sonar digest in localStorage for ${locale}`);
          } catch (cacheError) {
            console.error('Error caching digest:', cacheError);
          }
        } else {
          setError(data.error || 'Failed to load Sonar digest');
        }
      } catch (error) {
        console.error('Error fetching Sonar digest:', error);
        setError('Failed to load Sonar digest. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDigest();
  }, [locale, mounted]);

  const formatDate = (dateString: string | Date) => {
    if (!mounted) return ''; // Return empty string during SSR
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return translate('common.invalidDate');
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', options);
  };

  // Sanitize digest.rawHtml to remove nested <a> tags
  function sanitizeHtml(html: string) {
    // Log the raw HTML for inspection
    if (typeof window !== 'undefined') {
      console.log('SonarDigest rawHtml:', html);
    }
    // Remove nested <a> tags using a DOM parser
    if (typeof window !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      // Find all <a> tags inside <a> tags
      doc.querySelectorAll('a a').forEach(nestedAnchor => {
        // Replace the nested <a> with its innerHTML
        const parent = nestedAnchor.parentElement;
        if (parent) {
          parent.replaceChild(document.createTextNode(nestedAnchor.textContent || ''), nestedAnchor);
        }
      });
      // Serialize back to string
      html = doc.body.innerHTML;
    }
    // Use DOMPurify to sanitize
    return typeof window !== 'undefined' ? DOMPurify.sanitize(html) : html;
  }

  // Return a loading state during SSR
  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    // Check if the error is about the API key or a 404
    const isApiKeyError = error.includes('API key') || error.includes('Perplexity');
    const is404Error = error.includes('404');
    
    return (
      <div className="bg-black/40 border-2 border-red-400 rounded-lg p-6 text-center">
        <h3 className="text-red-400 text-xl mb-2">Error</h3>
        <p className="text-red-300">{error}</p>
        
        <div className="mt-4 p-4 bg-black/60 rounded-lg">
          <p className="text-yellow-300 mb-2">
            This feature requires a Perplexity API key to generate AI news digests.
          </p>
          <p className="text-yellow-300 mb-4">
            Please add your API key to the environment variables as PERPLEXITY_API_KEY.
          </p>
          <a
            href="https://docs.perplexity.ai/docs/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Get a Perplexity API Key
          </a>
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="bg-black/40 border-2 border-yellow-400 rounded-lg p-6 text-center">
        <h3 className="text-yellow-400 text-xl mb-2">No Sonar Digest Available</h3>
        <p className="text-yellow-300 mb-4">
          There is no Sonar digest available yet. Check back later for our AI-powered weekly digest of viral and valuable AI news.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-300">
          {error}
        </div>
      ) : digest ? (
        <div className="space-y-8">
      {/* Enhanced Background with Cosmic Theme */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c4zIgLAAABvklEQVR4Ac3RBQEDMRAAwe1YbO7Q/5bJ/G0TaUUqJRNZJFGiYGw6RMnY+TQGG8pIwiYkFMYm5BQWbEJJYcUmVBQ2bEJDYccmdBQObEJP4cQmDBQubMJI4cYmTBQebMJM4cUmLBQ+bMJK4ccmbBQBbMJOEcImnBQhbMJFEcYm3BQRbMJDEcUmvBQxbMJHEccm/BQJbCJAkcQmQhQpbCJMkcYmIhQZbCJKkcUmYhQ5bCJOkcf+lYhQFP6ZiFFUMGwiSlHDJuIUDWwiQdHCJpIUHWwiRdHDJtIUA2wiQzHEJrIUI2wiRzHGJvIUE2yiQDHFJooUM2yiRDHHJsoUC2yiQrHEJqoUK2yiRrHGJuoUG2yiQbHFJpoUO2yiRbHHJtoUB2yiQ3HEJroUJ2yiR3HGJvoUF2xiQHHFJoYUN2xiRHHHJsYUD2xiQvHEJqYUT2xiRvHCJuYUb2xiQfHBJpYUX2xiRfHDJtYUf2xiQ/HHJrYUAXZiRxFiF04UYXbhQhFhF24UUXbhQRFjF14UcXbhQ5FgF34USXYRQJFiFyEUaXYRQZFhF1EUWXYRQ5FjF3EUeXaRQFFgF0kUJXaRQlFmFxkUFXaRRVFlF3kUNXZRQFFnFyUUDXZRRdFkF3UUbXbRQNFhF00UXXbRQtFjF20UfXbRQTFgF10UI3bRQzFmF30UE3YxQDFlF0MUc3YxQrFgF2MUK3YxQbFmF1MUG3YxQ7FlF3MUO3axQLFnF0sUB3axQnFkF1sUJ3axQXFmF1sUF3axQ3FlF3sUN3ZxQPFgF0cUT3ZxQvFiF2cUb3ZxQfFhF1cUX3ZxQ/FjFzcUf3bxQAlgFy+UEHbxRgljFx+UKHbxRYlhFz+UOHbxR0lgFwFKCrsIUdLYRYSSwS6ilCx2EaPksIs4JY9dJCgF7CJJKWIXKUoZu0hTKthFhlLFLrKUGnaRo9SxizylgV0UKPW/d1GkNLGLEqWFXZQpbeyi8vcu/gHYPQaR7h8cDQAAAABJRU5ErkJggg==')] opacity-5 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-purple-900/10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-purple-900/10 to-purple-900/20 mix-blend-overlay"></div>
        {/* Add subtle animated stars */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="stars-1"></div>
          <div className="stars-2"></div>
          <div className="stars-3"></div>
        </div>
      </div>
      
      <div className="relative z-10">
        {/* Enhanced Header with Weekly Badge */}
        <div className="border-b-4 border-purple-500/70 mb-6 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="flex items-center mb-2">
                    <span className="bg-purple-600/80 text-white text-xs font-bold px-2 py-1 rounded-full mr-2 uppercase tracking-wider">
                      {locale === 'ja' ? '週間版' : 'Weekly Edition'}
                    </span>
                    <span className="text-purple-300/70 text-sm">{formatDate(digest.date)}</span>
              </div>
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200">
                    {locale === 'ja' ? 'SONAR AI ニュースダイジェスト' : 'SONAR AI NEWS DIGEST'}
                  </h1>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button
                onClick={() => setActiveTab('structured')}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'structured'
                    ? 'bg-purple-500/30 text-purple-200 border-b-2 border-purple-400'
                    : 'text-purple-400/60 hover:text-purple-300/80 hover:bg-purple-500/10'
                }`}
              >
                    {locale === 'ja' ? '構造化' : 'Structured'}
              </button>
              <button
                onClick={() => setActiveTab('html')}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'html'
                    ? 'bg-purple-500/30 text-purple-200 border-b-2 border-purple-400'
                    : 'text-purple-400/60 hover:text-purple-300/80 hover:bg-purple-500/10'
                }`}
              >
                    {locale === 'ja' ? '生HTML' : 'Raw HTML'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Structured View */}
        {activeTab === 'structured' && (
          <div>
            <div className="bg-black/70 border-2 border-purple-500/40 rounded-lg p-6 mb-6 backdrop-blur-sm shadow-lg">
              {/* Weekly Summary Section */}
              <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-4 font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-purple-100">{digest.title}</h2>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-lg text-purple-200/90 leading-relaxed">{digest.summary}</p>
                </div>
              </div>
              
                  {/* Topics */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-purple-200">
                      {locale === 'ja' ? '今週のAIトピック TOP 5' : 'TOP 5 AI TOPICS THIS WEEK'}
                    </h2>
                    {digest.topics.map((topic, index) => (
                      <div
                        key={index}
                        className="bg-black/40 border border-purple-500/30 rounded-lg p-6"
                      >
                        <h3 className="text-xl font-semibold text-purple-200 mb-4">
                          {topic.title}
                        </h3>
                        <div className="prose prose-invert max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(topic.summary) }} />
                        </div>
                        {topic.citations && topic.citations.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium text-purple-300">
                              {locale === 'ja' ? '参考記事' : 'Sources'}
                            </h4>
                            <ul className="space-y-2">
                              {topic.citations.map((citation, citationIndex) => (
                                <li key={citationIndex}>
                                  <button
                                    onClick={() => setSelectedArticle({ url: citation.url, title: citation.title })}
                                    className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                                  >
                                    {citation.title}
                                    {locale === 'ja' && ' (元の記事を読む)'}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
              </div>
              
              {/* Technology Insights Section */}
                {digest.topics && digest.topics.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center mb-4">
                      <h3 className="text-2xl font-bold font-serif text-purple-300 mr-3">
                        {locale === 'ja' ? '技術的洞察' : 'TECHNOLOGY INSIGHTS'}
                      </h3>
                    <div className="flex-grow h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                  </div>
                  
                  <div className="bg-black/70 border-2 border-purple-500/40 rounded-lg p-6 backdrop-blur-sm shadow-lg">
                    <p className="text-purple-200/90 mb-4">
                        {locale === 'ja'
                          ? 'このダイジェストで言及されている技術の詳細なトレンド分析と影響評価を探索してください。'
                          : 'Explore detailed trend analysis and impact assessment for the technologies mentioned in this digest.'}
                    </p>
                    <Link
                      href="/news/technology-trends"
                      className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                        {locale === 'ja' ? '技術トレンドダッシュボードを表示' : 'View Technology Trends Dashboard'}
                    </Link>
                  </div>
                </div>
              )}
          </div>
        )}
        
        {/* Raw HTML View */}
        {activeTab === 'html' && (
          <div className="bg-black/60 border-2 border-purple-400/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
            <div 
              className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(digest.rawHtml) }}
            />
          </div>
        )}
        
        {/* Enhanced Footer */}
        <div className="text-center border-t border-purple-500/30 pt-4 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-purple-400/70 mb-2 md:mb-0">
                  <p className="font-medium">
                    {locale === 'ja'
                      ? `週間Sonar AIニュースダイジェスト • ${formatDate(digest.publishedAt)}に生成`
                      : `Weekly Sonar AI News Digest • Generated on ${formatDate(digest.publishedAt)}`}
                  </p>
            </div>
            <div className="flex items-center">
                  <span className="text-xs text-purple-400/60 mr-2">
                    {locale === 'ja' ? '提供:' : 'Powered by'}
                  </span>
              <span className="bg-purple-900/40 text-purple-200 text-xs font-bold px-2 py-1 rounded">xAI&apos;s Sonar API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Article Summary Modal */}
      {selectedArticle && (
        <ArticleSummary
          url={selectedArticle.url}
          title={selectedArticle.title}
          onClose={() => setSelectedArticle(null)}
        />
      )}

        {/* CSS for animated stars */}
        <style jsx>{`
          @keyframes twinkle {
            0% { opacity: 0.3; }
            50% { opacity: 0.8; }
            100% { opacity: 0.3; }
          }
          
          .stars-1, .stars-2, .stars-3 {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image:
              radial-gradient(1px 1px at 25px 5px, white, rgba(255,255,255,0)),
              radial-gradient(1px 1px at 50px 25px, white, rgba(255,255,255,0)),
              radial-gradient(1px 1px at 125px 20px, white, rgba(255,255,255,0)),
              radial-gradient(1.5px 1.5px at 50px 75px, white, rgba(255,255,255,0)),
              radial-gradient(2px 2px at 15px 125px, white, rgba(255,255,255,0)),
              radial-gradient(2.5px 2.5px at 110px 80px, white, rgba(255,255,255,0));
            z-index: 1;
          }
          
          .stars-1 {
            animation: twinkle 4s ease-in-out infinite;
          }
          
          .stars-2 {
            background-position: 50px 50px;
            animation: twinkle 5s ease-in-out infinite 1s;
          }
          
          .stars-3 {
            background-position: 100px 100px;
            animation: twinkle 6s ease-in-out infinite 2s;
          }
        `}</style>
    </div>
  );
}