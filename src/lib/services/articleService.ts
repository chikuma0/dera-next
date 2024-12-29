// src/lib/services/articleService.ts
import { NewsItem } from '@/types/news';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateEnv } from '@/lib/config/env';

export class ArticleService {
  private supabase: SupabaseClient;
  private keywordWeights: Record<string, number> = {
    // Innovation & Development Focus
    'api': 10,
    'sdk': 10,
    'framework': 10,
    'library': 9,
    'tool': 9,
    'open source': 10,
    'developer': 9,
    'breakthrough': 10,
    'innovation': 10,
    'novel': 9,
    'new technique': 9,
    'implementation': 8,
    'solution': 8,
    'automation': 8,
    'no-code': 9,
    'low-code': 9,

    // Technical Impact
    'practical application': 8,
    'use case': 8,
    'real-world': 8,
    'deployment': 7,
    'production': 7,
    'scale': 7,
    'enterprise': 7,
    'integration': 7,

    // Core Technology (Lower weights as they're more generic)
    'artificial intelligence': 6,
    'machine learning': 6,
    'deep learning': 6,
    'neural network': 6,
    'large language model': 6,
    'llm': 6,
    'computer vision': 6,
    'robotics': 6,
    
    // Japanese Keywords
    '革新': 10,           // innovation
    '開発ツール': 10,     // development tool
    'オープンソース': 10, // open source
    '実装': 8,           // implementation
    '活用事例': 8,        // use case
    '自動化': 8,         // automation
    '効率化': 8,         // efficiency
    '実用化': 9,         // practical application
    '新技術': 9,         // new technology
    'ツール': 9,         // tool
  };

  // Define innovation patterns for better matching
  private readonly innovationPatterns = [
    // Development tools and platforms
    'api', 'sdk', 'framework', 'library', 'tool', 'toolkit',
    'platform', 'developer', 'development',
    // Innovation indicators
    'breakthrough', 'innovation', 'novel', 'new', 'advancement',
    // Technical implementation
    'implementation', 'architecture', 'infrastructure',
    // Modern development approaches
    'no-code', 'low-code', 'automation', 'open source',
    // Japanese innovation terms
    '革新', '開発ツール', 'オープンソース', '新技術', '開発者'
  ];

  constructor() {
    const env = validateEnv();
    this.supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
  }

  async processArticle(article: NewsItem): Promise<NewsItem | null> {
    try {
      const score = this.calculateImportanceScore(article);
      const categories = this.categorizeArticle(article);

      const { data, error } = await this.supabase
        .from('news_items')
        .update({
          importance_score: typeof score === 'number' ? score : score.total,
          categories,
          updated_at: new Date()
        })
        .eq('id', article.id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update article:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error processing article:', error);
      return null;
    }
  }

  async processArticleBatch(articles: NewsItem[]): Promise<NewsItem[]> {
    try {
      const processedData = articles.map(article => ({
        id: article.id,
        importance_score: this.calculateImportanceScore(article),
        categories: this.categorizeArticle(article),
        updated_at: new Date()
      }));

      const batchSize = 50;
      const processedArticles: NewsItem[] = [];

      for (let i = 0; i < processedData.length; i += batchSize) {
        const batch = processedData.slice(i, i + batchSize);
        
        const { data, error } = await this.supabase
          .from('news_items')
          .upsert(batch.map(item => ({
            ...item,
            importance_score: typeof item.importance_score === 'number' 
              ? item.importance_score 
              : item.importance_score.total
          })))
          .select();

        if (error) {
          console.error(`Error processing batch ${i / batchSize}:`, error);
          continue;
        }

        if (data) {
          processedArticles.push(...data);
        }
      }

      return processedArticles;
    } catch (error) {
      console.error('Error in batch processing:', error);
      return [];
    }
  }

  private calculateImportanceScore(article: NewsItem, includeBreakdown: boolean = false): number | { 
    total: number; 
    timeScore: number; 
    innovationScore: number; 
    impactScore: number; 
    contentScore: number; 
  } {
    let score = 0;
    let innovationScore = 0;
    let impactScore = 0;
    let innovationMatches = 0;
    let impactMatches = 0;

    // 1. Time Factor (30 points max) - Flat for 24h then decay
    const hoursSincePublished = (Date.now() - new Date(article.published_date).getTime()) / (1000 * 60 * 60);
    const timeScore = hoursSincePublished <= 24 
      ? 30  // Full points for first 24 hours
      : 30 * Math.exp(-(hoursSincePublished - 24) / 48);  // Decay after 24 hours
    
    score += timeScore;

    // 2. Innovation and Impact Score (50 points max)
    const content = `${article.title} ${article.summary || ''}`.toLowerCase();
    
    // Process each keyword
    Object.entries(this.keywordWeights).forEach(([keyword, weight]) => {
      const keywordLower = keyword.toLowerCase();
      if (!content.includes(keywordLower)) return; // Skip if keyword not found
      
      // Check if this keyword matches any innovation patterns
      const isInnovationKeyword = this.innovationPatterns.some(pattern => 
        keywordLower.includes(pattern.toLowerCase()) || 
        pattern.toLowerCase().includes(keywordLower)
      );

      if (isInnovationKeyword) {
        innovationScore += weight;
        innovationMatches++;
      } else {
        impactScore += weight;
        impactMatches++;
      }
    });

    // Normalize scores to their max allocations (25 points each)
    // Modified normalization to better handle multiple matches
    innovationScore = innovationMatches > 0 
      ? Math.min(25, (innovationScore / Math.max(innovationMatches, 1)) * Math.min(innovationMatches, 3))
      : 0;
    
    impactScore = impactMatches > 0
      ? Math.min(25, (impactScore / Math.max(impactMatches, 1)) * Math.min(impactMatches, 3))
      : 0;
    
    score += innovationScore + impactScore;

    // 3. Content Quality (20 points max)
    const contentScore = this.evaluateContentQuality(article);
    score += contentScore;

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));

