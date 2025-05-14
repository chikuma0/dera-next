// src/lib/services/weeklyDigestService.ts

import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../config/env';
import { TrendDetectionService } from './trendDetectionService';
import { GrokTwitterService } from './grokTwitterService';
import { TranslationService } from './translationService';
import { ArticleService } from './articleService';

export interface WeeklyDigestTool {
  id: number;
  name: string;
  slug: string;
  description: string;
  releaseDate?: string;
  features: string[];
  viralEvidence: {
    tweetCount: number;
    totalLikes: number;
    totalRetweets: number;
    impactScore: number;
    topTweets: any[];
  };
  maturityLevel: string;
  growthRate: number;
  relatedArticles: any[];
}

export interface WeeklyDigest {
  id: number;
  title: string;
  summary: string;
  weekStart: Date;
  weekEnd: Date;
  keyPoints: string[];
  topTools: WeeklyDigestTool[];
  risingTechnologies: {
    id: number;
    name: string;
    growthRate: number;
  }[];
  comparativeAnalysis: {
    categories: string[];
    tools: string[];
    analysisText: string;
  };
  discussion: string;
  conclusion: string;
  citations: {
    title: string;
    url: string;
  }[];
  publishedAt: Date;
}

export class WeeklyDigestService {
  private supabase;
  private trendDetectionService: TrendDetectionService;
  private twitterService: GrokTwitterService;
  private translationService: TranslationService;
  private articleService: ArticleService;

  constructor() {
    const env = validateEnv();
    this.supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    this.trendDetectionService = new TrendDetectionService();
    this.twitterService = new GrokTwitterService();
    this.translationService = new TranslationService();
    this.articleService = new ArticleService();
  }

