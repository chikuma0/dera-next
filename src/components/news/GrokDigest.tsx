'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { GrokWeeklyDigest, GrokDigestTopic } from '@/lib/services/grokDigestService';

interface GrokDigestProps {
  // Props can be added if needed
}

export function GrokDigest({}: GrokDigestProps) {
  const { translate, locale } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [digest, setDigest] = useState<GrokWeeklyDigest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'html' | 'structured'>('structured');

  useEffect(() => {
    const fetchDigest = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have a cached digest in localStorage
        const cachedDigestStr = localStorage.getItem('grokDigest');
        const cachedTimestamp = localStorage.getItem('grokDigestTimestamp');
        
        // Use cached data if it's less than 24 hours old
        if (cachedDigestStr && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          const cacheAge = now - timestamp;
          const oneDayInMs = 24 * 60 * 60 * 1000;
          
          if (cacheAge < oneDayInMs) {
            try {
              const cachedDigest = JSON.parse(cachedDigestStr);
              setDigest(cachedDigest);
              setIsLoading(false);
              console.log('Using cached Grok digest');
              return;
            } catch (parseError) {
              console.error('Error parsing cached digest:', parseError);
              // Continue to fetch from API if parsing fails
            }
          }
        }
        
        // Fetch from API if no valid cache exists
        const response = await fetch(`/api/news/grok-digest?language=${locale}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setDigest(data.data);
          
          // Cache the digest in localStorage
          try {
            localStorage.setItem('grokDigest', JSON.stringify(data.data));
            localStorage.setItem('grokDigestTimestamp', Date.now().toString());
            console.log('Cached Grok digest in localStorage');
          } catch (cacheError) {
            console.error('Error caching digest:', cacheError);
          }
        } else {
          setError(data.error || 'Failed to load Grok digest');
        }
      } catch (error) {
        console.error('Error fetching Grok digest:', error);
        setError('Failed to load Grok digest. Please try again later.');
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
    return (
      <div className="bg-black/40 border-2 border-red-400 rounded-lg p-6 text-center">
        <h3 className="text-red-400 text-xl mb-2">Error</h3>
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="bg-black/40 border-2 border-yellow-400 rounded-lg p-6 text-center">
        <h3 className="text-yellow-400 text-xl mb-2">No Grok Digest Available</h3>
        <p className="text-yellow-300 mb-4">
          There is no Grok digest available yet. Check back later for our AI-powered weekly digest of viral and valuable AI news.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border-2 border-blue-400/70 rounded-lg p-6 text-blue-400/90 relative overflow-hidden">
      {/* Vintage Paper Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c4zIgLAAABvklEQVR4Ac3RBQEDMRAAwe1YbO7Q/5bJ/G0TaUUqJRNZJFGiYGw6RMnY+TQGG8pIwiYkFMYm5BQWbEJJYcUmVBQ2bEJDYccmdBQObEJP4cQmDBQubMJI4cYmTBQebMJM4cUmLBQ+bMJK4ccmbBQBbMJOEcImnBQhbMJFEcYm3BQRbMJDEcUmvBQxbMJHEccm/BQJbCJAkcQmQhQpbCJMkcYmIhQZbCJKkcUmYhQ5bCJOkcf+lYhQFP6ZiFFUMGwiSlHDJuIUDWwiQdHCJpIUHWwiRdHDJtIUA2wiQzHEJrIUI2wiRzHGJvIUE2yiQDHFJooUM2yiRDHHJsoUC2yiQrHEJqoUK2yiRrHGJuoUG2yiQbHFJpoUO2yiRbHHJtoUB2yiQ3HEJroUJ2yiR3HGJvoUF2xiQHHFJoYUN2xiRHHHJsYUD2xiQvHEJqYUT2xiRvHCJuYUb2xiQfHBJpYUX2xiRfHDJtYUf2xiQ/HHJrYUAXZiRxFiF04UYXbhQhFhF24UUXbhQRFjF14UcXbhQ5FgF34USXYRQJFiFyEUaXYRQZFhF1EUWXYRQ5FjF3EUeXaRQFFgF0kUJXaRQlFmFxkUFXaRRVFlF3kUNXZRQFFnFyUUDXZRRdFkF3UUbXbRQNFhF00UXXbRQtFjF20UfXbRQTFgF10UI3bRQzFmF30UE3YxQDFlF0MUc3YxQrFgF2MUK3YxQbFmF1MUG3YxQ7FlF3MUO3axQLFnF0sUB3axQnFkF1sUJ3axQXFmF1sUF3axQ3FlF3sUN3ZxQPFgF0cUT3ZxQvFiF2cUb3ZxQfFhF1cUX3ZxQ/FjFzcUf3bxQAlgFy+UEHbxRgljFx+UKHbxRYlhFz+UOHbxR0lgFwFKCrsIUdLYRYSSwS6ilCx2EaPksIs4JY9dJCgF7CJJKWIXKUoZu0hTKthFhlLFLrKUGnaRo9SxizylgV0UKPW/d1GkNLGLEqWFXZQpbeyi8vcu/gHYPQaR7h8cDQAAAABJRU5ErkJggg==')] opacity-5 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-blue-900/5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-blue-900/5 to-blue-900/10 mix-blend-overlay"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b-4 border-blue-400/70 mb-6 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-serif">GROK AI NEWS DIGEST</h1>
              <div className="text-sm text-blue-300/70 mt-1">
                {formatDate(digest.date)}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button 
                onClick={() => setActiveTab('structured')}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
                  activeTab === 'structured' 
                    ? 'bg-blue-400/20 text-blue-300 border-b-2 border-blue-400' 
                    : 'text-blue-400/60 hover:text-blue-300/80'
                }`}
              >
                Structured
              </button>
              <button 
                onClick={() => setActiveTab('html')}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
                  activeTab === 'html' 
                    ? 'bg-blue-400/20 text-blue-300 border-b-2 border-blue-400' 
                    : 'text-blue-400/60 hover:text-blue-300/80'
                }`}
              >
                Raw HTML
              </button>
            </div>
          </div>
        </div>
        
        {/* Structured View */}
        {activeTab === 'structured' && (
          <div>
            <div className="bg-black/60 border-2 border-blue-400/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 font-serif">{digest.title}</h2>
              <p className="text-lg text-blue-300/90 mb-6">{digest.summary}</p>
              
              <h3 className="text-xl font-bold mb-3 font-serif border-b border-blue-400/30 pb-2">TOP AI TOPICS</h3>
              
              {digest.topics && digest.topics.length > 0 ? (
                <div className="space-y-6">
                  {digest.topics.map((topic, index) => (
                    <div key={index} className="bg-black/80 border border-blue-400/30 rounded-lg p-4 mb-4">
                      <h4 className="text-xl font-bold text-blue-300 mb-2">{topic.title}</h4>
                      
                      <div className="mb-3">
                        <h5 className="text-blue-400 font-bold text-sm mb-1">SUMMARY</h5>
                        <p className="text-blue-300/90">{topic.summary}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-blue-400 font-bold text-sm mb-1">WHY VIRAL</h5>
                          <p className="text-blue-300/80">{topic.viralReason}</p>
                        </div>
                        
                        <div>
                          <h5 className="text-blue-400 font-bold text-sm mb-1">WHY VALUABLE</h5>
                          <p className="text-blue-300/80">{topic.valueReason}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="text-blue-400 font-bold text-sm mb-1">INSIGHTS</h5>
                        <p className="text-blue-300/80">{topic.insights}</p>
                      </div>
                      
                      {topic.citations && topic.citations.length > 0 && (
                        <div>
                          <h5 className="text-blue-400 font-bold text-sm mb-1">CITATIONS</h5>
                          <ul className="space-y-1">
                            {topic.citations.map((citation, citIndex) => (
                              <li key={citIndex} className="text-sm flex items-center">
                                <span className={`inline-block w-5 h-5 rounded-full mr-2 flex items-center justify-center text-xs ${
                                  citation.type === 'x-post' ? 'bg-blue-900/40 text-blue-300' : 'bg-green-900/40 text-green-300'
                                }`}>
                                  {citation.type === 'x-post' ? 'X' : 'A'}
                                </span>
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  {citation.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/40 border border-blue-400/30 rounded-lg p-6 text-center">
                  <p className="text-blue-300 mb-4">
                    No structured topics could be extracted from the Grok response. Please view the raw HTML tab to see the full content.
                  </p>
                  <button
                    onClick={() => setActiveTab('html')}
                    className="bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 px-4 py-2 rounded text-sm transition-colors"
                  >
                    View Raw HTML
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Raw HTML View */}
        {activeTab === 'html' && (
          <div className="bg-black/60 border-2 border-blue-400/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: digest.rawHtml }}
            />
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center text-sm text-blue-400/60">
          <p>Grok AI News Digest • Generated on {formatDate(digest.publishedAt)}</p>
          <p className="text-xs mt-1">Powered by xAI&apos;s Grok API</p>
        </div>
      </div>
    </div>
  );
}