'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tweet } from '@/types/twitter';

interface SocialTrendInsightsProps {
  tweets: any[];
  hashtags: {
    hashtag: string;
    tweetCount: number;
    totalLikes: number;
    totalRetweets: number;
    totalReplies?: number;
    impactScore: number;
  }[];
}

export function SocialTrendInsights({ tweets, hashtags }: SocialTrendInsightsProps) {
  const [activeTab, setActiveTab] = useState<'tweets' | 'hashtags'>('tweets');

  // Convert database format to component format if needed
  const formattedTweets = tweets.map(tweet => {
    // Handle both camelCase and snake_case formats
    return {
      id: tweet.id,
      content: tweet.content,
      authorUsername: tweet.authorUsername || tweet.author_username,
      authorName: tweet.authorName || tweet.author_name,
      authorFollowersCount: tweet.authorFollowersCount || tweet.author_followers_count || 0,
      likesCount: tweet.likesCount || tweet.likes_count || 0,
      retweetsCount: tweet.retweetsCount || tweet.retweets_count || 0,
      repliesCount: tweet.repliesCount || tweet.replies_count || 0,
      quoteCount: tweet.quoteCount || tweet.quote_count || 0,
      url: tweet.url,
      createdAt: typeof tweet.createdAt === 'string' ? new Date(tweet.createdAt) :
                 typeof tweet.created_at === 'string' ? new Date(tweet.created_at) :
                 new Date(),
      impactScore: tweet.impactScore || tweet.impact_score || 0,
      isVerified: tweet.isVerified || tweet.is_verified || false,
      hashtags: tweet.hashtags || []
    };
  });

  // Convert hashtags to component format if needed
  const formattedHashtags = hashtags.map(hashtag => {
    // Handle both camelCase and snake_case formats
    return {
      hashtag: hashtag.hashtag,
      tweetCount: hashtag.tweetCount || (hashtag as any).tweet_count || 0,
      totalLikes: hashtag.totalLikes || (hashtag as any).total_likes || 0,
      totalRetweets: hashtag.totalRetweets || (hashtag as any).total_retweets || 0,
      totalReplies: hashtag.totalReplies || (hashtag as any).total_replies || 0,
      impactScore: hashtag.impactScore || (hashtag as any).impact_score || 0
    };
  });

  return (
    <div className="bg-black/60 border-2 border-green-400 rounded p-6 font-mono">
      <h3 className="text-green-400 font-bold mb-6 text-xl pixel-font">
        SOCIAL MEDIA PULSE
      </h3>

      <div className="flex mb-6 border-b border-green-400/30">
        <button
          className={`px-4 py-2 ${
            activeTab === 'tweets'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-green-400/50 hover:text-green-400/70'
          }`}
          onClick={() => setActiveTab('tweets')}
        >
          VIRAL TWEETS
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'hashtags'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-green-400/50 hover:text-green-400/70'
          }`}
          onClick={() => setActiveTab('hashtags')}
        >
          TRENDING HASHTAGS
        </button>
      </div>

      {activeTab === 'tweets' ? (
        <div className="space-y-4">
          {formattedTweets.length > 0 ? (
            formattedTweets.map((tweet, index) => (
              <motion.div
                key={tweet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                      <div>💬 {tweet.repliesCount}</div>
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
              </motion.div>
            ))
          ) : (
            <div className="bg-black/60 border border-yellow-400/30 rounded-lg p-4 text-center">
              <h4 className="text-yellow-400 font-bold mb-2">No Viral Tweets Available</h4>
              <p className="text-green-300 mb-4">
                The application is now configured to use real data from Twitter, but no tweets have been fetched yet.
              </p>
              <div className="text-left bg-black/40 p-4 rounded text-sm">
                <p className="font-bold text-green-400 mb-2">To fetch real tweets:</p>
                <ol className="list-decimal list-inside space-y-2 text-green-300">
                  <li>Make sure your Twitter API key is set in the .env file</li>
                  <li>Run <code className="bg-green-900/30 px-2 py-1 rounded">node scripts/fetch-twitter-data.js</code></li>
                  <li>Refresh the page</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {formattedHashtags.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formattedHashtags.map((hashtag, index) => (
                  <motion.div
                    key={hashtag.hashtag}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-black/80 border border-green-400/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-lg text-green-400 font-bold">
                        #{hashtag.hashtag}
                      </div>
                      <div className="text-xs bg-green-400/20 text-green-300 px-2 py-1 rounded">
                        Score: {Math.round(hashtag.impactScore)}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-black/60 p-2 rounded">
                        <div className="text-green-400/70">Tweets</div>
                        <div className="text-green-300 font-bold">
                          {hashtag.tweetCount}
                        </div>
                      </div>
                      <div className="bg-black/60 p-2 rounded">
                        <div className="text-green-400/70">Likes</div>
                        <div className="text-green-300 font-bold">
                          {hashtag.totalLikes}
                        </div>
                      </div>
                      <div className="bg-black/60 p-2 rounded">
                        <div className="text-green-400/70">Retweets</div>
                        <div className="text-green-300 font-bold">
                          {hashtag.totalRetweets}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 text-xs text-green-400/50 bg-black/40 p-3 rounded">
                Hashtag impact scores are calculated based on engagement metrics
                including tweet volume, likes, retweets, and user influence.
              </div>
            </div>
          ) : (
            <div className="bg-black/60 border border-yellow-400/30 rounded-lg p-4 text-center">
              <h4 className="text-yellow-400 font-bold mb-2">No Trending Hashtags Available</h4>
              <p className="text-green-300 mb-4">
                The application is now configured to use real data from Twitter, but no hashtags have been fetched yet.
              </p>
              <div className="text-left bg-black/40 p-4 rounded text-sm">
                <p className="font-bold text-green-400 mb-2">To fetch real hashtags:</p>
                <ol className="list-decimal list-inside space-y-2 text-green-300">
                  <li>Make sure your Twitter API key is set in the .env file</li>
                  <li>Run <code className="bg-green-900/30 px-2 py-1 rounded">node scripts/fetch-twitter-data.js</code></li>
                  <li>Refresh the page</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}