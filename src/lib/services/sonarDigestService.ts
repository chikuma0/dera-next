// src/lib/services/sonarDigestService.ts

import { validateEnv } from '../config/env';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { GrokTwitterService, Tweet, TweetHashtag } from './grokTwitterService';

export interface SonarDigestTopic {
  title: string;
  summary: string;
  viralReason: string;
  valueReason: string;
  insights: string;
  citations: {
    title: string;
    url: string;
    type: 'article' | 'x-post';
  }[];
  // New Twitter-specific fields
  relatedTweets?: Tweet[];
  relatedHashtags?: TweetHashtag[];
  twitterImpactScore?: number;
}

export interface SonarWeeklyDigest {
  id?: string;
  title: string;
  date: Date;
  summary: string;
  topics: SonarDigestTopic[];
  rawHtml: string;
  publishedAt: Date;
}

export class SonarDigestService {
  private apiKey: string;
  private apiEndpoint: string = 'https://api.perplexity.ai/chat/completions';
  private supabase;
  private twitterService: GrokTwitterService;

  constructor() {
    // Get API key from environment variable
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('SonarDigestService: No Perplexity API key found in environment variables');
    }

    // Initialize Supabase client
    const env = validateEnv();
    this.supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    
    // Initialize Twitter service (now using Grok-based implementation)
    this.twitterService = new GrokTwitterService();
  }

  /**
   * Fetch Twitter data to enhance the Sonar digest
   */
  private async fetchTwitterData(): Promise<{
    topTweets: Tweet[];
    topHashtags: TweetHashtag[];
  }> {
    try {
      console.log('Fetching Twitter data to enhance Sonar digest...');
      
      // Get top tweets by impact score
      const topTweets = await this.twitterService.getTopTweets(10);
      
      // Get top hashtags by impact score
      const topHashtags = await this.twitterService.getTopHashtags(10);
      
      console.log(`Fetched ${topTweets.length} top tweets and ${topHashtags.length} top hashtags`);
      
      return { topTweets, topHashtags };
    } catch (error) {
      console.error('Error fetching Twitter data:', error);
      return { topTweets: [], topHashtags: [] };
    }
  }

  /**
   * Generate a weekly digest of AI news using Perplexity's Sonar API
   */
  public async generateWeeklyDigest(): Promise<SonarWeeklyDigest | null> {
    try {
      if (!this.apiKey) {
        console.warn('No Perplexity API key found in environment variables, using sample data');
        // Use the sample data from the file
        try {
          const filePath = path.join(process.cwd(), 'public/data/sonar-digest.json');
          
          if (fs.existsSync(filePath)) {
            console.log('Reading sample digest from file:', filePath);
            const fileData = fs.readFileSync(filePath, 'utf8');
            const digestData = JSON.parse(fileData);
            
            // Parse the stored digest
            const digest: SonarWeeklyDigest = {
              title: digestData.title,
              date: new Date(digestData.date),
              summary: digestData.summary,
              topics: digestData.topics,
              rawHtml: digestData.rawHtml,
              publishedAt: new Date(digestData.publishedAt)
            };

            console.log(`Sample digest has ${digest.topics.length} topics`);
            return digest;
          }
        } catch (fileError) {
          console.error('Error reading sample digest from file:', fileError);
        }
        
        throw new Error('No Perplexity API key found in environment variables');
      }
      
      // Fetch Twitter data to enhance the digest
      const { topTweets, topHashtags } = await this.fetchTwitterData();

      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      
      // Format dates for display
      const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Craft the prompt for Sonar with Twitter data and real news
      const prompt = await this.createSonarPrompt(topTweets, topHashtags);

      // Call the Sonar API
      console.log('Calling Perplexity Sonar API with real news data...');
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'sonar-deep-research',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that specializes in creating weekly digests of AI news. You have access to the latest information from the web and social media.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Sonar API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content returned from Sonar API');
      }

      // Log the content for debugging
      console.log('Raw content from Sonar API:', content);

      // Parse the HTML content
      const { topics, summary } = await this.parseSonarResponse(content);

      // Log the parsed topics
      console.log('Parsed topics:', topics);

      // Create the digest object
      const digest: SonarWeeklyDigest = {
        title: `AI News Weekly Digest: ${formattedDate}`,
        date: today,
        summary,
        topics,
        rawHtml: content,
        publishedAt: new Date()
      };

      // Store the digest in the database or file
      await this.storeDigestInDatabase(digest);

      return digest;
    } catch (error) {
      console.error('Error generating Sonar weekly digest:', error);
      return null;
    }
  }

  /**
   * Get the latest weekly digest from the database or file
   */
  public async getLatestWeeklyDigest(): Promise<SonarWeeklyDigest | null> {
    try {
      // Try to get the digest from the database first
      try {
        const { data: digestData, error } = await this.supabase
          .from('sonar_digests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && digestData) {
          console.log('Retrieved digest from database');
          
          // Parse the stored digest
          const digest: SonarWeeklyDigest = {
            id: digestData.id,
            title: digestData.title,
            date: new Date(digestData.date),
            summary: digestData.summary,
            topics: digestData.topics,
            rawHtml: digestData.raw_html,
            publishedAt: new Date(digestData.published_at)
          };

          console.log(`Retrieved digest from database with ${digest.topics.length} topics`);
          return digest;
        }
      } catch (dbError) {
        console.error('Error fetching from database:', dbError);
      }

      // If we're here, the database fetch failed
      // Try to get the digest from the file
      try {
        const filePath = path.join(process.cwd(), 'public/data/sonar-digest.json');
        
        if (fs.existsSync(filePath)) {
          console.log('Reading digest from file:', filePath);
          const fileData = fs.readFileSync(filePath, 'utf8');
          const digestData = JSON.parse(fileData);
          
          // Parse the stored digest
          const digest: SonarWeeklyDigest = {
            title: digestData.title,
            date: new Date(digestData.date),
            summary: digestData.summary,
            topics: digestData.topics,
            rawHtml: digestData.rawHtml,
            publishedAt: new Date(digestData.publishedAt)
          };

          console.log(`Retrieved digest from file with ${digest.topics.length} topics`);
          console.log('Topics:', JSON.stringify(digest.topics.map(t => t.title)));
          return digest;
        }
      } catch (fileError) {
        console.error('Error reading digest from file:', fileError);
      }

      // If we're here, both database and file fetches failed
      // Return null instead of generating a new digest
      console.log('No digest found in database or file');
      return null;
    } catch (error) {
      console.error('Error getting latest weekly digest:', error);
      
      // Return null instead of generating a new digest
      console.log('Error occurred while getting digest');
      return null;
    }
  }

  /**
   * Store the digest in the database or file
   */
  private async storeDigestInDatabase(digest: SonarWeeklyDigest): Promise<void> {
    try {
      // Try to insert the digest into the database
      try {
        const { error: insertError } = await this.supabase
          .from('sonar_digests')
          .insert({
            title: digest.title,
            date: digest.date.toISOString(),
            summary: digest.summary,
            topics: digest.topics,
            raw_html: digest.rawHtml,
            published_at: digest.publishedAt.toISOString()
          });

        if (!insertError) {
          console.log('Digest stored in database successfully');
          return;
        } else {
          console.error('Error inserting digest into database:', insertError);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }

      // If we're here, the database insert failed
      // Let's store the digest in a JSON file as a fallback
      try {
        // Create the directory if it doesn't exist
        const dir = path.join(process.cwd(), 'public/data');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write the digest to a file
        const filePath = path.join(dir, 'sonar-digest.json');
        fs.writeFileSync(filePath, JSON.stringify(digest, null, 2));
        
        console.log('Digest stored in file successfully:', filePath);
      } catch (fileError) {
        console.error('Error storing digest in file:', fileError);
        throw fileError;
      }
    } catch (error) {
      console.error('Error storing digest:', error);
    }
  }

  /**
   * Create the prompt for Sonar
   */
  private async createSonarPrompt(topTweets: Tweet[] = [], topHashtags: TweetHashtag[] = []): Promise<string> {
    // Get the date range for the week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    const formattedWeekStart = weekStart.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedToday = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create a section with Twitter data to inform the AI
    let twitterDataSection = '';
    
    if (topTweets.length > 0 || topHashtags.length > 0) {
      twitterDataSection = `\n\nHere is additional Twitter data to incorporate into your analysis:\n\n`;
      
      if (topHashtags.length > 0) {
        twitterDataSection += `TOP TRENDING AI HASHTAGS ON TWITTER:\n`;
        topHashtags.forEach((hashtag, index) => {
          twitterDataSection += `${index + 1}. #${hashtag.hashtag} - ${hashtag.tweetCount} tweets, ${hashtag.totalLikes} likes, ${hashtag.totalRetweets} retweets, Impact Score: ${hashtag.impactScore}\n`;
        });
        twitterDataSection += `\n`;
      }
      
      if (topTweets.length > 0) {
        twitterDataSection += `TOP AI-RELATED TWEETS:\n`;
        topTweets.forEach((tweet, index) => {
          // Calculate impact score for the tweet
          const impactScore = this.twitterService.calculateTweetImpactScore(tweet);
          twitterDataSection += `${index + 1}. @${tweet.authorUsername}${tweet.isVerified ? ' ✓' : ''} (${tweet.authorFollowersCount} followers): "${tweet.content}"\n`;
          twitterDataSection += `   URL: ${tweet.url}\n`;
          twitterDataSection += `   Engagement: ${tweet.likesCount} likes, ${tweet.retweetsCount} retweets, Impact Score: ${impactScore}\n`;
          if (tweet.hashtags.length > 0) {
            twitterDataSection += `   Hashtags: ${tweet.hashtags.map(h => '#' + h).join(', ')}\n`;
          }
          twitterDataSection += `\n`;
        });
      }
    }

    // Fetch real news articles to include in the prompt
    let newsArticlesSection = '';
    try {
      // Get top news articles from the database
      const { data: articles, error } = await this.supabase
        .from('news_items')
        .select('*')
        .eq('language', 'en')
        .order('importance_score', { ascending: false })
        .limit(15);

      if (!error && articles && articles.length > 0) {
        newsArticlesSection = `\n\nHere are the top AI news articles from the past week that you should incorporate into your digest:\n\n`;
        
        articles.forEach((article, index) => {
          newsArticlesSection += `${index + 1}. "${article.title}"\n`;
          newsArticlesSection += `   Source: ${article.source}\n`;
          newsArticlesSection += `   URL: ${article.url}\n`;
          newsArticlesSection += `   Published: ${new Date(article.published_date).toLocaleDateString()}\n`;
          if (article.summary) {
            newsArticlesSection += `   Summary: ${article.summary.substring(0, 200)}${article.summary.length > 200 ? '...' : ''}\n`;
          }
          newsArticlesSection += `   Importance Score: ${article.importance_score || 'N/A'}\n\n`;
        });
        
        console.log(`Added ${articles.length} real news articles to the Sonar prompt`);
      } else {
        console.log('No news articles found in the database or error occurred');
      }
    } catch (error) {
      console.error('Error fetching news articles for Sonar prompt:', error);
    }

    return `Generate a comprehensive WEEKLY digest of the most impactful AI news from ${formattedWeekStart} to ${formattedToday}, focusing on topics that are both viral (trending on social media, especially Twitter/X) and valuable (significant impact in the AI field). This should be the definitive summary of the week's most important AI developments.${newsArticlesSection}${twitterDataSection}

For each topic, include:
- A brief summary of the news or development.
- Why it's considered viral (e.g., high engagement on social media, trending hashtags, viral discussions).
- Why it's valuable (e.g., potential impact on AI technology, research, industry, or society).
- Insights or analysis from experts or relevant sources.
- Citations from reliable sources, including both news articles and social media posts.

Format the digest as HTML, with clear headings and links to sources. The HTML should be well-structured with the following format:

<h1>Weekly AI News Digest: ${formattedWeekStart} - ${formattedToday}</h1>
<p>[Overall summary of the week's AI landscape and key themes]</p>
<h2>Top 5 AI Topics This Week</h2>

<div class="topic">
  <h3>[Topic Title]</h3>
  <p><strong>Summary:</strong> [Brief summary of the news]</p>
  <p><strong>Why Viral:</strong> [Explanation of why this topic is trending, including metrics like engagement numbers if available]</p>
  <p><strong>Why Valuable:</strong> [Explanation of the significance and potential impact]</p>
  <p><strong>Insights:</strong> [Analysis or expert opinions]</p>
  <p><strong>Citations:</strong> [Links to sources, including both news articles and social media posts]</p>
</div>

Include EXACTLY 5 topics, focusing on the most impactful news of the entire week. Make sure each topic is truly viral and valuable (with clear explanation of its significance). Be sure to use the real news articles I've provided as your primary sources, and supplement with your own research as needed.

Today's date is ${formattedToday}.

IMPORTANT: You must ONLY use verified, real-world sources for your research. Do not hallucinate or fabricate any sources, citations, or URLs. Every citation you include must be to a real, accessible webpage that contains the information you are citing. Do not include any Twitter/X posts, hashtags, or trends that don't actually exist. Only report on real, verifiable news and trends.

For each topic:
1. First find reliable sources that confirm the news is real
2. Only then create the topic with accurate information from those sources
3. Include ONLY citations to real, accessible webpages
4. For viral metrics, only cite real social media trends with accurate numbers
5. For expert quotes, only include real quotes from real experts that can be verified

If you cannot find reliable sources for a topic, DO NOT include that topic in the digest. It's better to have fewer topics with verified information than more topics with fabricated sources.`;
  }

  /**
   * Parse the Sonar response to extract topics and summary
   */
  private async parseSonarResponse(htmlContent: string): Promise<{ topics: SonarDigestTopic[], summary: string }> {
    // Remove the <think> section if present
    let cleanedHtml = htmlContent;
    const thinkRegex = /<think>[\s\S]*?<\/think>/;
    if (thinkRegex.test(cleanedHtml)) {
      console.log('Found <think> section in Perplexity response, removing it...');
      cleanedHtml = cleanedHtml.replace(thinkRegex, '').trim();
    }

    // This is a simple parser - in a real implementation, you might want to use a proper HTML parser
    const topics: SonarDigestTopic[] = [];
    let summary = '';

    // Extract the summary (assuming it's in a paragraph after the h1)
    const summaryMatch = cleanedHtml.match(/<h1>.*?<\/h1>\s*<p>(.*?)<\/p>/);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    }

    // Extract topics from the full HTML document
    const topicRegex = /<div class="topic">\s*<h3>(.*?)<\/h3>[\s\S]*?<p><strong>Summary:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Why Viral:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Why Valuable:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Insights:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Citations:<\/strong>\s*([\s\S]*?)<\/p>[\s\S]*?<\/div>/g;
    
    let match;
    while ((match = topicRegex.exec(cleanedHtml)) !== null) {
      const title = match[1].trim();
      const summary = match[2].trim();
      const viralReason = match[3].trim();
      const valueReason = match[4].trim();
      const insights = match[5].trim();
      const citationsHtml = match[6].trim();

      // Parse citations
      const citations: { title: string, url: string, type: 'article' | 'x-post' }[] = [];
      
      // Split the citations HTML by links
      const links = citationsHtml.match(/<a[^>]*>.*?<\/a>/g) || [];
      
      for (const link of links) {
        const urlMatch = link.match(/href="([^"]+)"/);
        const titleMatch = link.match(/>([^<]+)</);
        
        if (urlMatch && titleMatch) {
          const url = urlMatch[1];
          const title = titleMatch[1].trim();
          // Determine if it's an X post or an article based on the URL
          const type = url.includes('x.com') || url.includes('twitter.com') ? 'x-post' : 'article';
          
          citations.push({ title, url, type });
        }
      }

      // Find related tweets for this topic
      const relatedTweets = await this.findRelatedTweets(title, summary);
      
      // Find related hashtags for this topic
      const relatedHashtags = await this.findRelatedHashtags(title, summary);
      
      // Calculate Twitter impact score based on related tweets and hashtags
      const twitterImpactScore = this.calculateTwitterImpactScore(relatedTweets, relatedHashtags);

      topics.push({
        title,
        summary,
        viralReason,
        valueReason,
        insights,
        citations,
        relatedTweets,
        relatedHashtags,
        twitterImpactScore
      });
    }

    return { topics, summary: summary || 'Weekly digest of viral and valuable AI news topics.' };
  }

  /**
   * Find tweets related to a specific topic
   */
  private async findRelatedTweets(title: string, summary: string): Promise<Tweet[]> {
    try {
      // Get all top tweets
      const allTweets = await this.twitterService.getTopTweets(20);
      
      // Create a simple keyword matching algorithm
      const keywords = [...new Set([
        ...title.toLowerCase().split(/\s+/).filter(word => word.length > 3),
        ...summary.toLowerCase().split(/\s+/).filter(word => word.length > 3)
      ])];
      
      // Filter tweets that contain any of the keywords
      const relatedTweets = allTweets.filter((tweet: Tweet) => {
        const tweetContent = tweet.content.toLowerCase();
        return keywords.some((keyword: string) => tweetContent.includes(keyword));
      });
      
      // Sort by relevance (number of matching keywords)
      relatedTweets.sort((a: Tweet, b: Tweet) => {
        const aMatches = keywords.filter((keyword: string) => a.content.toLowerCase().includes(keyword)).length;
        const bMatches = keywords.filter((keyword: string) => b.content.toLowerCase().includes(keyword)).length;
        return bMatches - aMatches;
      });
      
      // Return top 3 related tweets
      return relatedTweets.slice(0, 3);
    } catch (error) {
      console.error('Error finding related tweets:', error);
      return [];
    }
  }

  /**
   * Find hashtags related to a specific topic
   */
  private async findRelatedHashtags(title: string, summary: string): Promise<TweetHashtag[]> {
    try {
      // Get all top hashtags
      const allHashtags = await this.twitterService.getTopHashtags(20);
      
      // Create a simple keyword matching algorithm
      const keywords = [...new Set([
        ...title.toLowerCase().split(/\s+/).filter(word => word.length > 3),
        ...summary.toLowerCase().split(/\s+/).filter(word => word.length > 3)
      ])];
      
      // Filter hashtags that match any of the keywords
      const relatedHashtags = allHashtags.filter((hashtag: TweetHashtag) => {
        return keywords.some((keyword: string) => hashtag.hashtag.toLowerCase().includes(keyword));
      });
      
      // Sort by impact score
      relatedHashtags.sort((a: TweetHashtag, b: TweetHashtag) => b.impactScore - a.impactScore);
      
      // Return top 3 related hashtags
      return relatedHashtags.slice(0, 3);
    } catch (error) {
      console.error('Error finding related hashtags:', error);
      return [];
    }
  }

  /**
   * Calculate Twitter impact score for a topic based on related tweets and hashtags
   */
  private calculateTwitterImpactScore(tweets: Tweet[], hashtags: TweetHashtag[]): number {
    let score = 0;
    
    // Add scores from tweets
    for (const tweet of tweets) {
      score += this.twitterService.calculateTweetImpactScore(tweet);
    }
    
    // Add scores from hashtags
    for (const hashtag of hashtags) {
      score += hashtag.impactScore;
    }
    
    // Normalize the score
    if (tweets.length > 0 || hashtags.length > 0) {
      score = score / (tweets.length + hashtags.length);
    }
    
    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }
}