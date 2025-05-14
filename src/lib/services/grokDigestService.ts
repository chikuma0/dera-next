// src/lib/services/grokDigestService.ts

import { validateEnv } from '../config/env';
import { createClient } from '@supabase/supabase-js';

export interface GrokDigestTopic {
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
  relatedHashtags?: {
    hashtag: string;
    tweetCount: number;
    totalLikes: number;
    totalRetweets: number;
    totalReplies: number;
    impactScore: number;
  }[];
  relatedTweets?: {
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
  }[];
  twitterImpactScore?: number;
}

export interface GrokWeeklyDigest {
  id?: string;
  title: string;
  date: Date;
  summary: string;
  topics: GrokDigestTopic[];
  rawHtml: string;
  publishedAt: Date;
}

export class GrokDigestService {
  private apiKey: string;
  private apiEndpoint: string = 'https://api.x.ai/v1/chat/completions';
  private supabase;

  constructor() {
    // Get API key from environment variable
    this.apiKey = process.env.XAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('GrokDigestService: No xAI API key found in environment variables');
    }

    // Initialize Supabase client
    const env = validateEnv();
    this.supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  }

  /**
   * Generate a weekly digest of AI news using Grok AI
   */
  public async generateWeeklyDigest(): Promise<GrokWeeklyDigest | null> {
    try {
      if (!this.apiKey) {
        throw new Error('No xAI API key found in environment variables');
      }

      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      
      // Format dates for display
      const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Craft the prompt for Grok
      const prompt = this.createGrokPrompt();

      // Call the Grok API
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'x-api-version': '2023-12-01-preview'
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that specializes in creating weekly digests of AI news. You have access to the latest information from the web and X (formerly Twitter).'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Grok API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content returned from Grok API');
      }

      // Log the content for debugging
      console.log('Raw content from Grok API:', content);

      // Parse the HTML content
      const { topics, summary } = this.parseGrokResponse(content);

      // Log the parsed topics
      console.log('Parsed topics:', topics);

      // Create the digest object
      const digest: GrokWeeklyDigest = {
        title: `AI News Weekly Digest: ${formattedDate}`,
        date: today,
        summary,
        topics,
        rawHtml: content,
        publishedAt: new Date()
      };

      // Store the digest in the database
      await this.storeDigestInDatabase(digest);

      return digest;
    } catch (error) {
      console.error('Error generating Grok weekly digest:', error);
      return null;
    }
  }

  /**
   * Get the latest weekly digest from the database
   */
  public async getLatestWeeklyDigest(): Promise<GrokWeeklyDigest | null> {
    try {
      // Try to get the digest from the database first
      try {
        const { data: digestData, error } = await this.supabase
          .from('grok_digests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && digestData) {
          console.log('Retrieved digest from database');
          
          // Parse the stored digest
          const digest: GrokWeeklyDigest = {
            id: digestData.id,
            title: digestData.title,
            date: new Date(digestData.date),
            summary: digestData.summary,
            topics: digestData.topics,
            rawHtml: digestData.raw_html,
            publishedAt: new Date(digestData.published_at)
          };

          return digest;
        }
      } catch (dbError) {
        console.error('Error fetching from database:', dbError);
      }

      // If we're here, the database fetch failed
      // Try to get the digest from the file
      try {
        const fs = require('fs');
        const path = require('path');
        
        const filePath = path.join(process.cwd(), 'public/data/grok-digest.json');
        
        if (fs.existsSync(filePath)) {
          console.log('Reading digest from file:', filePath);
          const fileData = fs.readFileSync(filePath, 'utf8');
          const digestData = JSON.parse(fileData);
          
          // Parse the stored digest
          const digest: GrokWeeklyDigest = {
            title: digestData.title,
            date: new Date(digestData.date),
            summary: digestData.summary,
            topics: digestData.topics,
            rawHtml: digestData.rawHtml,
            publishedAt: new Date(digestData.publishedAt)
          };

          return digest;
        }
      } catch (fileError) {
        console.error('Error reading digest from file:', fileError);
      }

      // If we're here, both database and file fetches failed
      // Generate a new digest
      console.log('No digest found in database or file, generating a new one...');
      return this.generateWeeklyDigest();
    } catch (error) {
      console.error('Error getting latest weekly digest:', error);
      
      // Fallback to generating a new digest if there's an error
      console.log('Falling back to generating a new digest...');
      return this.generateWeeklyDigest();
    }
  }

  /**
   * Store the digest in the database
   */
  private async storeDigestInDatabase(digest: GrokWeeklyDigest): Promise<void> {
    try {
      // Try to insert the digest into the database
      try {
        const { error: insertError } = await this.supabase
          .from('grok_digests')
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
        const fs = require('fs');
        const path = require('path');
        
        // Create the directory if it doesn't exist
        const dir = path.join(process.cwd(), 'public/data');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write the digest to a file
        const filePath = path.join(dir, 'grok-digest.json');
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
   * Create the prompt for Grok
   */
  private createGrokPrompt(): string {
    return `Generate a comprehensive weekly digest of the most up-to-date AI news, focusing on topics that are both viral (trending on X/Twitter) and valuable (significant impact in the AI field). Use DeepSearch to find the latest information from the web and X posts.

For each topic, include:
- A detailed summary of the news or development with key technical details.
- Comprehensive viral metrics (exact engagement numbers on X, trending hashtags with counts, viral discussions).
- Detailed value assessment (specific impact on AI technology, research, or society with quantifiable metrics when possible).
- In-depth insights or analysis from multiple experts or relevant sources.
- Extensive citations from reliable sources, including at least 5 news articles and 5 X posts per topic.

CRITICAL: For each topic, include at least 5-7 relevant X posts with detailed engagement metrics (likes, retweets, replies, quotes) and author information (follower count, verification status). Include at least 5-10 relevant hashtags that are trending related to this topic, with complete engagement data for each hashtag. This extensive social media context is essential for accurate social impact scoring.

Also include a comprehensive section with the top 15-20 trending AI-related hashtags on X, with detailed engagement metrics including:
- Total post count
- Total engagement (likes + retweets + replies)
- Average engagement per post
- Growth rate over the past week
- Demographic information if available

Format the digest as HTML, with clear headings and links to sources. The HTML should be well-structured with the following format:

<h1>Weekly AI News Digest</h1>
<h2>Top AI Topics</h2>

<div class="topic">
  <h3>[Topic Title]</h3>
  <p><strong>Summary:</strong> [Detailed summary of the news with technical details]</p>
  <p><strong>Why Viral:</strong> [Comprehensive explanation of why this topic is trending, including exact metrics like engagement numbers]</p>
  <p><strong>Why Valuable:</strong> [Detailed explanation of the significance and potential impact with specific metrics]</p>
  <p><strong>Insights:</strong> [In-depth analysis from multiple expert sources]</p>
  <p><strong>X Posts:</strong> [5-7 relevant X posts with detailed engagement metrics and author information]</p>
  <p><strong>Related Hashtags:</strong> [5-10 relevant hashtags for this topic with engagement data]</p>
  <p><strong>Citations:</strong> [Extensive links to sources, including at least 5 news articles and 5 X posts]</p>
</div>

<h2>Trending AI Hashtags on X</h2>
<ul>
  <li>#[Hashtag1] - [Detailed engagement metrics including post count, total engagement, average engagement, growth rate]</li>
  <li>#[Hashtag2] - [Detailed engagement metrics including post count, total engagement, average engagement, growth rate]</li>
  <!-- More hashtags -->
</ul>

Include 5-8 topics in total, with a strong emphasis on data richness. Make sure each topic has comprehensive social media context to enable accurate social impact scoring.`;
  }

  /**
   * Parse the Grok response to extract topics and summary
   */
  private parseGrokResponse(htmlContent: string): { topics: GrokDigestTopic[], summary: string } {
    // This is a simple parser - in a real implementation, you might want to use a proper HTML parser
    const topics: GrokDigestTopic[] = [];
    let summary = '';

    // Extract the summary (assuming it's in a paragraph after the h1)
    const summaryMatch = htmlContent.match(/<h1>.*?<\/h1>\s*<p>(.*?)<\/p>/);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    }

    // Extract trending hashtags section if present
    let trendingHashtags: string[] = [];
    const hashtagSectionMatch = htmlContent.match(/<h2>Trending AI Hashtags on X<\/h2>\s*<ul>([\s\S]*?)<\/ul>/);
    if (hashtagSectionMatch && hashtagSectionMatch[1]) {
      const hashtagListItems = hashtagSectionMatch[1].match(/<li>(.*?)<\/li>/g) || [];
      trendingHashtags = hashtagListItems.map(item => {
        const hashtagMatch = item.match(/<li>#([^<\s-]+)/);
        return hashtagMatch ? hashtagMatch[1] : '';
      }).filter(Boolean);
    }

    // Extract topics from the full HTML document
    // Updated regex to capture X Posts and Related Hashtags sections if present
    const topicRegex = /<div class="topic">[\s\S]*?<h3>(.*?)<\/h3>[\s\S]*?<p><strong>Summary:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Why Viral:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Why Valuable:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Insights:<\/strong>\s*(.*?)<\/p>([\s\S]*?)<p><strong>Citations:<\/strong>\s*([\s\S]*?)<\/p>[\s\S]*?<\/div>/g;
    
    let match;
    while ((match = topicRegex.exec(htmlContent)) !== null) {
      const title = match[1].trim();
      const summary = match[2].trim();
      const viralReason = match[3].trim();
      const valueReason = match[4].trim();
      const insights = match[5].trim();
      const middleSection = match[6].trim(); // This might contain X Posts and Related Hashtags
      const citationsHtml = match[7].trim();

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

      // Extract X posts if present
      const xPostsMatch = middleSection.match(/<p><strong>X Posts:<\/strong>\s*([\s\S]*?)<\/p>/);
      
      // Extract related hashtags if present
      const hashtagsMatch = middleSection.match(/<p><strong>Related Hashtags:<\/strong>\s*([\s\S]*?)<\/p>/);
      
      topics.push({
        title,
        summary,
        viralReason,
        valueReason,
        insights,
        citations
      });
    }

    // Add trending hashtags to each topic based on relevance
    for (const topic of topics) {
      // Find hashtags that might be related to this topic
      const topicWords = topic.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      const relatedHashtags = trendingHashtags.filter(hashtag =>
        topicWords.some(word => hashtag.toLowerCase().includes(word))
      );
      
      // If we found related hashtags, add them to the topic
      if (relatedHashtags.length > 0) {
        topic.relatedHashtags = relatedHashtags.map(hashtag => ({
          hashtag,
          tweetCount: Math.floor(Math.random() * 100) + 50, // Mock data
          totalLikes: Math.floor(Math.random() * 1000) + 500,
          totalRetweets: Math.floor(Math.random() * 500) + 100,
          totalReplies: Math.floor(Math.random() * 200) + 50,
          impactScore: Math.floor(Math.random() * 100) + 50
        }));
      }
    }

    return { topics, summary: summary || 'Weekly digest of viral and valuable AI news topics.' };
  }
}