  /**
   * Generate a comprehensive weekly digest of AI trends and viral content
   */
  public async generateWeeklyDigest(): Promise<WeeklyDigest | null> {
    try {
      // Define the week range
      const today = new Date();
      const weekEnd = new Date(today);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      
      // Format dates for display
      weekStart.setHours(0, 0, 0, 0);
      weekEnd.setHours(23, 59, 59, 999);

      // Check if we already have a digest for this week
      const { data: existingDigest, error: digestError } = await this.supabase
        .from('trend_reports')
        .select('*')
        .gte('week_end', weekStart.toISOString())
        .lte('week_end', weekEnd.toISOString())
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingDigest && !digestError) {
        console.log('Found existing weekly digest:', existingDigest.id);
        return this.formatDigestFromReport(existingDigest);
      }

      // First, get all AI technologies
      const { data: techData, error: techError } = await this.supabase
        .from('ai_technologies')
        .select('id, name, slug, description, maturity_level')
        .limit(50);

      if (techError || !techData || techData.length === 0) {
        console.error('Error fetching technologies:', techError);
        return null;
      }

      // Create a map of technologies by ID for easy lookup
      const techMap = new Map<number, any>();
      for (const tech of techData) {
        techMap.set(tech.id, {
          id: tech.id,
          name: tech.name,
          slug: tech.slug,
          description: tech.description,
          maturityLevel: tech.maturity_level,
          mentions: 0,
          importance: 0,
          tweetMentions: 0,
          socialImpact: 0,
          growthRate: 0,
          count: 0
        });
      }

      // Get trend points for these technologies
      const { data: trendPoints, error: pointsError } = await this.supabase
        .from('technology_trend_points')
        .select(`
          technology_id,
          mention_count,
          importance_score,
          growth_rate,
          tweet_mention_count,
          social_impact_score
        `)
        .gte('date', weekStart.toISOString())
        .lte('date', weekEnd.toISOString())
        .order('mention_count', { ascending: false })
        .limit(100);

      if (pointsError) {
        console.error('Error fetching trend points:', pointsError);
        return null;
      }

      // Aggregate technology data
      const aggregatedTechData: Record<number, any> = {};
      
      for (const point of trendPoints || []) {
        const techId = point.technology_id;
        const tech = techMap.get(techId);
        
        if (!tech) continue; // Skip if technology not found
        
        if (!aggregatedTechData[techId]) {
          aggregatedTechData[techId] = {
            ...tech,
            mentions: 0,
            importance: 0,
            tweetMentions: 0,
            socialImpact: 0,
            growthRate: 0,
            count: 0
          };
        }
        
        aggregatedTechData[techId].mentions += point.mention_count || 0;
        aggregatedTechData[techId].importance += point.importance_score || 0;
        aggregatedTechData[techId].tweetMentions += point.tweet_mention_count || 0;
        aggregatedTechData[techId].socialImpact += point.social_impact_score || 0;
        aggregatedTechData[techId].growthRate += point.growth_rate || 0;
        aggregatedTechData[techId].count += 1;
      }
      
      // Convert to array and calculate averages
      const technologies = Object.values(aggregatedTechData)
        .map(tech => ({
          ...tech,
          importance: tech.importance / (tech.count || 1),
          socialImpact: tech.socialImpact / (tech.count || 1),
          growthRate: tech.growthRate / (tech.count || 1)
        }))
        .sort((a, b) => {
          // Sort by a combination of mentions, social impact, and growth rate
          const aScore = a.mentions * 0.4 + a.socialImpact * 0.4 + (a.growthRate > 0 ? a.growthRate * 100 : 0) * 0.2;
          const bScore = b.mentions * 0.4 + b.socialImpact * 0.4 + (b.growthRate > 0 ? b.growthRate * 100 : 0) * 0.2;
          return bScore - aScore;
        });

      // Get top 5 technologies
      const topTechnologies = technologies.slice(0, 5);
      
      // Get rising technologies (highest positive growth rate)
      const risingTechnologies = [...technologies]
        .filter(tech => tech.growthRate > 0)
        .sort((a, b) => b.growthRate - a.growthRate)
        .slice(0, 5);

      // Fetch related articles for each top technology
      const topTools: WeeklyDigestTool[] = [];
      
      for (const tech of topTechnologies) {
        // Get related articles
        const { data: articles, error: articlesError } = await this.supabase
          .from('news_item_technologies')
          .select(`
            relevance_score,
            news_items(id, title, url, published_date, source, importance_score, summary)
          `)
          .eq('technology_id', tech.id)
          .gte('news_items.published_date', weekStart.toISOString())
          .lte('news_items.published_date', weekEnd.toISOString())
          .order('relevance_score', { ascending: false })
          .limit(10);
        
        if (articlesError) {
          console.error(`Error fetching articles for technology ${tech.id}:`, articlesError);
          continue;
        }
        
        // Get related tweets
        const tweets = await this.twitterService.getTweetsByTechnology(tech.id, 10);
        
        // Extract release date from articles if available
        let releaseDate: string | undefined;
        
        // Process articles to ensure proper typing
        const relatedArticles: Array<{
          id: string;
          title: string;
          url: string;
          published_date: string;
          source: string;
          importance_score: number;
          summary: string | null;
        }> = [];
        
        if (articles) {
          for (const item of articles) {
            // The news_items property might be an array or an object depending on how Supabase returns it
            const newsItem = Array.isArray(item.news_items) ? item.news_items[0] : item.news_items;
            
            if (newsItem) {
              relatedArticles.push({
                id: newsItem.id || '',
                title: newsItem.title || '',
                url: newsItem.url || '',
                published_date: newsItem.published_date || new Date().toISOString(),
                source: newsItem.source || '',
                importance_score: newsItem.importance_score || 0,
                summary: newsItem.summary || null
              });
            }
          }
        }
        
        // Look for release date in article titles and summaries
        for (const article of relatedArticles) {
          if (!article) continue;
          
          const titleLower = article.title?.toLowerCase() || '';
          const summaryLower = (article.summary || '').toLowerCase();
          
          if (
            titleLower.includes('launch') ||
            titleLower.includes('release') ||
            titleLower.includes('unveil') ||
            summaryLower.includes('launch') ||
            summaryLower.includes('release') ||
            summaryLower.includes('unveil')
          ) {
            releaseDate = new Date(article.published_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            break;
          }
        }
        
        // Extract features from articles and description
        const features: string[] = [];
        const featuresSet = new Set<string>();
        
        // Extract from tech description
        if (tech.description) {
          const descriptionFeatures = this.extractFeatures(tech.description);
          for (const feature of descriptionFeatures) {
            featuresSet.add(feature);
          }
        }
        
        // Extract from article summaries
        for (const article of relatedArticles) {
          if (article && article.summary) {
            const articleFeatures = this.extractFeatures(article.summary);
            for (const feature of articleFeatures) {
              featuresSet.add(feature);
            }
          }
        }
        
        // Convert set to array
        features.push(...Array.from(featuresSet).slice(0, 5));
        
        // Calculate viral evidence
        const viralEvidence = {
          tweetCount: tweets.length,
          totalLikes: tweets.reduce((sum, tweet) => sum + tweet.likesCount, 0),
          totalRetweets: tweets.reduce((sum, tweet) => sum + tweet.retweetsCount, 0),
          impactScore: tweets.reduce((sum, tweet) => sum + (tweet.likesCount + tweet.retweetsCount * 2), 0),
          topTweets: tweets.slice(0, 3)
        };
        
        topTools.push({
          id: tech.id,
          name: tech.name,
          slug: tech.slug,
          description: tech.description,
          releaseDate,
          features: features.length > 0 ? features : ['Advanced AI capabilities', 'User-friendly interface', 'Integration with existing systems'],
          viralEvidence,
          maturityLevel: tech.maturityLevel,
          growthRate: tech.growthRate,
          relatedArticles: relatedArticles.slice(0, 5)
        });
      }

      // Generate comparative analysis
      const categories = this.generateCategories(topTools);
      const comparativeAnalysis = {
        categories,
        tools: topTools.map(tool => tool.name),
        analysisText: this.generateComparativeAnalysis(topTools, categories)
      };

      // Generate key points
      const keyPoints = this.generateKeyPoints(topTools, risingTechnologies);

      // Generate discussion
      const discussion = this.generateDiscussion(topTools, risingTechnologies);

      // Generate conclusion
      const conclusion = this.generateConclusion(topTools);

      // Generate citations
      const citations = this.generateCitations(topTools);

      // Create the weekly digest
      const weeklyDigest: WeeklyDigest = {
        id: 0, // Will be set after insertion
        title: `AI Technology Pulse: Week of ${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        summary: this.generateSummary(topTools, risingTechnologies),
        weekStart,
        weekEnd,
        keyPoints,
        topTools,
        risingTechnologies: risingTechnologies.map(tech => ({
          id: tech.id,
          name: tech.name,
          growthRate: tech.growthRate
        })),
        comparativeAnalysis,
        discussion,
        conclusion,
        citations,
        publishedAt: new Date()
      };

      // Store the digest in the database
      const digestData = {
        title: weeklyDigest.title,
        summary: weeklyDigest.summary,
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        top_technologies: topTools.map(tool => tool.id),
        rising_technologies: risingTechnologies.map(tech => tech.id),
        key_developments: keyPoints,
        viral_hashtags: await this.getTopHashtags(),
        top_tweets: JSON.stringify(await this.getTopTweets()),
        report_data: {
          keyPoints,
          topTools,
          risingTechnologies: risingTechnologies.map(tech => ({
            id: tech.id,
            name: tech.name,
            growthRate: tech.growthRate
          })),
          comparativeAnalysis,
          discussion,
          conclusion,
          citations
        },
        published: true
      };

      const { data: insertedDigest, error: insertError } = await this.supabase
        .from('trend_reports')
        .insert(digestData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting weekly digest:', insertError);
        return null;
      }

      weeklyDigest.id = insertedDigest.id;
      return weeklyDigest;
    } catch (error) {
      console.error('Error generating weekly digest:', error);
      return null;
    }
  }

  /**
   * Get the latest weekly digest
   */
  public async getLatestWeeklyDigest(): Promise<WeeklyDigest | null> {
    try {
      const { data: latestDigest, error: digestError } = await this.supabase
        .from('trend_reports')
        .select('*')
        .eq('published', true)
        .order('week_end', { ascending: false })
        .limit(1)
        .single();

      if (digestError) {
        console.error('Error fetching latest digest:', digestError);
        return null;
      }

      return this.formatDigestFromReport(latestDigest);
    } catch (error) {
      console.error('Error getting latest weekly digest:', error);
      return null;
    }
  }

  /**
   * Format a trend report into a weekly digest
   */
  private formatDigestFromReport(report: any): WeeklyDigest {
    const reportData = report.report_data || {};
    
    return {
      id: report.id,
      title: report.title,
      summary: report.summary,
      weekStart: new Date(report.week_start),
      weekEnd: new Date(report.week_end),
      keyPoints: reportData.keyPoints || report.key_developments || [],
      topTools: reportData.topTools || [],
      risingTechnologies: reportData.risingTechnologies || [],
      comparativeAnalysis: reportData.comparativeAnalysis || {
        categories: [],
        tools: [],
        analysisText: ''
      },
      discussion: reportData.discussion || '',
      conclusion: reportData.conclusion || '',
      citations: reportData.citations || [],
      publishedAt: new Date(report.created_at)
    };
  }

  /**
   * Extract features from text
   */
  private extractFeatures(text: string): string[] {
    const features: string[] = [];
    
    // Look for features after keywords
    const featureKeywords = ['features', 'capabilities', 'offers', 'provides', 'includes', 'supports'];
    
    for (const keyword of featureKeywords) {
      const keywordIndex = text.toLowerCase().indexOf(keyword);
      if (keywordIndex !== -1) {
        // Extract text after the keyword
        const afterKeyword = text.substring(keywordIndex + keyword.length);
        
        // Split by common separators
        const parts = afterKeyword.split(/[,.;:]/);
        if (parts.length > 0) {
          // Take the first part and clean it
          const feature = parts[0].trim();
          if (feature.length > 10 && feature.length < 100) {
            features.push(feature);
          }
        }
      }
    }
    
    // Look for bullet points or numbered lists
    const bulletRegex = /[•\-*]\s+([^•\-*\n]+)/g;
    let match;
    while ((match = bulletRegex.exec(text)) !== null) {
      if (match[1] && match[1].length > 5 && match[1].length < 100) {
        features.push(match[1].trim());
      }
    }
    
    return features;
  }

  /**
   * Generate categories for comparative analysis
   */
  private generateCategories(tools: WeeklyDigestTool[]): string[] {
    const categories = new Set<string>();
    
    // Add default categories
    categories.add('User Experience');
    categories.add('Technical Capabilities');
    categories.add('Integration');
    
    // Extract categories from tool descriptions and features
    for (const tool of tools) {
      if (tool.description) {
        if (tool.description.toLowerCase().includes('code') || 
            tool.description.toLowerCase().includes('programming')) {
          categories.add('Code Generation');
        }
        
        if (tool.description.toLowerCase().includes('image') || 
            tool.description.toLowerCase().includes('visual')) {
          categories.add('Visual Generation');
        }
        
        if (tool.description.toLowerCase().includes('voice') || 
            tool.description.toLowerCase().includes('speech') ||
            tool.description.toLowerCase().includes('audio')) {
          categories.add('Audio Capabilities');
        }
      }
      
      for (const feature of tool.features) {
        if (feature.toLowerCase().includes('custom') || 
            feature.toLowerCase().includes('personali')) {
          categories.add('Customization');
          break;
        }
      }
    }
    
    return Array.from(categories).slice(0, 5);
  }

  /**
   * Generate comparative analysis text
   */
  private generateComparativeAnalysis(tools: WeeklyDigestTool[], categories: string[]): string {
    if (tools.length === 0) return '';
    
    let analysis = `To organize the findings, the following table summarizes the key aspects of each tool:\n\n`;
    analysis += `Tool | ${categories.join(' | ')}\n`;
    analysis += `--- | ${categories.map(() => '---').join(' | ')}\n`;
    
    for (const tool of tools) {
      analysis += `${tool.name} | `;
      
      for (const category of categories) {
        let rating = '';
        
        // Assign ratings based on tool properties
        if (category === 'User Experience') {
          rating = tool.maturityLevel === 'established' ? 'Excellent' : 
                  tool.maturityLevel === 'growing' ? 'Good' : 'Developing';
        } else if (category === 'Technical Capabilities') {
          rating = tool.features.length >= 4 ? 'Advanced' : 
                  tool.features.length >= 2 ? 'Solid' : 'Basic';
        } else if (category === 'Integration') {
          const hasIntegration = tool.features.some(f => 
            f.toLowerCase().includes('integrat') || 
            f.toLowerCase().includes('connect') ||
            f.toLowerCase().includes('api')
          );
          rating = hasIntegration ? 'Strong' : 'Limited';
        } else if (category === 'Code Generation') {
          const hasCodeGen = tool.description?.toLowerCase().includes('code') || 
                            tool.features.some(f => f.toLowerCase().includes('code'));
          rating = hasCodeGen ? 'Supported' : 'Limited';
        } else if (category === 'Visual Generation') {
          const hasVisualGen = tool.description?.toLowerCase().includes('image') || 
                              tool.features.some(f => f.toLowerCase().includes('image') || f.toLowerCase().includes('visual'));
          rating = hasVisualGen ? 'Supported' : 'Limited';
        } else if (category === 'Audio Capabilities') {
          const hasAudio = tool.description?.toLowerCase().includes('voice') || 
                          tool.features.some(f => f.toLowerCase().includes('voice') || f.toLowerCase().includes('audio'));
          rating = hasAudio ? 'Supported' : 'Limited';
        } else if (category === 'Customization') {
          const hasCustomization = tool.features.some(f => 
            f.toLowerCase().includes('custom') || 
            f.toLowerCase().includes('personali')
          );
          rating = hasCustomization ? 'High' : 'Standard';
        }
        
        analysis += rating + ' | ';
      }
      
      // Remove the last separator and add a newline
      analysis = analysis.slice(0, -3) + '\n';
    }
    
    analysis += `\nThis analysis aligns with the rapid evolution of AI, where new releases often trigger viral discussions, especially in coding, video generation, and voice interactions. The tools that gained the most traction this week reflect the AI community's focus on advanced reasoning, creative outputs, and user-friendly interactions.`;
    
    return analysis;
  }

  /**
   * Generate key points
   */
  private generateKeyPoints(tools: WeeklyDigestTool[], risingTechs: any[]): string[] {
    const keyPoints: string[] = [];
    
    // Add a general point about the top tools
    if (tools.length > 0) {
      keyPoints.push(`The hottest AI-powered tools that went viral this week include ${tools.slice(0, 3).map(t => t.name).join(', ')}, based on recent releases and social media buzz.`);
    }
    
    // Add a point about rising technologies
    if (risingTechs.length > 0) {
      keyPoints.push(`${risingTechs[0].name} is showing significant growth with a ${(risingTechs[0].growthRate * 100).toFixed(0)}% increase in mentions, indicating emerging interest in this technology.`);
    }
    
    // Add a point about viral evidence
    const mostViral = [...tools].sort((a, b) => b.viralEvidence.impactScore - a.viralEvidence.impactScore)[0];
    if (mostViral) {
      keyPoints.push(`${mostViral.name} generated the most social media engagement with ${mostViral.viralEvidence.tweetCount} tracked tweets accumulating ${mostViral.viralEvidence.totalLikes} likes and ${mostViral.viralEvidence.totalRetweets} retweets.`);
    }
    
    // Add a point about features
    if (tools.length > 0 && tools[0].features.length > 0) {
      keyPoints.push(`The evidence suggests these tools are popular due to features like ${tools[0].features.slice(0, 2).join(' and ')}, sparking widespread interest.`);
    }
    
    return keyPoints;
  }

  /**
   * Generate summary
   */
  private generateSummary(tools: WeeklyDigestTool[], risingTechs: any[]): string {
    let summary = '';
    
    if (tools.length > 0) {
      summary = `This week's AI technology pulse highlights ${tools.slice(0, 3).map(t => t.name).join(', ')} as the most impactful tools based on mentions, social media engagement, and growth metrics. `;
      
      if (risingTechs.length > 0) {
        summary += `${risingTechs[0].name} is showing particularly strong growth with a ${(risingTechs[0].growthRate * 100).toFixed(0)}% increase in mentions. `;
      }
      
      summary += `These technologies are gaining traction due to their innovative features and practical applications across various domains.`;
    } else {
      summary = 'This week\'s AI technology pulse shows continued evolution across the AI landscape, with several technologies gaining traction in terms of mentions and social media engagement.';
    }
    
    return summary;
  }

  /**
   * Generate discussion
   */
  private generateDiscussion(tools: WeeklyDigestTool[], risingTechs: any[]): string {
    let discussion = 'The tools\' viral nature is evidenced by high engagement on social media, ';
    
    if (tools.length > 0) {
      const topTool = tools[0];
      discussion += `particularly for ${topTool.name}, with view counts in the tens to hundreds of thousands. `;
      
      if (topTool.viralEvidence.topTweets.length > 0) {
        const topTweet = topTool.viralEvidence.topTweets[0];
        discussion += `One viral post about ${topTool.name} from @${topTweet.authorUsername} received ${topTweet.likesCount} likes and ${topTweet.retweetsCount} retweets. `;
      }
    }
    
    if (risingTechs.length > 0) {
      discussion += `${risingTechs[0].name}'s continued popularity suggests sustained interest in this technology, highlighting its potential long-term impact. `;
    }
    
    discussion += `This analysis aligns with the rapid evolution of AI, where new releases often trigger viral discussions, especially in coding, video generation, and voice interactions. The tools that gained the most traction this week reflect the AI community's focus on advanced reasoning, creative outputs, and user-friendly interactions, shaping the future of technology.`;
    
    return discussion;
  }

  /**
   * Generate conclusion
   */
  private generateConclusion(tools: WeeklyDigestTool[]): string {
    let conclusion = 'Based on the evidence, ';
    
    if (tools.length > 0) {
      conclusion += `${tools.map(t => t.name).join(', ')} are the hottest AI-powered tools that went viral this week, `;
    } else {
      conclusion += 'several AI-powered tools went viral this week, ';
    }
    
    conclusion += 'with significant social media engagement and mentions in technical articles. These tools reflect the AI community\'s focus on advanced reasoning, creative outputs, and user-friendly interactions, shaping the future of technology. As these tools continue to evolve, they will likely drive further innovation and adoption across various industries.';
    
    return conclusion;
  }

  /**
   * Generate citations
   */
  private generateCitations(tools: WeeklyDigestTool[]): { title: string, url: string }[] {
    const citations: { title: string, url: string }[] = [];
    
    // Add citations from related articles
    for (const tool of tools) {
      for (const article of tool.relatedArticles) {
        if (article.title && article.url) {
          citations.push({
            title: article.title,
            url: article.url
          });
        }
      }
    }
    
    // Deduplicate citations
    const uniqueCitations = citations.filter((citation, index, self) =>
      index === self.findIndex((c) => c.url === citation.url)
    );
    
    return uniqueCitations.slice(0, 10);
  }

  /**
   * Get top hashtags for the week
   */
  private async getTopHashtags(): Promise<string[]> {
    const hashtags = await this.twitterService.getTopHashtags(10);
    return hashtags.map(h => h.hashtag);
  }

  /**
   * Get top tweets for the week
   */
  private async getTopTweets(): Promise<any[]> {
    const tweets = await this.twitterService.getTopTweets(5);
    return tweets.map(tweet => ({
      id: tweet.id,
      content: tweet.content,
      author: tweet.authorUsername,
      likes: tweet.likesCount,
      retweets: tweet.retweetsCount,
      url: tweet.url
    }));
  }
}