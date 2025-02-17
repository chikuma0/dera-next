// src/lib/services/articleService.ts
import { NewsItem } from '@/types/news';
import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../config/env';

export class ArticleService {
  private keywordWeights: Record<string, number> = {
    // Innovative & Exciting Core Capabilities (70-100 points)
    'breakthrough': 100,    // Generic breakthrough
    'revolutionary': 100,   // Revolutionary development
    'world first': 100,    // World's first achievement
    'innovation': 95,      // Innovation mention
    'groundbreaking': 95,  // Groundbreaking development
    'pioneering': 95,      // Pioneering work
    'milestone': 90,       // Important milestone
    'new ai': 100,         // New AI development
    'ai feature': 100,     // New AI feature
    'ai breakthrough': 100, // AI breakthrough
    'language model': 95,   // Language model
    'artificial intelligence': 95,
    'ai advancement': 95,
    'foundation model': 90,
    'multimodal': 90,
    'llm': 95,
    'gpt': 95,
    'chatbot': 85,
    'grok': 85,
    'revolutionary ai': 90,
    'ai': 80,              // Basic AI mention
    'robot': 80,           // Increased robot relevance
    'automation': 80,      // Increased automation relevance
    'algorithm': 85,    // Technical term
    'machine learning': 90,
    'ml': 90,
    'deep learning': 90,
    'neural': 85,
    'quantum': 95,      // Advanced tech
    'blockchain': 90,   // Advanced tech
    'autonomous': 80,
    'computer vision': 90,
    'nlp': 90,
    'cloud native': 85,
    'microservices': 85,
    'serverless': 85,
    'kubernetes': 85,
    'docker': 85,
    'devops': 85,
    'ci/cd': 85,
    'sdk': 80,
    'web3': 85,
    'metaverse': 80,

    // Technical Development & Engineering (70-90 points)
    'ai development': 90,
    'model improvement': 85,
    'technical advancement': 85,
    'ai optimization': 85,
    'engineering': 80,
    'development': 75,
    'implementation': 75,
    'deployment': 80,
    'integration': 75,
    'architecture': 80,
    'infrastructure': 80,
    'platform': 75,
    'system': 75,
    'framework': 75,
    'software': 75,
    'application': 75,
    'api': 80,
    'backend': 80,
    'frontend': 80,
    'fullstack': 85,
    'database': 80,
    'cloud': 80,
    'server': 75,
    'network': 75,
    'security': 80,
    'encryption': 85,
    'protocol': 75,
    'analytics': 80,
    'big data': 85,
    'data science': 90,
    'cloud computing': 85,
    'edge computing': 90,
    'scalability': 80,
    'performance': 75,
    'optimization': 75,

    // Japanese Innovative & Technical (70-100 points)
    '世界初': 100,        // world's first
    '画期的': 100,        // groundbreaking
    '革新的': 100,        // innovative
    '革命的': 100,        // revolutionary
    'ブレークスルー': 100, // breakthrough
    '先駆的': 95,         // pioneering
    '最先端': 95,         // cutting-edge
    '次世代': 95,         // next-generation
    '生成AI': 100,        // generative AI
    'AI機能': 100,        // AI feature
    'AI革新': 100,        // AI breakthrough
    'AI新機能': 100,      // new AI feature
    '人工知能': 95,       // artificial intelligence
    '言語モデル': 95,     // language model
    'AI搭載': 90,         // AI integration
    'マルチモーダル': 90, // multimodal
    'チャットボット': 85, // chatbot
    'AI技術': 90,         // AI technology
    'GPT': 95,           // GPT
    'LLM': 95,           // LLM
    '大規模言語モデル': 95, // Large Language Model
    'AIモデル': 90,       // AI model
    '深層学習': 90,       // deep learning
    'ディープラーニング': 90, // deep learning
    'ロボット': 75,       // robot
    '自動化': 75,         // automation
    'インテリジェント': 75, // intelligent
    'スマート': 75,       // smart
    '自律': 75,           // autonomous
    'ボット': 75,         // bot
    'バーチャル': 75,     // virtual
    'テクノロジー': 75,   // technology
    'クラウド': 80,       // cloud
    'データ': 80,         // data
    '分析': 80,           // analytics
    'エッジコンピューティング': 90, // edge computing
    'ブロックチェーン': 90, // blockchain
    'クラウドネイティブ': 85, // cloud native
    'マイクロサービス': 85, // microservices
    'コンテナ': 85,       // container
    'サーバーレス': 85,   // serverless
    'インフラ': 80,       // infrastructure
    'アーキテクチャ': 80, // architecture
    'スケーラビリティ': 80, // scalability
    '暗号化': 85,         // encryption
    'セキュリティ': 80,   // security
    'プロトコル': 75,     // protocol
    'データベース': 80,   // database
    'ビッグデータ': 85,   // big data
    'データサイエンス': 90, // data science

    // Japanese Technical Development (70-90 points)
    'AI開発': 90,         // AI development
    'AI実装': 85,         // AI implementation
    'AI応用': 85,         // AI application
    'AIサービス': 85,     // AI service
    'AI活用': 80,         // AI utilization
    'AI導入': 80,         // AI adoption
    'AI支援': 80,         // AI assistance
    'AI解析': 85,         // AI analysis
    'AI予測': 85,         // AI prediction
    'AI自動化': 85,       // AI automation
    'エンジニアリング': 80, // engineering
    'ソリューション': 75, // solution
    'アプリケーション': 75, // application
    'サービス': 75,       // service
    'プラットフォーム': 75, // platform
    'システム': 75,       // system
    'ツール': 75,         // tool
    'ソフトウェア': 75,   // software
    'バックエンド': 80,   // backend
    'フロントエンド': 80, // frontend
    'フルスタック': 85,   // fullstack
    'ネットワーク': 75,   // network
    'サーバー': 75,       // server
    'デプロイメント': 80, // deployment
    'インテグレーション': 75, // integration
  };

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  private calculateTimeDecay(publishedDate: Date): number {
    const now = new Date();
    const diffDays = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0.5) return 1.2;   // Breaking news (last 12 hours)
    if (diffDays < 1) return 1.1;     // Very fresh (last 24 hours)
    if (diffDays < 2) return 1.0;     // Recent (last 48 hours)
    if (diffDays < 4) return 0.9;     // This week
    if (diffDays < 7) return 0.8;     // Last week
    if (diffDays < 10) return 0.6;    // More than a week
    if (diffDays < 14) return 0.4;    // Two weeks
    if (diffDays < 21) return 0.2;    // Three weeks
    return 0.1;                       // Older
  }

  private calculateKeywordScore(text: string): number {
    const normalizeText = (text: string) => {
      let normalized = text.toLowerCase();
      normalized = normalized.replace(/([^\x01-\x7E])\s+([^\x01-\x7E])/g, '$1$2');
      normalized = normalized.replace(/[-\s]+/g, ' ');
      normalized = normalized
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
        .replace(/ー/g, '')
        .replace(/[・]/g, '')
        .replace(/AI/gi, 'ai')
        .replace(/[〜～]/g, '')
        .replace(/[\(\)（）「」]/g, '');
      return normalized;
    };

    const normalizedText = normalizeText(text);
    const matchedWeights: number[] = [];
    let matchedPhrases = new Set<string>();

    // Match phrases first
    for (const [phrase, weight] of Object.entries(this.keywordWeights)) {
      const normalizedPhrase = normalizeText(phrase);
      
      if (phrase.includes(' ')) {
        const matches =
          normalizedText.includes(normalizedPhrase) ||
          normalizedText.includes(normalizedPhrase.replace(/s$/, '')) ||
          normalizedText.includes(normalizedPhrase + 's');
        
        if (matches) {
          matchedWeights.push(weight);
          phrase.split(' ').forEach(word => matchedPhrases.add(normalizeText(word)));
        }
      }
    }

    // Then match single words
    for (const [word, weight] of Object.entries(this.keywordWeights)) {
      if (!word.includes(' ')) {
        const normalizedWord = normalizeText(word);
        if (!matchedPhrases.has(normalizedWord) && normalizedText.includes(normalizedWord)) {
          matchedWeights.push(weight);
        }
      }
    }

    // Calculate score
    if (matchedWeights.length === 0) {
      return 0;
    } else if (matchedWeights.length === 1) {
      return Math.max(matchedWeights[0], 65);
    } else {
      // Sort weights in descending order
      matchedWeights.sort((a, b) => b - a);
      
      // Calculate weighted average with diminishing returns
      const topScore = matchedWeights[0];
      const secondScore = matchedWeights[1];
      const remainingScores = matchedWeights.slice(2);
      
      let totalScore = topScore * 0.7 + secondScore * 0.2;
      
      // Add bonus for additional matches with diminishing returns
      if (remainingScores.length > 0) {
        const bonusScore = remainingScores.reduce((acc, score, index) => {
          return acc + (score * (0.1 / Math.pow(2, index)));
        }, 0);
        totalScore += bonusScore;
      }
      
      return Math.min(Math.max(totalScore, 75), 120); // Cap at 120 for exceptional articles
    }
  }

  public calculateArticleScore(article: NewsItem): {
    total: number;
    breakdown: {
      keywordScore: number;
      timeDecay: number;
      titleScore?: number;
      summaryScore?: number;
    };
  } {
    const title = article.title?.trim() || '';
    const summary = article.summary?.trim() || '';
    
    const titleScore = this.calculateKeywordScore(title);
    const summaryScore = this.calculateKeywordScore(summary);
    
    const keywordScore = Math.round((titleScore * 0.6) + (summaryScore * 0.4));
    const timeDecay = this.calculateTimeDecay(new Date(article.published_date));
    const total = Math.round(keywordScore * timeDecay);

    return {
      total,
      breakdown: {
        keywordScore,
        timeDecay,
        titleScore,
        summaryScore
      }
    };
  }

  public async updateArticleScores(): Promise<void> {
    const env = validateEnv();
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    const { data: articles, error } = await supabase
      .from('news_items')
      .select('*');

    if (error) {
      console.error('Error fetching articles:', error);
      return;
    }

    for (const article of articles) {
      const { total } = this.calculateArticleScore(article);
      
      const { error: updateError } = await supabase
        .from('news_items')
        .update({ importance_score: total })
        .eq('id', article.id);

      if (updateError) {
        console.error(`Error updating score for article ${article.id}:`, updateError);
      }
    }
  }

  public async getTopArticles(language: 'en' | 'ja', limit: number = 10): Promise<Array<NewsItem & { score_breakdown?: any }>> {
    const env = validateEnv();
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    const { data: articles, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', language)
      .order('importance_score', { ascending: false })
      .limit(limit * 3);

    if (error) {
      console.error('Error fetching top articles:', error);
      return [];
    }

    const scoredArticles = articles.map(article => ({
      ...article,
      score_breakdown: this.calculateArticleScore(article)
    })).filter(article => article.score_breakdown.total > 0);

    const uniqueArticles: Array<NewsItem & { score_breakdown?: any }> = [];
    const seenTitles = new Set<string>();

    for (const article of scoredArticles) {
      const normalizedTitle = article.title.toLowerCase().trim();
      let isDuplicate = false;

      for (const seenTitle of seenTitles) {
        if (this.calculateSimilarity(normalizedTitle, seenTitle) > 0.8) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        seenTitles.add(normalizedTitle);
        uniqueArticles.push(article);
      }

      if (uniqueArticles.length >= limit) {
        break;
      }
    }

    return uniqueArticles.slice(0, limit);
  }
}