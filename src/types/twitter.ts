export interface Tweet {
  id: string;
  content: string;
  authorUsername: string;
  authorName?: string;
  authorFollowersCount: number;
  likesCount: number;
  retweetsCount: number;
  repliesCount: number;
  quoteCount: number;
  url?: string;
  createdAt: Date;
  isVerified: boolean;
  hashtags: string[];
}

export interface TweetHashtag {
  hashtag: string;
  tweetCount: number;
  totalLikes: number;
  totalRetweets: number;
  totalReplies: number;
  impactScore: number;
}

export interface TweetData {
  id: string;
  content: string;
  author_username: string;
  author_name?: string;
  author_followers_count: number;
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  quote_count: number;
  url?: string;
  created_at: string;
  is_verified: boolean;
}

export interface TweetTechnologyData {
  relevance_score: number;
  tweets: TweetData;
} 