    if (includeBreakdown) {
      return {
        total: finalScore,
        timeScore,
        innovationScore,
        impactScore,
        contentScore
      };
    }

    return finalScore;
  }

  private evaluateContentQuality(article: NewsItem): number {
    let contentScore = 0;
    const content = article.summary || '';
    const title = article.title || '';

    // Content length (10 points)
    contentScore += Math.min(10, content.length / 100);
    
    // Title quality (5 points)
    const titleWords = title.split(/\s+/).length;
    if (titleWords >= 8 && titleWords <= 15) {
      contentScore += 5;
    } else if (titleWords >= 6) {
      contentScore += 3;
    }

    // Technical detail indicators (5 points)
    const technicalIndicators = [
      'how to', 'guide', 'tutorial', 'example', 'implementation',
      'code', 'demo', 'sample', 'study', 'analysis',
      'について', 'チュートリアル', '実装例', 'デモ', '分析'
    ];
    
    if (technicalIndicators.some(indicator => 
      content.includes(indicator))) {
      contentScore += 5;
    }

    return Math.min(20, contentScore);
  }

  private categorizeArticle(article: NewsItem): string[] {
    const categories = new Set<string>();
    const content = `${article.title} ${article.summary || ''}`.toLowerCase();

    const categoryPatterns: Record<string, RegExp> = {
      'Innovation': /(breakthrough|innovation|novel|advancement|development|革新|進歩|開発)/i,
      'Developer Tools': /(api|sdk|developer|tool|framework|library|開発ツール|ライブラリ)/i,
      'Applications': /(implementation|use case|solution|practical|実装|活用|ソリューション)/i,
      'Impact': /(productivity|efficiency|improvement|impact|効率化|改善|効果)/i,
      'Technical': /(model|algorithm|architecture|system|technical|モデル|アルゴリズム|システム)/i,
      'Educational': /(guide|tutorial|learning|education|how to|チュートリアル|学習|教育)/i
    };

    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(content)) {
        categories.add(category);
      }
    }

    if (article.language === 'ja') {
      categories.add('Japanese');
    }

    return Array.from(categories);
  }

  async getArticlesByScore(language: string = 'en', hours: number = 24): Promise<NewsItem[]> {
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const { data, error } = await this.supabase
        .from('news_items')
        .select('*')
        .eq('language', language)
        .gte('published_date', cutoffTime.toISOString())
        .order('importance_score', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getArticlesByScore:', error);
      return [];
    }
  }

  async getRelatedArticles(article: NewsItem, limit: number = 5): Promise<NewsItem[]> {
    const { data, error } = await this.supabase
      .from('news_items')
      .select('*')
      .eq('language', article.language)
      .neq('id', article.id)
      .contains('categories', article.categories || [])
      .order('importance_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }

    return data || [];
  }
}

export const articleService = new ArticleService();