'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SonarWeeklyDigest, SonarDigestTopic } from '@/lib/services/sonarDigestService';

interface SonarDigestProps {
  // Props can be added if needed
}

export function SonarDigest({}: SonarDigestProps) {
  const { translate, locale } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [digest, setDigest] = useState<SonarWeeklyDigest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'html' | 'structured'>('structured');

  useEffect(() => {
    const fetchDigest = async () => {
      // Add a timestamp to bypass cache
      const bypassCache = new Date().getTime();
      
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
        const cacheKey = `sonarDigest`;
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
              console.log(`Using cached Sonar digest`);
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
            console.log(`Cached Sonar digest in localStorage`);
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
  }, [locale]);

  const formatDate = (dateString: string | Date) => {
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
    <div className="bg-black/40 border-2 border-purple-500/70 rounded-lg p-6 text-purple-400/90 relative overflow-hidden">
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
                <span className="bg-purple-600/80 text-white text-xs font-bold px-2 py-1 rounded-full mr-2 uppercase tracking-wider">Weekly Edition</span>
                <span className="text-purple-300/70 text-sm">{formatDate(digest.date)}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200">SONAR AI NEWS DIGEST</h1>
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
                Structured
              </button>
              <button
                onClick={() => setActiveTab('html')}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'html'
                    ? 'bg-purple-500/30 text-purple-200 border-b-2 border-purple-400'
                    : 'text-purple-400/60 hover:text-purple-300/80 hover:bg-purple-500/10'
                }`}
              >
                Raw HTML
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
              
              {/* Top 5 Topics Section */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h3 className="text-2xl font-bold font-serif text-purple-300 mr-3">TOP 5 AI TOPICS THIS WEEK</h3>
                  <div className="flex-grow h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                </div>
                
                {digest.topics && digest.topics.length > 0 ? (
                  <div className="space-y-8">
                    {digest.topics.map((topic, index) => (
                      <div key={index} className="bg-black/80 border border-purple-500/40 rounded-lg p-5 mb-4 transition-all duration-300 hover:border-purple-400/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        {/* Topic Header with Number */}
                        <div className="flex items-center mb-3">
                          <div className="bg-purple-600/80 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                            {index + 1}
                          </div>
                          <h4 className="text-2xl font-bold text-purple-200">{topic.title}</h4>
                        </div>
                        
                        {/* Summary Section */}
                        <div className="mb-4 bg-purple-900/10 p-3 rounded-lg border-l-4 border-purple-500/50">
                          <h5 className="text-purple-300 font-bold text-sm mb-1 uppercase tracking-wider">SUMMARY</h5>
                          <p className="text-purple-200/90">{topic.summary}</p>
                        </div>
                        
                        {/* Viral & Valuable Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-purple-900/10 p-3 rounded-lg border-l-4 border-pink-500/50">
                            <h5 className="text-pink-300 font-bold text-sm mb-1 uppercase tracking-wider flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                              </svg>
                              WHY VIRAL
                            </h5>
                            <p className="text-purple-200/90">{topic.viralReason}</p>
                          </div>
                          
                          <div className="bg-purple-900/10 p-3 rounded-lg border-l-4 border-blue-500/50">
                            <h5 className="text-blue-300 font-bold text-sm mb-1 uppercase tracking-wider flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              WHY VALUABLE
                            </h5>
                            <p className="text-purple-200/90">{topic.valueReason}</p>
                          </div>
                        </div>
                        
                        {/* Insights Section */}
                        <div className="mb-4 bg-purple-900/10 p-3 rounded-lg border-l-4 border-green-500/50">
                          <h5 className="text-green-300 font-bold text-sm mb-1 uppercase tracking-wider flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                            </svg>
                            INSIGHTS
                          </h5>
                          <p className="text-purple-200/90">{topic.insights}</p>
                        </div>
                        
                        {/* Citations Section */}
                        {topic.citations && topic.citations.length > 0 && (
                          <div className="bg-purple-900/10 p-3 rounded-lg">
                            <h5 className="text-purple-300 font-bold text-sm mb-2 uppercase tracking-wider flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                              CITATIONS
                            </h5>
                            <ul className="space-y-2">
                              {topic.citations.map((citation, citIndex) => (
                                <li key={citIndex} className="text-sm flex items-center bg-black/40 p-2 rounded-md hover:bg-black/60 transition-colors">
                                  <span className={`inline-block w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs ${
                                    citation.type === 'x-post' ? 'bg-purple-700 text-purple-100' : 'bg-green-700 text-green-100'
                                  }`}>
                                    {citation.type === 'x-post' ? 'X' : 'A'}
                                  </span>
                                  <a
                                    href={citation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-300 hover:text-purple-100 hover:underline transition-colors"
                                  >
                                    {citation.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Note: Twitter Data Section removed as part of the Twitter-enhanced Sonar Digest removal */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/40 border border-purple-400/30 rounded-lg p-6 text-center">
                    <p className="text-purple-300 mb-4">
                      No structured topics could be extracted from the Sonar response. Please view the raw HTML tab to see the full content.
                    </p>
                    <button
                      onClick={() => setActiveTab('html')}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded text-sm transition-colors"
                    >
                      View Raw HTML
                    </button>
                  </div>
                )}
              </div>
              
              {/* Technology Insights Section */}
              {digest.topics && digest.topics.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center mb-4">
                    <h3 className="text-2xl font-bold font-serif text-purple-300 mr-3">TECHNOLOGY INSIGHTS</h3>
                    <div className="flex-grow h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                  </div>
                  
                  <div className="bg-black/70 border-2 border-purple-500/40 rounded-lg p-6 backdrop-blur-sm shadow-lg">
                    <p className="text-purple-200/90 mb-4">
                      Explore detailed trend analysis and impact assessment for the technologies mentioned in this digest.
                    </p>
                    <Link
                      href="/news/technology-trends"
                      className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      View Technology Trends Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Raw HTML View */}
        {activeTab === 'html' && (
          <div className="bg-black/60 border-2 border-purple-400/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: digest.rawHtml }}
            />
          </div>
        )}
        
        {/* Enhanced Footer */}
        <div className="text-center border-t border-purple-500/30 pt-4 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-purple-400/70 mb-2 md:mb-0">
              <p className="font-medium">Weekly Sonar AI News Digest • Generated on {formatDate(digest.publishedAt)}</p>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-purple-400/60 mr-2">Powered by</span>
              <span className="bg-purple-900/40 text-purple-200 text-xs font-bold px-2 py-1 rounded">xAI&apos;s Sonar API</span>
            </div>
          </div>
        </div>

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
    </div>
  );
}