'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NewsItem } from '@/types/news';
import { Tweet } from '@/types/twitter';

interface DashboardProps {
  // Props can be added if needed
}

export function Dashboard({}: DashboardProps) {
  const { translate, locale } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [trendingTechnologies, setTrendingTechnologies] = useState<any[]>([]);
  const [socialData, setSocialData] = useState<{
    tweets: Tweet[];
    hashtags: {
      hashtag: string;
      tweetCount: number;
      totalLikes: number;
      totalRetweets: number;
      impactScore: number;
    }[];
  } | null>(null);
  const [impactData, setImpactData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch all data in parallel
        const [newsResponse, trendsResponse, impactResponse] = await Promise.all([
          fetch(`/api/news?language=${locale}`),
          fetch(`/api/trends?language=${locale}`),
          fetch(`/api/trends/impact?language=${locale}`)
        ]);

        // Process news data
        const newsData = await newsResponse.json();
        if (newsData.success && newsData.data) {
          setNews(newsData.data);
        }

        // Process trends data
        const trendsData = await trendsResponse.json();
        if (trendsData.success && trendsData.data) {
          // Extract trending technologies
          if (trendsData.data.technologies) {
            // Sort by importance and growth
            const sortedTechs = [...trendsData.data.technologies]
              .sort((a, b) => {
                // First check if they have trend points
                const aHasPoints = a.technology_trend_points && a.technology_trend_points.length > 0;
                const bHasPoints = b.technology_trend_points && b.technology_trend_points.length > 0;
                
                if (aHasPoints && !bHasPoints) return -1;
                if (!aHasPoints && bHasPoints) return 1;
                
                // If both have points, compare by growth rate
                if (aHasPoints && bHasPoints) {
                  const aGrowth = a.technology_trend_points[a.technology_trend_points.length - 1]?.growth_rate || 0;
                  const bGrowth = b.technology_trend_points[b.technology_trend_points.length - 1]?.growth_rate || 0;
                  return bGrowth - aGrowth;
                }
                
                // Fallback to maturity level
                return a.maturity_level === 'emerging' ? -1 : 1;
              })
              .slice(0, 5);
            
            setTrendingTechnologies(sortedTechs);
          }

          // Extract social data
          if (trendsData.data.socialData) {
            setSocialData(trendsData.data.socialData);
          }
        }

        // Process impact data
        const impactData = await impactResponse.json();
        if (impactData.success && impactData.data) {
          setImpactData(impactData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [locale]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);
    
    // This would connect to your newsletter service
    // For now, we'll just simulate a successful subscription
    setTimeout(() => {
      setSubscribeMessage('Thank you for subscribing to the AI Media Hub newsletter!');
      setEmail('');
      setIsSubscribing(false);
    }, 1000);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return translate('common.invalidDate');
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
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

  // Separate news into featured and regular
  const featuredNews = news.length > 0 ? news[0] : null;
  const secondaryNews = news.slice(1, 3);
  const regularNews = news.slice(3); // Show all remaining articles

  // Get top tweets by engagement
  const topTweets = socialData?.tweets
    ? [...socialData.tweets]
        .sort((a, b) => (b.likesCount + b.retweetsCount * 2) - (a.likesCount + a.retweetsCount * 2))
        .slice(0, 3)
    : [];

  // Get top impacted industries
  const topIndustries = impactData?.impactHeatmap
    ? [...impactData.impactHeatmap]
        .sort((a, b) => b.impactLevel - a.impactLevel)
        .slice(0, 4)
    : [];

  return (
    <div className="relative text-green-400/90">
      {/* Vintage Paper Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c4zIgLAAABvklEQVR4Ac3RBQEDMRAAwe1YbO7Q/5bJ/G0TaUUqJRNZJFGiYGw6RMnY+TQGG8pIwiYkFMYm5BQWbEJJYcUmVBQ2bEJDYccmdBQObEJP4cQmDBQubMJI4cYmTBQebMJM4cUmLBQ+bMJK4ccmbBQBbMJOEcImnBQhbMJFEcYm3BQRbMJDEcUmvBQxbMJHEccm/BQJbCJAkcQmQhQpbCJMkcYmIhQZbCJKkcUmYhQ5bCJOkcf+lYhQFP6ZiFFUMGwiSlHDJuIUDWwiQdHCJpIUHWwiRdHDJtIUA2wiQzHEJrIUI2wiRzHGJvIUE2yiQDHFJooUM2yiRDHHJsoUC2yiQrHEJqoUK2yiRrHGJuoUG2yiQbHFJpoUO2yiRbHHJtoUB2yiQ3HEJroUJ2yiR3HGJvoUF2xiQHHFJoYUN2xiRHHHJsYUD2xiQvHEJqYUT2xiRvHCJuYUb2xiQfHBJpYUX2xiRfHDJtYUf2xiQ/HHJrYUAXZiRxFiF04UYXbhQhFhF24UUXbhQRFjF14UcXbhQ5FgF34USXYRQJFiFyEUaXYRQZFhF1EUWXYRQ5FjF3EUeXaRQFFgF0kUJXaRQlFmFxkUFXaRRVFlF3kUNXZRQFFnFyUUDXZRRdFkF3UUbXbRQNFhF00UXXbRQtFjF20UfXbRQTFgF10UI3bRQzFmF30UE3YxQDFlF0MUc3YxQrFgF2MUK3YxQbFmF1MUG3YxQ7FlF3MUO3axQLFnF0sUB3axQnFkF1sUJ3axQXFmF1sUF3axQ3FlF3sUN3ZxQPFgF0cUT3ZxQvFiF2cUb3ZxQfFhF1cUX3ZxQ/FjFzcUf3bxQAlgFy+UEHbxRgljFx+UKHbxRYlhFz+UOHbxR0lgFwFKCrsIUdLYRYSSwS6ilCx2EaPksIs4JY9dJCgF7CJJKWIXKUoZu0hTKthFhlLFLrKUGnaRo9SxizylgV0UKPW/d1GkNLGLEqWFXZQpbeyi8vcu/gHYPQaR7h8cDQAAAABJRU5ErkJggg==')] opacity-5 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 to-green-900/5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-green-900/5 to-green-900/10 mix-blend-overlay"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 mt-16 relative z-10">
        {/* Masthead */}
        <div className="border-b-4 border-green-400/70 mb-6 pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-5xl font-bold tracking-tight font-serif">AI MEDIA HUB</h1>
            <div className="text-right">
              <div className="text-xl">{formatDate(new Date())}</div>
              <div className="text-sm text-green-300/70">The Pulse of AI Innovation</div>
            </div>
          </div>
        </div>
        
        {/* Newsletter Signup */}
        <div className="bg-black/60 border-2 border-green-400/70 rounded-lg p-4 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 md:mr-4">
              <h3 className="text-xl font-bold font-serif">Stay Ahead of AI Developments</h3>
              <p className="text-green-300/70">Daily updates on the most important AI news, trends, and insights</p>
            </div>
            
            {subscribeMessage ? (
              <div className="text-green-400/90 font-bold">{subscribeMessage}</div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/80 border-2 border-green-400/70 rounded-l px-4 py-2 w-full md:w-64 text-green-300/90"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-green-400/80 text-black font-bold px-4 py-2 rounded-r hover:bg-green-300/80 transition-colors"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Featured News */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Article */}
            {featuredNews && (
              <div className="bg-black/40 border-2 border-green-400/30 rounded-lg p-6 backdrop-blur-sm">
                <div className="mb-2 text-xs text-green-400/60 uppercase font-bold">Featured Story</div>
                <h2 className="text-3xl font-bold mb-4 leading-tight font-serif">
                  <a
                    href={featuredNews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400/90 hover:text-green-300/90"
                  >
                    {featuredNews.title}
                  </a>
                </h2>
                {featuredNews.summary && (
                  <p className="text-lg text-green-300/70 mb-4">
                    {featuredNews.summary}
                  </p>
                )}
                <div className="text-sm text-green-400/60">
                  <span className="font-bold">{featuredNews.source}</span>
                  <span className="mx-2">•</span>
                  <time dateTime={new Date(featuredNews.published_date).toISOString()}>
                    {formatDate(featuredNews.published_date)}
                  </time>
                </div>
              </div>
            )}
            
            {/* Secondary Articles */}
            {secondaryNews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {secondaryNews.map((item) => (
                  <div key={item.id} className="bg-black/40 border-2 border-green-400/30 rounded-lg p-4 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-2 font-serif">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400/90 hover:text-green-300/90"
                      >
                        {item.title}
                      </a>
                    </h3>
                    {item.summary && (
                      <p className="text-sm text-green-300/70 mb-2 line-clamp-3">
                        {item.summary}
                      </p>
                    )}
                    <div className="text-sm text-green-400/60">
                      <span>{item.source}</span>
                      <span className="mx-2">•</span>
                      <time dateTime={new Date(item.published_date).toISOString()}>
                        {formatDate(item.published_date)}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Featured News Grid */}
            <div className="bg-black/40 border-2 border-green-400/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 font-serif border-b border-green-400/30 pb-2">
                FEATURED AI DEVELOPMENTS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {regularNews.slice(0, 4).map((item) => (
                  <div
                    key={`featured-${item.id}`}
                    className="bg-black/80 border border-green-400/30 rounded-lg p-3 hover:border-green-400/60 transition-colors"
                  >
                    <h4 className="font-bold text-green-300 mb-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-200"
                      >
                        {item.title}
                      </a>
                    </h4>
                    {item.summary && (
                      <p className="text-sm text-green-300/70 mb-2 line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                    <div className="text-xs text-green-400/60 flex items-center">
                      <span className="font-medium">{item.source}</span>
                      <span className="mx-2">•</span>
                      <time dateTime={new Date(item.published_date).toISOString()}>
                        {formatDate(item.published_date)}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Trends and Social */}
          <div className="space-y-6">
            {/* AI Pulse - Redesigned with better visualization */}
            <div className="bg-black/40 border-2 border-green-400/30 rounded-lg overflow-hidden backdrop-blur-sm">
              {/* Header with glowing effect */}
              <div className="bg-gradient-to-r from-green-900/40 via-green-700/30 to-green-900/40 p-4 border-b border-green-400/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-serif flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-400 animate-pulse mr-2"></span>
                    AI PULSE
                  </h3>
                  <div className="text-xs text-green-300/70 bg-black/40 px-2 py-1 rounded-full">
                    LIVE INSIGHTS
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {impactData && impactData.impactHeatmap && impactData.impactHeatmap.length > 0 ? (
                  <div className="space-y-6">
                    {/* Impact Radar Chart */}
                    <div>
                      <h4 className="text-green-400 font-bold mb-4 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                        </svg>
                        INDUSTRY IMPACT RADAR
                      </h4>
                      
                      <div className="relative h-48 mb-2">
                        {/* Radar Background */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-full max-w-[200px] max-h-[200px]">
                            {/* Radar Circles */}
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={`radar-circle-${i}`}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-green-400/30"
                                style={{
                                  width: `${(i + 1) * 25}%`,
                                  height: `${(i + 1) * 25}%`,
                                  opacity: 0.7 - i * 0.15
                                }}
                              ></div>
                            ))}
                            
                            {/* Radar Lines */}
                            {[...Array(8)].map((_, i) => (
                              <div
                                key={`radar-line-${i}`}
                                className="absolute top-1/2 left-1/2 w-[0.5px] h-full bg-green-400/20 origin-bottom"
                                style={{ transform: `translateX(-50%) rotate(${i * 45}deg)` }}
                              ></div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Industry Impact Points */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-full h-full max-w-[200px] max-h-[200px]">
                            {impactData.impactHeatmap.slice(0, 5).map((industry: any, index: number) => {
                              // Calculate position on radar based on index and impact level
                              const angle = (index / 5) * Math.PI * 2;
                              const distance = (industry.impactLevel / 10) * 0.8; // Scale to 80% of radius max
                              const x = Math.cos(angle) * distance * 100;
                              const y = Math.sin(angle) * distance * 100;
                              
                              // Ensure unique key by using both industry ID and index
                              return (
                                <div
                                  key={`radar-point-${index}-${industry.industryId || Math.random().toString(36).substr(2, 9)}`}
                                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                  style={{
                                    marginLeft: `${x}px`,
                                    marginTop: `${y}px`
                                  }}
                                >
                                  <div
                                    className={`w-3 h-3 rounded-full shadow-lg shadow-${
                                      industry.impactLevel >= 8 ? 'red-500/50' :
                                      industry.impactLevel >= 6 ? 'orange-500/50' :
                                      'yellow-500/50'
                                    } animate-pulse`}
                                    style={{
                                      backgroundColor: industry.impactLevel >= 8 ? 'rgb(239, 68, 68)' :
                                                      industry.impactLevel >= 6 ? 'rgb(249, 115, 22)' :
                                                      'rgb(234, 179, 8)',
                                      animationDuration: `${3 + index * 0.5}s`
                                    }}
                                  ></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Industry Legend */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {impactData.impactHeatmap.slice(0, 4).map((industry: any, index: number) => (
                          <div key={`legend-item-${index}-${industry.industryId || Math.random().toString(36).substr(2, 9)}`} className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-1 ${
                                industry.impactLevel >= 8 ? 'bg-red-500' :
                                industry.impactLevel >= 6 ? 'bg-orange-500' :
                                'bg-yellow-500'
                              }`}
                            ></div>
                            <span className="text-green-300 truncate">{industry.industryName}</span>
                            <span className="ml-auto text-green-400/70">{industry.impactLevel}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Trend Pulse */}
                    <div>
                      <h4 className="text-green-400 font-bold mb-3 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        TREND PULSE
                      </h4>
                      
                      <div className="relative h-16 bg-black/40 rounded-lg overflow-hidden">
                        {/* Pulse Line Background */}
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full h-[1px] bg-green-400/20"></div>
                        </div>
                        
                        {/* Pulse Line */}
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(74, 222, 128, 0.2)" />
                              <stop offset="50%" stopColor="rgba(74, 222, 128, 0.8)" />
                              <stop offset="100%" stopColor="rgba(74, 222, 128, 0.2)" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,32 Q30,10 60,24 T120,16 T180,28 T240,20 T300,32"
                            fill="none"
                            stroke="url(#pulseGradient)"
                            strokeWidth="2"
                            className="animate-pulse"
                            style={{ animationDuration: '4s' }}
                          />
                        </svg>
                        
                        {/* Pulse Points */}
                        {[20, 40, 60, 80].map((pos, i) => (
                          <div
                            key={`pulse-point-${i}`}
                            className="absolute top-1/2 w-1.5 h-1.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50 transform -translate-y-1/2 animate-pulse"
                            style={{
                              left: `${pos}%`,
                              animationDuration: `${2 + i * 0.5}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Latest Insights */}
                    {impactData.latestInsights && impactData.latestInsights.length > 0 && (
                      <div>
                        <h4 className="text-green-400 font-bold mb-3 text-sm flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                          </svg>
                          KEY INSIGHT
                        </h4>
                        <div className="bg-gradient-to-r from-green-900/20 to-green-700/10 p-3 rounded-lg border-l-4 border-green-400">
                          <p className="text-green-300 text-sm">{impactData.latestInsights[0].summary}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center mt-2">
                      <a
                        href="/trends"
                        className="text-green-400 hover:text-green-300 text-sm inline-flex items-center bg-black/30 px-3 py-1.5 rounded-full hover:bg-black/50 transition-colors"
                      >
                        View full AI trend analysis
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                ) : trendingTechnologies.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-green-400 font-bold mb-3 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
                      </svg>
                      TRENDING TECHNOLOGIES
                    </h4>
                    
                    <div className="space-y-3">
                      {trendingTechnologies.slice(0, 3).map((tech, index) => {
                        const latestPoint = tech.technology_trend_points &&
                          tech.technology_trend_points.length > 0 ?
                          tech.technology_trend_points[tech.technology_trend_points.length - 1] : null;
                        
                        const growthRate = latestPoint?.growth_rate || 0;
                        const growthPercent = Math.abs(growthRate * 100).toFixed(0);
                        
                        return (
                          <div key={tech.id} className="bg-black/30 rounded-lg p-3 border border-green-400/20">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-black flex items-center justify-center font-bold mr-3 shadow-lg shadow-green-400/20">
                                {index + 1}
                              </div>
                              <div className="flex-grow">
                                <div className="font-bold text-green-300">{tech.name}</div>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="text-xs text-green-400/70 flex items-center">
                                    {growthRate > 0 ? (
                                      <>
                                        <svg className="w-3 h-3 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
                                        </svg>
                                        <span>{growthPercent}% growth</span>
                                      </>
                                    ) : growthRate < 0 ? (
                                      <>
                                        <svg className="w-3 h-3 mr-1 text-red-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                          <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd"></path>
                                        </svg>
                                        <span>{growthPercent}% decline</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                          <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd"></path>
                                        </svg>
                                        <span>Stable</span>
                                      </>
                                    )}
                                  </div>
                                  <div className={`text-xs px-2 py-0.5 rounded-full ${
                                    growthRate > 0.1 ? 'bg-green-400/20 text-green-300' :
                                    growthRate < -0.1 ? 'bg-red-400/20 text-red-300' :
                                    'bg-yellow-400/20 text-yellow-300'
                                  }`}>
                                    {tech.maturity_level || 'emerging'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="text-center mt-2">
                      <a
                        href="/trends"
                        className="text-green-400 hover:text-green-300 text-sm inline-flex items-center bg-black/30 px-3 py-1.5 rounded-full hover:bg-black/50 transition-colors"
                      >
                        View all technology trends
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-green-400/60 py-4">
                    <svg className="w-12 h-12 mx-auto mb-3 text-green-400/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p>No trend data available</p>
                    <p className="text-xs mt-2 text-green-400/40">Check back later for AI trend insights</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Social Pulse */}
            <div className="bg-black/40 border-2 border-green-400/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 border-b border-green-400/30 pb-2 font-serif">
                SOCIAL PULSE
              </h3>
              {(topTweets.length > 0 || (socialData && socialData.hashtags && socialData.hashtags.length > 0)) ? (
                <div className="space-y-4">
                  {/* Trending Hashtags */}
                  {socialData && socialData.hashtags && socialData.hashtags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-green-400 font-bold mb-3 text-sm">TRENDING HASHTAGS</h4>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {socialData.hashtags.slice(0, 4).map((hashtag, index) => (
                          <div
                            key={hashtag.hashtag}
                            className="bg-black/80 border border-green-400/30 rounded-lg p-3"
                          >
                            <div className="text-green-400 font-bold">
                              #{hashtag.hashtag}
                            </div>
                            <div className="flex justify-between items-center mt-1 text-xs">
                              <span className="text-green-300/70">{hashtag.tweetCount} tweets</span>
                              <span className="bg-green-400/20 text-green-300 px-2 py-0.5 rounded">
                                Score: {Math.round(hashtag.impactScore)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Viral Tweets */}
                  {topTweets.length > 0 && (
                    <div>
                      <h4 className="text-green-400 font-bold mb-3 text-sm">VIRAL TWEETS</h4>
                      <div className="space-y-4">
                        {topTweets.slice(0, 2).map((tweet, index) => (
                          <div
                            key={tweet.id}
                            className="bg-black/80 border border-green-400/30 rounded-lg p-4 hover:border-green-400/60 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center text-green-400">
                                @
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-bold text-green-300">
                                      {tweet.authorName || tweet.authorUsername}
                                      {tweet.isVerified && (
                                        <span className="ml-1 text-blue-400">✓</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-green-400/70">
                                      @{tweet.authorUsername}
                                    </div>
                                  </div>
                                  <div className="text-xs text-green-400/50 bg-green-400/10 px-2 py-1 rounded">
                                    Impact: {tweet.likesCount + tweet.retweetsCount * 2}
                                  </div>
                                </div>
                                <div className="mt-3 text-green-200">{tweet.content}</div>
                                <div className="mt-3 flex items-center text-xs text-green-400/70 space-x-4">
                                  <div>❤️ {tweet.likesCount}</div>
                                  <div>🔄 {tweet.retweetsCount}</div>
                                  <a
                                    href={tweet.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto text-blue-400 hover:underline"
                                  >
                                    View on X
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mt-2">
                    <a
                      href="/trends"
                      className="text-green-400 hover:text-green-300 text-sm inline-flex items-center"
                    >
                      View full social media analysis
                      <span className="ml-1">→</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-black/60 border border-yellow-400/30 rounded-lg p-4 text-center">
                  <h4 className="text-yellow-400 font-bold mb-2">No Social Data Available</h4>
                  <p className="text-green-300 mb-4">
                    The application is now configured to use real data from Twitter, but no data has been fetched yet.
                  </p>
                  <div className="text-left bg-black/40 p-4 rounded text-sm">
                    <p className="font-bold text-green-400 mb-2">To fetch real data:</p>
                    <ol className="list-decimal list-inside space-y-2 text-green-300">
                      <li>Make sure your Twitter API key is set in the .env file</li>
                      <li>Run <code className="bg-green-900/30 px-2 py-1 rounded">node scripts/fetch-twitter-data.js</code></li>
                      <li>Refresh the page</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
            
            {/* More News */}
            <div className="bg-black/40 border-2 border-green-400/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 border-b border-green-400/30 pb-2 font-serif">
                ADDITIONAL AI COVERAGE
              </h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {regularNews.slice(4).map((item) => (
                  <div key={item.id} className="border-l-2 border-green-400/50 pl-3 mb-4 pb-3 border-b border-green-400/20">
                    <h4 className="font-bold text-green-300">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-200"
                      >
                        {item.title}
                      </a>
                    </h4>
                    {item.summary && (
                      <p className="text-sm text-green-300/70 mt-1 mb-2 line-clamp-2">
                        {item.summary}
                      </p>
                    )}
                    <div className="text-xs text-green-400/60 mt-1 flex items-center">
                      <span className="font-medium">{item.source}</span>
                      <span className="mx-2">•</span>
                      <time dateTime={new Date(item.published_date).toISOString()}>
                        {formatDate(item.published_date)}
                      </time>
                      {item.categories && item.categories.length > 0 && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="bg-green-900/40 px-2 py-0.5 rounded text-xs">
                            {item.categories[0]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {regularNews.length === 0 && (
                  <div className="text-center text-green-400/60 py-4">
                    No additional articles available
                  </div>
                )}
              </div>
              {regularNews.length > 5 && (
                <div className="text-center mt-4 text-sm text-green-400/70">
                  Showing {regularNews.length} additional articles
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-6 border-t-4 border-green-400/50 text-center">
          <p className="text-green-300/70">
            AI Media Hub - Your comprehensive source for AI news, trends, and insights
          </p>
        </div>
      </div>
    </div>
  );
}