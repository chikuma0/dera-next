'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SonarWeeklyDigest, SonarDigestTopic } from '@/lib/services/sonarDigestService';
import { GrokWeeklyDigest, GrokDigestTopic } from '@/lib/services/grokDigestService';
import { NewsItem } from '@/types/news';
import { Tweet } from '@/types/twitter';

interface MergedNewsDigestProps {
  // Props can be added if needed
}

export function MergedNewsDigest({}: MergedNewsDigestProps) {
  const { translate, locale } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [sonarDigest, setSonarDigest] = useState<SonarWeeklyDigest | null>(null);
  const [grokDigest, setGrokDigest] = useState<GrokWeeklyDigest | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
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
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [sonarResponse, grokResponse, newsResponse, trendsResponse] = await Promise.all([
          fetch(`/api/news/sonar-digest?language=${locale}&source=twitter-enhanced`),
          fetch(`/api/news/grok-digest?language=${locale}`),
          fetch(`/api/news?language=${locale}`),
          fetch(`/api/trends?language=${locale}`)
        ]);

        // Process Sonar digest data
        const sonarData = await sonarResponse.json();
        if (sonarData.success && sonarData.data) {
          setSonarDigest(sonarData.data);
        }

        // Process Grok digest data
        const grokData = await grokResponse.json();
        if (grokData.success && grokData.data) {
          setGrokDigest(grokData.data);
        }

        // Process news data
        const newsData = await newsResponse.json();
        if (newsData.success && newsData.data) {
          setNews(newsData.data);
        }

        // Process trends data
        const trendsData = await trendsResponse.json();
        if (trendsData.success && trendsData.data && trendsData.data.socialData) {
          setSocialData(trendsData.data.socialData);
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
      setSubscribeMessage('Thank you for subscribing to the AI News Digest!');
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

  // Get top tweets by engagement
  const topTweets = socialData?.tweets
    ? [...socialData.tweets]
        .sort((a, b) => (b.likesCount + b.retweetsCount * 2) - (a.likesCount + a.retweetsCount * 2))
        .slice(0, 3)
    : [];
    
  // Combine topics from both digests for a unified view
  const combinedTopics = [];
  
  // Add Sonar topics (prioritized)
  if (sonarDigest?.topics) {
    combinedTopics.push(...sonarDigest.topics.map(topic => ({
      ...topic,
      source: 'sonar',
      color: 'purple'
    })));
  }
  
  // Add Grok topics
  if (grokDigest?.topics) {
    combinedTopics.push(...grokDigest.topics.map(topic => ({
      ...topic,
      source: 'grok',
      color: 'blue'
    })));
  }

  return (
    <div className="relative text-purple-400/90">
      {/* Cosmic Background with Stars */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c4zIgLAAABvklEQVR4Ac3RBQEDMRAAwe1YbO7Q/5bJ/G0TaUUqJRNZJFGiYGw6RMnY+TQGG8pIwiYkFMYm5BQWbEJJYcUmVBQ2bEJDYccmdBQObEJP4cQmDBQubMJI4cYmTBQebMJM4cUmLBQ+bMJK4ccmbBQBbMJOEcImnBQhbMJFEcYm3BQRbMJDEcUmvBQxbMJHEccm/BQJbCJAkcQmQhQpbCJMkcYmIhQZbCJKkcUmYhQ5bCJOkcf+lYhQFP6ZiFFUMGwiSlHDJuIUDWwiQdHCJpIUHWwiRdHDJtIUA2wiQzHEJrIUI2wiRzHGJvIUE2yiQDHFJooUM2yiRDHHJsoUC2yiQrHEJqoUK2yiRrHGJuoUG2yiQbHFJpoUO2yiRbHHJtoUB2yiQ3HEJroUJ2yiR3HGJvoUF2xiQHHFJoYUN2xiRHHHJsYUD2xiQvHEJqYUT2xiRvHCJuYUb2xiQfHBJpYUX2xiRfHDJtYUf2xiQ/HHJrYUAXZiRxFiF04UYXbhQhFhF24UUXbhQRFjF14UcXbhQ5FgF34USXYRQJFiFyEUaXYRQZFhF1EUWXYRQ5FjF3EUeXaRQFFgF0kUJXaRQlFmFxkUFXaRRVFlF3kUNXZRQFFnFyUUDXZRRdFkF3UUbXbRQNFhF00UXXbRQtFjF20UfXbRQTFgF10UI3bRQzFmF30UE3YxQDFlF0MUc3YxQrFgF2MUK3YxQbFmF1MUG3YxQ7FlF3MUO3axQLFnF0sUB3axQnFkF1sUJ3axQXFmF1sUF3axQ3FlF3sUN3ZxQPFgF0cUT3ZxQvFiF2cUb3ZxQfFhF1cUX3ZxQ/FjFzcUf3bxQAlgFy+UEHbxRgljFx+UKHbxRYlhFz+UOHbxR0lgFwFKCrsIUdLYRYSSwS6ilCx2EaPksIs4JY9dJCgF7CJJKWIXKUoZu0hTKthFhlLFLrKUGnaRo9SxizylgV0UKPW/d1GkNLGLEqWFXZQpbeyi8vcu/gHYPQaR7h8cDQAAAABJRU5ErkJggg==')] opacity-5 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-purple-900/5 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-purple-900/5 to-purple-900/10 mix-blend-overlay"></div>
        {/* Animated stars */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="stars-1"></div>
          <div className="stars-2"></div>
          <div className="stars-3"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 mt-16 relative z-10">
        {/* Masthead */}
        <div className="border-b-4 border-purple-400/70 mb-6 pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-5xl font-bold tracking-tight font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200">AI PULSE</h1>
            <div className="text-right">
              <div className="text-xl">{formatDate(new Date())}</div>
              <div className="text-sm text-purple-300/70">The Pulse of AI Innovation</div>
            </div>
          </div>
        </div>
        
        {/* Newsletter Signup */}
        <div className="bg-black/60 border-2 border-purple-400/70 rounded-lg p-4 mb-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 md:mr-4">
              <h3 className="text-xl font-bold font-serif">Stay Ahead of AI Developments</h3>
              <p className="text-purple-300/70">Daily updates on the most important AI news, trends, and insights</p>
            </div>
            
            {subscribeMessage ? (
              <div className="text-purple-400/90 font-bold">{subscribeMessage}</div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/80 border-2 border-purple-400/70 rounded-l px-4 py-2 w-full md:w-64 text-purple-300/90"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-purple-400/80 text-black font-bold px-4 py-2 rounded-r hover:bg-purple-300/80 transition-colors"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Right Column - Social Pulse - 4/12 width */}
          <div className="lg:col-span-4 lg:order-last space-y-6">
            {/* Social Pulse Section (Repurposed to use Twitter/Grok API data) */}
            <div className="bg-black/40 border-2 border-purple-400/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 border-b border-purple-400/30 pb-2 font-serif">
                SOCIAL PULSE
              </h3>
              {(topTweets.length > 0 || (socialData && socialData.hashtags && socialData.hashtags.length > 0)) ? (
                <div className="space-y-4">
                  {/* Trending Hashtags */}
                  {socialData && socialData.hashtags && socialData.hashtags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-purple-400 font-bold mb-3 text-sm">TRENDING HASHTAGS</h4>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {socialData.hashtags.slice(0, 4).map((hashtag, index) => (
                          <div
                            key={hashtag.hashtag}
                            className="bg-black/80 border border-purple-400/30 rounded-lg p-3"
                          >
                            <div className="text-purple-400 font-bold">
                              #{hashtag.hashtag}
                            </div>
                            <div className="flex justify-between items-center mt-1 text-xs">
                              <span className="text-purple-300/70">{hashtag.tweetCount} tweets</span>
                              <span className="bg-purple-400/20 text-purple-300 px-2 py-0.5 rounded">
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
                      <h4 className="text-purple-400 font-bold mb-3 text-sm">VIRAL TWEETS</h4>
                      <div className="space-y-4">
                        {topTweets.slice(0, 2).map((tweet, index) => (
                          <div
                            key={tweet.id}
                            className="bg-black/80 border border-purple-400/30 rounded-lg p-4 hover:border-purple-400/60 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-purple-400/20 rounded-full flex items-center justify-center text-purple-400">
                                @
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-bold text-purple-300">
                                      {tweet.authorName || tweet.authorUsername}
                                      {tweet.isVerified && (
                                        <span className="ml-1 text-blue-400">✓</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-purple-400/70">
                                      @{tweet.authorUsername}
                                    </div>
                                  </div>
                                  <div className="text-xs text-purple-400/50 bg-purple-400/10 px-2 py-1 rounded">
                                    Impact: {tweet.likesCount + tweet.retweetsCount * 2}
                                  </div>
                                </div>
                                <div className="mt-3 text-purple-200">{tweet.content}</div>
                                <div className="mt-3 flex items-center text-xs text-purple-400/70 space-x-4">
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
                      className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center"
                    >
                      View full social media analysis
                      <span className="ml-1">→</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-black/60 border border-yellow-400/30 rounded-lg p-4 text-center">
                  <h4 className="text-yellow-400 font-bold mb-2">No Social Data Available</h4>
                  <p className="text-purple-300 mb-4">
                    The application is now configured to use real data from Twitter, but no data has been fetched yet.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Column - AI Pulse Digest (Combined Sonar & Grok) - 8/12 width */}
          <div className="lg:col-span-8 space-y-6">
            {/* Unified AI Pulse Digest Section */}
            <div className="bg-black/60 border-2 border-indigo-500/40 rounded-lg p-6 backdrop-blur-sm shadow-lg">
              <div className="flex items-center mb-6">
                <h2 className="text-3xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300 mr-3">AI PULSE DIGEST</h2>
                <div className="flex-grow h-px bg-gradient-to-r from-purple-500/50 via-indigo-500/30 to-transparent"></div>
              </div>
              
              <div className="mb-6">
                <p className="text-lg text-indigo-200/90 mb-4 leading-relaxed">
                  {sonarDigest?.summary || grokDigest?.summary || "Your comprehensive digest of the most impactful AI developments, combining insights from multiple intelligence sources."}
                </p>
              </div>
              
              {/* Featured Topics Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Top 3 Combined Topics */}
                {combinedTopics.slice(0, 3).map((topic, index) => (
                  <div 
                    key={`topic-${index}`}
                    className={`bg-black/80 border border-${topic.color}-500/40 rounded-lg p-5 transition-all duration-300 hover:border-${topic.color}-400/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]`}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`bg-${topic.color}-600/80 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3`}>
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <h4 className={`text-2xl font-bold text-${topic.color}-200`}>{topic.title}</h4>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs text-${topic.color}-400/80 uppercase tracking-wider px-2 py-0.5 rounded-full bg-${topic.color}-900/30 border border-${topic.color}-500/30`}>
                            {topic.source === 'sonar' ? 'Sonar AI' : 'Grok AI'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`mb-4 bg-${topic.color}-900/10 p-3 rounded-lg border-l-4 border-${topic.color}-500/50`}>
                      <h5 className={`text-${topic.color}-300 font-bold text-sm mb-1 uppercase tracking-wider`}>SUMMARY</h5>
                      <p className={`text-${topic.color}-200/90`}>{topic.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className={`bg-${topic.color}-900/10 p-3 rounded-lg border-l-4 border-pink-500/50`}>
                        <h5 className="text-pink-300 font-bold text-sm mb-1 uppercase tracking-wider flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                          WHY VIRAL
                        </h5>
                        <p className={`text-${topic.color}-200/90`}>{topic.viralReason}</p>
                      </div>
                      
                      <div className={`bg-${topic.color}-900/10 p-3 rounded-lg border-l-4 border-blue-500/50`}>
                        <h5 className="text-blue-300 font-bold text-sm mb-1 uppercase tracking-wider flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          WHY VALUABLE
                        </h5>
                        <p className={`text-${topic.color}-200/90`}>{topic.valueReason}</p>
                      </div>
                    </div>
                    
                    {/* Source links */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700/30">
                      <div className="flex space-x-2">
                        {topic.citations && topic.citations.slice(0, 2).map((citation, idx) => (
                          <a 
                            key={idx}
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs text-${topic.color}-400 hover:text-${topic.color}-300 bg-black/40 px-2 py-1 rounded-full border border-${topic.color}-500/30`}
                          >
                            {citation.type === 'x-post' ? 'X Post' : citation.title.substring(0, 15) + '...'}
                          </a>
                        ))}
                      </div>
                      
                      <a
                        href={topic.source === 'sonar' ? '/news/sonar-digest' : '/news/grok-digest'}
                        className={`text-${topic.color}-400 hover:text-${topic.color}-300 text-xs inline-flex items-center`}
                      >
                        More details
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* More Topics Section */}
              {combinedTopics.length > 3 && (
                <div className="mt-6 pt-4 border-t border-indigo-500/30">
                  <h3 className="text-xl font-bold mb-4 text-indigo-300">More AI Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {combinedTopics.slice(3, 7).map((topic, index) => (
                      <div 
                        key={`more-topic-${index}`}
                        className={`bg-black/80 border border-${topic.color}-500/20 rounded-lg p-3 hover:border-${topic.color}-400/40 transition-colors`}
                      >
                        <div className="flex items-start">
                          <span className={`text-xs text-${topic.color}-400/80 uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-${topic.color}-900/30 border border-${topic.color}-500/20 mr-2 mt-1`}>
                            {topic.source === 'sonar' ? 'Sonar' : 'Grok'}
                          </span>
                          <h4 className={`font-bold text-${topic.color}-300 text-sm`}>{topic.title}</h4>
                        </div>
                        <p className={`text-xs text-${topic.color}-200/80 mt-2 line-clamp-2`}>{topic.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Consolidated News Section */}
            <div className="bg-black/40 border-2 border-purple-400/30 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 font-serif border-b border-purple-400/30 pb-2">
                AI NEWS COVERAGE
              </h3>
              <div className="space-y-4">
                {/* Featured News (first 4 items) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {news.slice(0, 4).map((item) => (
                    <div
                      key={`featured-${item.id}`}
                      className="bg-black/80 border border-purple-400/30 rounded-lg p-3 hover:border-purple-400/60 transition-colors"
                    >
                      <h4 className="font-bold text-purple-300 mb-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-purple-200"
                        >
                          {item.title}
                        </a>
                      </h4>
                      {item.summary && (
                        <p className="text-sm text-purple-300/70 mb-2 line-clamp-2">
                          {item.summary}
                        </p>
                      )}
                      <div className="text-xs text-purple-400/60 flex items-center">
                        <span className="font-medium">{item.source}</span>
                        <span className="mx-2">•</span>
                        <time dateTime={new Date(item.published_date).toISOString()}>
                          {formatDate(item.published_date)}
                        </time>
                        {item.importance_score && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-yellow-400">
                              Impact Score: {Math.round(item.importance_score)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Additional News (remaining items) */}
                <div className="border-t border-purple-400/30 pt-4">
                  <h4 className="text-lg font-bold mb-3 text-purple-300">More AI News</h4>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {news.slice(4).map((item) => (
                      <div key={item.id} className="border-l-2 border-purple-400/50 pl-3 mb-3 pb-3 border-b border-purple-400/20">
                        <h4 className="font-bold text-purple-300">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-200"
                          >
                            {item.title}
                          </a>
                        </h4>
                        {item.summary && (
                          <p className="text-sm text-purple-300/70 mt-1 mb-2 line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                        <div className="text-xs text-purple-400/60 mt-1 flex items-center">
                          <span className="font-medium">{item.source}</span>
                          <span className="mx-2">•</span>
                          <time dateTime={new Date(item.published_date).toISOString()}>
                            {formatDate(item.published_date)}
                          </time>
                          {item.categories && item.categories.length > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="bg-purple-900/40 px-2 py-0.5 rounded text-xs">
                                {item.categories[0]}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {news.length <= 4 && (
                      <div className="text-center text-purple-400/60 py-4">
                        No additional articles available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-6 border-t-4 border-purple-400/50 text-center">
          <p className="text-purple-300/70">
            AI PULSE - Your comprehensive source for AI news, trends, and insights
          </p>
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
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.5);
        }
      `}</style>
    </div>
  );
}