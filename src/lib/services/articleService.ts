// src/lib/services/articleService.ts
import { NewsItem } from '@/types/news';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateEnv } from '@/lib/config/env';

export class ArticleService {
  private supabase: SupabaseClient;
  private keywordWeights: Record<string, number> = {
    // Innovation & Development Focus (Higher weights)
    'api': 12,
    'sdk': 12,
    'framework': 12,
    'library': 11,
    'tool': 11,
    'open source': 12,
    'developer': 11,
    'breakthrough': 12,
    'innovation': 12,
    'novel': 11,
    'new technique': 11,
    'implementation': 10,
    'solution': 10,
    'automation': 10,
    'no-code': 11,
    'low-code': 11,

    // Technical Impact
    'practical application': 9,
    'use case': 9,
    'real-world': 9,
    'deployment': 8,
    'production': 8,
    'scale': 8,
    'enterprise': 8,
    'integration': 8,

    // Core Technology (Adjusted weights)
    'artificial intelligence': 7,
    'machine learning': 7,
    'deep learning': 7,
    'neural network': 7,
    'large language model': 7,
    'llm': 7,
    'computer vision': 7,
    'robotics': 7,
    
    // Japanese Keywords (Adjusted weights)
    '革新': 12,           // innovation
    '開発ツール': 12,     // development tool
    'オープンソース': 12, // open source
    '実装': 10,           // implementation
    '活用事例': 9,        // use case
    '自動化': 10,         // automation
    '効率化': 9,         // efficiency
    '実用化': 10,         // practical application
    '新技術': 11,         // new technology
    'ツール': 11,         // tool
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

  // ... (keeping other methods unchanged)

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
    
    // Process each keyword with accumulative scoring
    Object.entries(this.keywordWeights).forEach(([keyword, weight]) => {
      const keywordLower = keyword.toLowerCase();
      if (!content.includes(keywordLower)) return; // Skip if keyword not found
      
      // Check if this keyword matches any innovation patterns
      const isInnovationKeyword = this.innovationPatterns.some(pattern => 
        keywordLower.includes(pattern.toLowerCase()) || 
        pattern.toLowerCase().includes(keywordLower)
      );

      // Accumulate scores without dividing
      if (isInnovationKeyword) {
        innovationScore += weight;
        innovationMatches++;
      } else {
        impactScore += weight;
        impactMatches++;
      }
    });

    // Apply caps and scaling factors
    const MAX_INNOVATION_SCORE = 25;
    const MAX_IMPACT_SCORE = 25;
    
    // Scale scores based on matches but avoid division
    innovationScore = innovationMatches > 0
      ? Math.min(MAX_INNOVATION_SCORE, (innovationScore * 0.8) + (innovationMatches * 2))
      : 0;
    
    impactScore = impactMatches > 0
      ? Math.min(MAX_IMPACT_SCORE, (impactScore * 0.8) + (impactMatches * 2))
      : 0;
    
    score += innovationScore + impactScore;

    // 3. Content Quality (20 points max)
    const contentScore = this.evaluateContentQuality(article);
    score += contentScore;

    const finalScore = Math.min(100, Math.max(0, Math.round(score)));

    if (includeBreakdown) {
      return {
        total: finalScore,
        timeScore: Math.round(timeScore),
        innovationScore: Math.round(innovationScore),
        impactScore: Math.round(impactScore),
        contentScore: Math.round(contentScore)
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
    const titleWords = title.split(/\\s+/).length;
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
      content.toLowerCase().includes(indicator.toLowerCase()))) {
      contentScore += 5;
    }

    return Math.min(20, contentScore);
  }

  // ... (keeping other methods unchanged)
}

export const articleService = new ArticleService();