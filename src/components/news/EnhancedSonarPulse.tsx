'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SonarWeeklyDigest } from '@/lib/services/sonarDigestService';
import { NewsItem } from '@/types/news';
import { Tweet } from '@/types/twitter';

interface EnhancedSonarPulseProps {
  // Props can be added if needed
}

export function EnhancedSonarPulse({}: EnhancedSonarPulseProps) {
  const { translate, locale } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [sonarDigest, setSonarDigest] = useState<SonarWeeklyDigest | null>(null);
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
  const [activeTab, setActiveTab] = useState<'digest' | 'social'>('digest');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [sonarResponse, newsResponse, trendsResponse] = await Promise.all([
          fetch(`/api/news/sonar-digest?language=${locale}&source=twitter-enhanced`),
          fetch(`/api/news?language=${locale}`),
          fetch(`/api/trends?language=${locale}`)
        ]);

        // Process Sonar digest data
        const sonarData = await sonarResponse.json();
        if (sonarData.success && sonarData.data) {
          setSonarDigest(sonarData.data);
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
        .slice(0, 5)
    : [];
    
  // Get top hashtags
  const topHashtags = socialData?.hashtags
    ? [...socialData.hashtags]
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 6)
    : [];

  return (
    <div className="relative text-purple-400/90">
      {/* Cosmic Background with Stars */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-purple-900/5 mix-blend-overlay"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 mt-16 relative z-10">
        {/* Enhanced Masthead */}
        <div className="border-b-4 border-purple-400/70 mb-6 pb-4 relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <div className="flex flex-col">
              <h1 className="text-5xl font-bold tracking-tight font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
                SONAR PULSE
              </h1>
              <div className="text-sm text-purple-300/70 mt-1">
                Comprehensive AI News & Social Media Intelligence
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl">{formatDate(new Date())}</div>
              <div className="text-sm text-purple-300/70 flex items-center justify-end">
                <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></span>
                Live AI Insights
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-purple-400/30">
          <button
            className={`px-6 py-3 font-bold ${
              activeTab === 'digest'
                ? 'text-purple-300 border-b-2 border-purple-400 bg-purple-900/10'
                : 'text-purple-400/50 hover:text-purple-400/70 hover:bg-purple-900/5'
            } transition-all duration-200`}
            onClick={() => setActiveTab('digest')}
          >
            AI NEWS DIGEST
          </button>
          <button
            className={`px-6 py-3 font-bold ${
              activeTab === 'social'
                ? 'text-purple-300 border-b-2 border-purple-400 bg-purple-900/10'
                : 'text-purple-400/50 hover:text-purple-400/70 hover:bg-purple-900/5'
            } transition-all duration-200`}
            onClick={() => setActiveTab('social')}
          >
            SOCIAL PULSE
          </button>
        </div>
        
        {/* Main Content */}
        {activeTab === 'digest' ? (
          <div className="space-y-6">
            {/* Enhanced AI Digest Section */}
            <div className="bg-black/60 border-2 border-indigo-500/40 rounded-lg p-6 backdrop-blur-sm shadow-lg">
              <div className="flex items-center mb-6">
                <h2 className="text-3xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300 mr-3">
                  THIS WEEK IN AI
                </h2>
                <div className="flex-grow h-px bg-gradient-to-r from-purple-500/50 via-indigo-500/30 to-transparent"></div>
              </div>
              
              <div className="mb-6 bg-black/40 p-5 rounded-lg border-l-4 border-purple-500">
                <p className="text-lg text-indigo-200/90 leading-relaxed">
                  {sonarDigest?.summary || "Your comprehensive digest of the most impactful AI developments, combining insights from multiple intelligence sources."}
                </p>
              </div>
              
              {/* Featured Topics Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Top Topics */}
                {sonarDigest?.topics && sonarDigest.topics.slice(0, 4).map((topic, index) => (
                  <div 
                    key={`topic-${index}`}
                    className="bg-black/80 border border-purple-500/40 rounded-lg p-5 transition-all duration-300 hover:border-purple-400/60 hover:shadow-lg"
                  >
                    <div className="flex items-center mb-3">
                      <div className="bg-purple-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3 shadow-lg">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-2xl font-bold text-purple-200">{topic.title}</h4>
                      </div>
                    </div>
                    
                    <div className="mb-4 bg-purple-900/10 p-4 rounded-lg border-l-4 border-purple-500/50">
                      <h5 className="text-purple-300 font-bold text-sm mb-1 uppercase tracking-wider">SUMMARY</h5>
                      <p className="text-purple-200/90">{topic.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-purple-900/10 p-4 rounded-lg border-l-4 border-pink-500/50">
                        <h5 className="text-pink-300 font-bold text-sm mb-1 uppercase tracking-wider">
                          WHY VIRAL
                        </h5>
                        <p className="text-purple-200/90">{topic.viralReason}</p>
                      </div>
                      
                      <div className="bg-purple-900/10 p-4 rounded-lg border-l-4 border-blue-500/50">
                        <h5 className="text-blue-300 font-bold text-sm mb-1 uppercase tracking-wider">
                          WHY VALUABLE
                        </h5>
                        <p className="text-purple-200/90">{topic.valueReason}</p>
                      </div>
                    </div>
                    
                    {/* Social Media Integration */}
                    {topTweets.length > 0 && index === 0 && (
                      <div className="mt-4 pt-4 border-t border-purple-500/30">
                        <h5 className="text-purple-300 font-bold text-sm mb-3 uppercase tracking-wider">
                          SOCIAL MEDIA PULSE
                        </h5>
                        <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center text-blue-400">
                              @
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-bold text-blue-300">
                                    {topTweets[0].authorName || topTweets[0].authorUsername}
                                    {topTweets[0].isVerified && (
                                      <span className="ml-1 text-blue-400">✓</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-1 text-sm text-blue-200">{topTweets[0].content}</div>
                              <div className="mt-2 flex items-center text-xs text-blue-400/70 space-x-4">
                                <div>❤️ {topTweets[0].likesCount}</div>
                                <div>🔄 {topTweets[0].retweetsCount}</div>
                                <a
                                  href={topTweets[0].url}
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Social Pulse Section */}
            <div className="bg-black/60 border-2 border-blue-500/40 rounded-lg p-6 backdrop-blur-sm shadow-lg">
              <div className="flex items-center mb-6">
                <h2 className="text-3xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 mr-3">
                  SOCIAL MEDIA PULSE
                </h2>
                <div className="flex-grow h-px bg-gradient-to-r from-blue-500/50 via-purple-500/30 to-transparent"></div>
              </div>
              
              {/* Trending Hashtags */}
              {topHashtags.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-blue-300">Trending AI Hashtags</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {topHashtags.map((hashtag, index) => (
                      <div
                        key={hashtag.hashtag}
                        className="bg-black/80 border border-blue-500/30 rounded-lg p-4 hover:border-blue-400/50 transition-all duration-300"
                      >
                        <div className="text-lg text-blue-300 font-bold mb-2">
                          #{hashtag.hashtag}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-blue-400/70">{hashtag.tweetCount} tweets</span>
                          <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded-full">
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
                  <h3 className="text-xl font-bold mb-4 text-blue-300">Viral AI Tweets</h3>
                  <div className="space-y-4">
                    {topTweets.map((tweet, index) => (
                      <div
                        key={tweet.id}
                        className="bg-black/80 border border-blue-500/30 rounded-lg p-4 hover:border-blue-400/50 transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                            @
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-blue-300">
                                  {tweet.authorName || tweet.authorUsername}
                                  {tweet.isVerified && (
                                    <span className="ml-1 text-blue-400">✓</span>
                                  )}
                                </div>
                                <div className="text-xs text-blue-400/70">
                                  @{tweet.authorUsername}
                                </div>
                              </div>
                              <div className="text-xs text-blue-400/50 bg-blue-900/30 px-2 py-1 rounded-full">
                                Impact: {tweet.likesCount + tweet.retweetsCount * 2}
                              </div>
                            </div>
                            <div className="mt-3 text-blue-200">{tweet.content}</div>
                            <div className="mt-3 flex items-center text-xs text-blue-400/70 space-x-4">
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
              
              {topTweets.length === 0 && topHashtags.length === 0 && (
                <div className="bg-black/60 border border-yellow-400/30 rounded-lg p-6 text-center">
                  <h4 className="text-yellow-400 font-bold mb-2">No Social Data Available</h4>
                  <p className="text-blue-300 mb-4">
                    The application is now configured to use real data from Twitter, but no data has been fetched yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-12 pt-6 border-t-4 border-purple-400/50 text-center">
          <p className="text-purple-300/70">
            SONAR PULSE - Your comprehensive source for AI news, trends, and social media insights
          </p>
        </div>
      </div>
    </div>
  );
}