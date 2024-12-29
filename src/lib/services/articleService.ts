// src/lib/services/articleService.ts
import { NewsItem } from '@/types/news';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateEnv } from '@/lib/config/env';

export class ArticleService {
  private supabase: SupabaseClient;
  private keywordWeights: Record<string, number> = {
    'openai': 10,
    'anthropic': 10,
    'claude': 10,
    'gpt-4': 10,
    'gemini': 10,
    'artificial intelligence': 8,
    'machine learning': 7,
    'deep learning': 7,
    'neural network': 6,
    'ai model': 6,
    'large language model': 8,
    'llm': 8,
    'transformer': 6,
    'computer vision': 6,
    'robotics': 6,
    'autonomous': 5,
    'breakthrough': 7,
    'research': 5,
    'ethics': 6,
    'regulation': 6,
  };

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
          importance_score: score,
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
    const processedArticles: NewsItem[] = [];

    for (const article of articles) {
      const processed = await this.processArticle(article);
      if (processed) {
        processedArticles.push(processed);
      }
    }

    return processedArticles;
  }

  private calculateImportanceScore(article: NewsItem): number {
    let score = 0;

    // 1. Time factor (max 40 points)
    const hoursSincePublished = (Date.now() - new Date(article.published_date).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 40 - (hoursSincePublished / 24) * 10);

    // 2. Source credibility (max 20 points)
    const sourceTier = {
      'TechCrunch AI': 20,
      'Google News - AI': 15,
      'Google News - AI (Japanese)': 15,
    }[article.source] || 10;
    score += sourceTier;

    // 3. Keyword relevance (max 30 points)
    let keywordScore = 0;
    const content = `${article.title} ${article.summary || ''}`.toLowerCase();
    
    Object.entries(this.keywordWeights).forEach(([keyword, weight]) => {
      if (content.includes(keyword.toLowerCase())) {
        keywordScore += weight;
      }
    });
    score += Math.min(30, keywordScore);

    // 4. Content length factor (max 10 points)
    const contentLength = (article.summary || '').length;
    score += Math.min(10, contentLength / 100);

    // Normalize to 0-100 range
    return Math.min(100, Math.max(0, score));
  }

  private categorizeArticle(article: NewsItem): string[] {
    const categories = new Set<string>();
    const content = `${article.title} ${article.summary || ''}`.toLowerCase();

    const categoryPatterns: Record<string, RegExp> = {
      'Research': /(research|study|paper|scientists|discovery|findings)/i,
      'Industry': /(company|startup|business|market|industry|launch|partnership)/i,
      'Ethics': /(ethics|privacy|bias|fairness|regulation|safety|responsible)/i,
      'Applications': /(application|implementation|use case|solution|deploy|product)/i,
      'Innovation': /(breakthrough|innovation|advancement|development|novel|new)/i,
      'Policy': /(policy|regulation|law|government|compliance|guidelines)/i,
      'Investment': /(investment|funding|venture|capital|raise|million|billion)/i,
      'Education': /(education|learning|training|skills|course|curriculum)/i,
      'Healthcare': /(health|medical|diagnosis|patient|treatment|clinical)/i,
      'Technical': /(model|algorithm|framework|architecture|system|technical)/i
    };

    // Add relevant categories based on content matching
    for (const [category, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(content)) {
        categories.add(category);
      }
    }

    // Add language-specific categories
    if (article.language === 'ja') {
      categories.add('Japanese');
    }

    return Array.from(categories);
  }

  // Helper method to get recommendations based on a category
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