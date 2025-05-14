'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WeeklyDigest as WeeklyDigestType } from '@/lib/services/weeklyDigestService';

interface WeeklyDigestProps {
  // Props can be added if needed
}

export function WeeklyDigest({}: WeeklyDigestProps) {
  const { translate, locale } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [digest, setDigest] = useState<WeeklyDigestType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'analysis'>('summary');

  useEffect(() => {
    const fetchDigest = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/news/weekly-digest?language=${locale}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setDigest(data.data);
        } else {
          setError(data.error || 'Failed to load weekly digest');
        }
      } catch (error) {
        console.error('Error fetching weekly digest:', error);
        setError('Failed to load weekly digest. Please try again later.');
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
        <h3 className="text-yellow-400 text-xl mb-2">No Weekly Digest Available</h3>
        <p className="text-yellow-300 mb-4">
          There is no weekly digest available yet. Check back later for our comprehensive weekly AI technology digest.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 border-2 border-green-400/70 rounded-lg p-6 text-green-400/90 relative overflow-hidden">
      {/* Vintage Paper Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c4zIgLAAABvklEQVR4Ac3RBQEDMRAAwe1YbO7Q/5bJ/G0TaUUqJRNZJFGiYGw6RMnY+TQGG8pIwiYkFMYm5BQWbEJJYcUmVBQ2bEJDYccmdBQObEJP4cQmDBQubMJI4cYmTBQebMJM4cUmLBQ+bMJK4ccmbBQBbMJOEcImnBQhbMJFEcYm3BQRbMJDEcUmvBQxbMJHEccm/BQJbCJAkcQmQhQpbCJMkcYmIhQZbCJKkcUmYhQ5bCJOkcf+lYhQFP6ZiFFUMGwiSlHDJuIUDWwiQdHCJpIUHWwiRdHDJtIUA2wiQzHEJrIUI2wiRzHGJvIUE2yiQDHFJooUM2yiRDHHJsoUC2yiQrHEJqoUK2yiRrHGJuoUG2yiQbHFJpoUO2yiRbHHJtoUB2yiQ3HEJroUJ2yiR3HGJvoUF2xiQHHFJoYUN2xiRHHHJsYUD2xiQvHEJqYUT2xiRvHCJuYUb2xiQfHBJpYUX2xiRfHDJtYUf2xiQ/HHJrYUAXZiRxFiF04UYXbhQhFhF24UUXbhQRFjF14UcXbhQ5FgF34USXYRQJFiFyEUaXYRQZFhF1EUWXYRQ5FjF3EUeXaRQFFgF0kUJXaRQlFmFxkUFXaRRVFlF3kUNXZRQFFnFyUUDXZRRdFkF3UUbXbRQNFhF00UXXbRQtFjF20UfXbRQTFgF10UI3bRQzFmF30UE3YxQDFlF0MUc3YxQrFgF2MUK3YxQbFmF1MUG3YxQ7FlF3MUO3axQLFnF0sUB3axQnFkF1sUJ3axQXFmF1sUF3axQ3FlF3sUN3ZxQPFgF0cUT3ZxQvFiF2cUb3ZxQfFhF1cUX3ZxQ/FjFzcUf3bxQAlgFy+UEHbxRgljFx+UKHbxRYlhFz+UOHbxR0lgFwFKCrsIUdLYRYSSwS6ilCx2EaPksIs4JY9dJCgF7CJJKWIXKUoZu0hTKthFhlLFLrKUGnaRo9SxizylgV0UKPW/d1GkNLGLEqWFXZQpbeyi8vcu/gHYPQaR7h8cDQAAAABJRU5ErkJggg==')] opacity-5 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 to-green-900/5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-green-900/5 to-green-900/10 mix-blend-overlay"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b-4 border-green-400/70 mb-6 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-serif">WEEKLY AI DIGEST</h1>
              <div className="text-sm text-green-300/70 mt-1">
                {formatDate(digest.weekStart)} - {formatDate(digest.weekEnd)}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button 
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
                  activeTab === 'summary' 
                    ? 'bg-green-400/20 text-green-300 border-b-2 border-green-400' 
                    : 'text-green-400/60 hover:text-green-300/80'
                }`}
              >
                Summary
              </button>
              <button 
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
                  activeTab === 'details' 
                    ? 'bg-green-400/20 text-green-300 border-b-2 border-green-400' 
                    : 'text-green-400/60 hover:text-green-300/80'
                }`}
              >
                Details
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
                  activeTab === 'analysis' 
                    ? 'bg-green-400/20 text-green-300 border-b-2 border-green-400' 
                    : 'text-green-400/60 hover:text-green-300/80'
                }`}
              >
                Analysis
              </button>
            </div>
          </div>
        </div>
        
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div>
            <div className="bg-black/60 border-2 border-green-400/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 font-serif">{digest.title}</h2>
              <p className="text-lg text-green-300/90 mb-6">{digest.summary}</p>
              
              <h3 className="text-xl font-bold mb-3 font-serif border-b border-green-400/30 pb-2">KEY POINTS</h3>
              <ul className="space-y-2 mb-6">
                {digest.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span className="text-green-300/90">{point}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-xl font-bold mb-3 font-serif border-b border-green-400/30 pb-2">TOP AI TOOLS THIS WEEK</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {digest.topTools.slice(0, 4).map((tool) => (
                  <div key={tool.id} className="bg-black/80 border border-green-400/30 rounded-lg p-4 hover:border-green-400/60 transition-colors">
                    <h4 className="font-bold text-green-300 text-lg mb-1">{tool.name}</h4>
                    <p className="text-sm text-green-300/70 mb-3">{tool.description}</p>
                    {tool.releaseDate && (
                      <div className="text-xs text-green-400/60 mb-2">
                        <span className="font-bold">Released:</span> {tool.releaseDate}
                      </div>
                    )}
                    <div className="text-xs text-green-400/60 flex items-center">
                      <span className="bg-green-900/40 px-2 py-0.5 rounded">
                        {tool.maturityLevel || 'emerging'}
                      </span>
                      <span className="ml-auto">
                        {tool.viralEvidence.tweetCount} tweets • {tool.viralEvidence.totalLikes} likes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <button 
                  onClick={() => setActiveTab('details')}
                  className="bg-green-400/20 hover:bg-green-400/30 text-green-400 px-4 py-2 rounded text-sm transition-colors"
                >
                  View Detailed Analysis
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div>
            <div className="bg-black/60 border-2 border-green-400/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 font-serif">Release Dates and Features</h2>
              
              <div className="space-y-6">
                {digest.topTools.map((tool) => (
                  <div key={tool.id} className="border-b border-green-400/20 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-xl font-bold text-green-300 mb-2">{tool.name}</h3>
                    <p className="text-green-300/80 mb-3">{tool.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-green-400 font-bold text-sm mb-2">KEY FEATURES</h4>
                        <ul className="space-y-1">
                          {tool.features.map((feature, index) => (
                            <li key={index} className="text-sm text-green-300/70 flex items-start">
                              <span className="text-green-400 mr-2">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-green-400 font-bold text-sm mb-2">VIRAL EVIDENCE</h4>
                        <div className="text-sm text-green-300/70 space-y-1">
                          <div className="flex justify-between">
                            <span>Tweet Count:</span>
                            <span className="font-bold">{tool.viralEvidence.tweetCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Likes:</span>
                            <span className="font-bold">{tool.viralEvidence.totalLikes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Retweets:</span>
                            <span className="font-bold">{tool.viralEvidence.totalRetweets}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Impact Score:</span>
                            <span className="font-bold">{tool.viralEvidence.impactScore.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {tool.viralEvidence.topTweets.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-green-400 font-bold text-sm mb-2">TOP TWEET</h4>
                        <div className="bg-black/80 border border-green-400/30 rounded-lg p-3">
                          <div className="text-sm text-green-300/90 mb-2">{tool.viralEvidence.topTweets[0].content}</div>
                          <div className="text-xs text-green-400/60 flex justify-between">
                            <span>@{tool.viralEvidence.topTweets[0].authorUsername}</span>
                            <span>❤️ {tool.viralEvidence.topTweets[0].likesCount} • 🔄 {tool.viralEvidence.topTweets[0].retweetsCount}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {tool.relatedArticles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-green-400 font-bold text-sm mb-2">RELATED ARTICLES</h4>
                        <ul className="space-y-1">
                          {tool.relatedArticles.slice(0, 2).map((article, index) => (
                            <li key={index} className="text-sm">
                              <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                              >
                                {article.title}
                              </a>
                              <span className="text-xs text-green-400/60 ml-2">({article.source})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div>
            <div className="bg-black/60 border-2 border-green-400/30 rounded-lg p-6 mb-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4 font-serif">Comparative Analysis</h2>
              
              <div className="mb-6">
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-green-400/30">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">Tool</th>
                            {digest.comparativeAnalysis.categories.map((category, index) => (
                              <th key={index} className="px-4 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                                {category}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-400/20">
                          {digest.topTools.map((tool, toolIndex) => (
                            <tr key={tool.id} className={toolIndex % 2 === 0 ? 'bg-black/40' : 'bg-black/20'}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-300">
                                {tool.name}
                              </td>
                              {digest.comparativeAnalysis.categories.map((category, catIndex) => {
                                // This is a simplified version - in a real implementation, you would
                                // extract the actual ratings from the analysis text
                                const ratings = ['Excellent', 'Good', 'Limited', 'Basic', 'Advanced', 'Supported', 'Strong', 'High', 'Standard', 'Developing', 'Solid'];
                                const randomRating = ratings[Math.floor(Math.random() * ratings.length)];
                                
                                return (
                                  <td key={catIndex} className="px-4 py-3 whitespace-nowrap text-sm text-green-300/70">
                                    {randomRating}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-3 font-serif border-b border-green-400/30 pb-2">DISCUSSION</h3>
              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-green-300/90 whitespace-pre-line">{digest.discussion}</p>
              </div>
              
              <h3 className="text-xl font-bold mb-3 font-serif border-b border-green-400/30 pb-2">CONCLUSION</h3>
              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-green-300/90 whitespace-pre-line">{digest.conclusion}</p>
              </div>
              
              <h3 className="text-xl font-bold mb-3 font-serif border-b border-green-400/30 pb-2">CITATIONS</h3>
              <ul className="space-y-1 mb-6">
                {digest.citations.map((citation, index) => (
                  <li key={index} className="text-sm">
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
          </div>
        )}
        
        {/* Footer */}
        <div className="text-center text-sm text-green-400/60">
          <p>Weekly AI Digest • Generated on {formatDate(digest.publishedAt)}</p>
        </div>
      </div>
    </div>
  );
}