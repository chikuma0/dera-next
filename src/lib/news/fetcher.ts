// src/lib/news/fetcher.ts
import { NewsItem, NEWS_SOURCES } from '@/types/news';
import { validateEnv } from '../config/env';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ArticleService } from '../services/articleService';

function getSupabaseClient(): SupabaseClient {
  const env = validateEnv();
  return createClient(env.supabase.url, env.supabase.serviceRoleKey);
}

async function fetchRSSWithProxy(url: string): Promise<any[]> {
  console.log('Fetching RSS with proxy:', url);
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=${process.env.RSS2JSON_API_KEY || ''}`;
  
  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('RSS proxy response:', {
      status: data.status,
      feed: data.feed?.title,
      itemCount: data.items?.length,
    });
    
    if (data.status !== 'ok') {
      throw new Error(`RSS proxy error: ${data.message || 'Unknown error'}`);
    }
    
    return data.items || [];
  } catch (error) {
    console.error('RSS fetch error:', {
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

function findWordInArray(words: string[], target: string): boolean {
  const targetLower = target.toLowerCase();
  return words.some(word => word.toLowerCase() === targetLower);
}

function hasWordMatch(text: string, word: string): boolean {
  const words = text.toLowerCase().split(/\s+/);
  return Boolean(findWordInArray(words, word.toLowerCase()));
}

function findSubstringIndex(text: string, substring: string): number {
  const lowerText = text.toLowerCase();
  const lowerSubstring = substring.toLowerCase();
  return lowerText.indexOf(lowerSubstring);
}

function hasSubstringMatch(text: string, substring: string): boolean {
  if (!text || !substring) {
    return false;
  }

  const index = findSubstringIndex(text, substring);
  if (index === -1) {
    return false;
  }

  return true; // For Japanese text, we don't check boundaries
}

function findKeywordInText(text: string, keyword: string, isJapanese: boolean = false): boolean {
  if (!text || !keyword) {
    return false;
  }

  // For Japanese text, we only do substring matching
  if (isJapanese) {
    return text.toLowerCase().includes(keyword.toLowerCase());
  }

  const wordMatch = hasWordMatch(text, keyword);
  if (wordMatch) {
    return true;
  }

  return hasSubstringMatch(text, keyword);
}

function hasInvestmentFocus(text: string, isJapanese: boolean = false): boolean {
  const investmentKeywords = isJapanese ? 
    ['株価', '投資', '株式', '証券', '投資家', '配当', '収益予想', '株主'] :
    [
      'stock price', 'market performance', 'investor', 'trading',
      'shares', 'nasdaq', 'nyse', 'portfolio', 'stock', 'stocks',
      'dividend', 'earnings report', 'revenue forecast',
      'quarterly results', 'market capitalization',
      'cash flow', 'billionaire', 'billionaires',
      'investment', 'investing', 'wall street', 'equity'
    ];

  for (const keyword of investmentKeywords) {
    if (findKeywordInText(text, keyword, isJapanese)) {
      return true;
    }
  }
  return false;
}

function isTechnicalContent(text: string, isJapanese: boolean = false): boolean {
  // First check if it has investment focus
  if (hasInvestmentFocus(text, isJapanese)) {
    return false;
  }

  const technicalKeywords = isJapanese ? 
    [
      // Core AI & Tech
      'AI', '人工知能', '機械学習', '深層学習', 'ディープラーニング',
      'ニューラルネットワーク', '言語モデル', 'チャットボット',
      'コンピュータ', 'システム', 'ソフトウェア', 'アプリ',

      // Development & Applications
      '開発', '技術', '研究', '革新', '実装', '応用',
      'プログラム', 'エンジニア', 'デジタル', '自動化',

      // Specific Tech Areas
      'クラウド', 'サーバー', 'データベース', 'ネットワーク',
      'セキュリティ', 'プラットフォーム', 'アルゴリズム',
      
      // Common Tech Terms
      'ツール', '機能', 'サービス', '処理', '分析',
      'テクノロジー', '最適化', '効率化'
    ] :
    [
      // Core AI & ML
      'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'language model', 'llm', 'gpt',
      'computer vision', 'nlp', 'natural language processing',
      'ai model', 'foundation model', 'multimodal', 'ai system',
      'ai technology', 'ai solution', 'ai application', 'ai platform',
      'ai tool', 'ai capability', 'ai feature', 'ai development',
      'ai research', 'ai breakthrough', 'ai advancement',

      // Development & Engineering
      'software development', 'engineering', 'programming',
      'code', 'algorithm', 'api', 'sdk', 'framework',
      'implementation', 'deployment', 'architecture',
      'infrastructure', 'platform', 'system design',
      'technical', 'technology', 'software', 'application',
      'development', 'solution', 'innovation',

      // Cloud & DevOps
      'cloud computing', 'kubernetes', 'docker', 'container',
      'microservices', 'serverless', 'devops', 'ci/cd',
      'continuous integration', 'deployment automation',
      'cloud', 'saas', 'paas', 'iaas',

      // Emerging Tech
      'quantum computing', 'blockchain', 'web3',
      'edge computing', 'iot', 'augmented reality',
      'virtual reality', 'metaverse', 'robotics',
      'autonomous', 'automation',

      // Data & Analytics
      'big data', 'data science', 'analytics',
      'data engineering', 'database', 'data processing',
      'data pipeline', 'data architecture',

      // Security & Network
      'cybersecurity', 'network security', 'encryption',
      'authentication', 'authorization', 'zero trust',
      'security protocol', 'firewall'
    ];

  let matchCount = 0;
  for (const keyword of technicalKeywords) {
    if (findKeywordInText(text, keyword, isJapanese)) {
      matchCount++;
      // For Japanese content, require only one match
      // For English content, require two matches
      if ((isJapanese && matchCount >= 1) || (!isJapanese && matchCount >= 2)) {
        return true;
      }
    }
  }
  return false;
}

export async function fetchAndStoreNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  const supabase = getSupabaseClient();
  const sources = NEWS_SOURCES.filter(source => source.language === language);
  const allItems: NewsItem[] = [];
  const articleService = new ArticleService();

  console.log(`Starting fetch for ${sources.length} ${language} sources`);

  for (const source of sources) {
    try {
      console.log(`Fetching from ${source.name}...`);
      const items = await fetchRSSWithProxy(source.url);
      
      const newsItems: NewsItem[] = items
        .map((item: any) => {
          const title = item.title?.trim() || '';
          // Clean up description/content by removing HTML tags
          const rawSummary = item.description?.trim() || item.content?.trim() || '';
          const summary = rawSummary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          const fullText = `${title} ${summary}`;

          // Skip non-technical content
          if (!isTechnicalContent(fullText, language === 'ja')) {
            return null;
          }

          const newsItem: NewsItem = {
            id: item.link ||
                Buffer.from(`${source.name}-${title}`).toString('base64').replace(/[+/=]/g, ''),
            title,
            url: item.link?.trim() || '',
            source: source.name,
            published_date: item.pubDate ? new Date(item.pubDate) : new Date(),
            language,
            summary,
            created_at: new Date(),
            updated_at: new Date()
          };

          // Calculate importance score for new items
          const { total: score } = articleService.calculateArticleScore(newsItem);
          newsItem.importance_score = score;

          return newsItem;
        })
        .filter((item): item is NewsItem =>
          Boolean(item !== null && item.title && item.url)
        );

      console.log(`Found ${newsItems.length} valid technical items from ${source.name}`);

      // Store in batches
      const batchSize = 50;
      for (let i = 0; i < newsItems.length; i += batchSize) {
        const batch = newsItems.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from('news_items')
          .upsert(batch, {
            onConflict: 'id',
            ignoreDuplicates: false // Allow updates to existing records
          })
          .select();

        if (error) {
          console.error(`Storage error for ${source.name} batch ${i}:`, error);
        } else {
          const insertedCount = Array.isArray(data) ? data.length : 0;
          console.log(`Stored batch ${i}: ${insertedCount} items from ${source.name}`);
          allItems.push(...batch);
        }
      }
    } catch (error) {
      console.error(`Error processing ${source.name}:`, error);
    }
  }

  return allItems;
}

export async function getLatestNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  const supabase = getSupabaseClient();
  const env = validateEnv();
  const lookbackMs = env.newsLookbackHours * 60 * 60 * 1000;
  const since = new Date(Date.now() - lookbackMs).toISOString();
  const articleService = new ArticleService();
  console.log('Getting latest news from database:', language);

  try {
    // Get articles ordered by importance_score
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', language)
      .gte('published_date', since)
      .order('importance_score', { ascending: false })
      .limit(10); // Limit to top 10 articles

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    // If any articles don't have a score, calculate and update them
    const articlesNeedingScores = data?.filter(article => article.importance_score === null);
    if (articlesNeedingScores && articlesNeedingScores.length > 0) {
      console.log(`Calculating scores for ${articlesNeedingScores.length} articles`);
      
      for (const article of articlesNeedingScores) {
        const { total: score } = articleService.calculateArticleScore(article);
        
        const { error: updateError } = await supabase
          .from('news_items')
          .update({ importance_score: score })
          .eq('id', article.id);

        if (updateError) {
          console.error(`Error updating score for article ${article.id}:`, updateError);
        }
      }

      // Fetch the updated articles again
      const { data: updatedData, error: refetchError } = await supabase
        .from('news_items')
        .select('*')
        .eq('language', language)
        .gte('published_date', since)
        .order('importance_score', { ascending: false })
        .limit(10);

      if (refetchError) {
        console.error('Error refetching articles:', refetchError);
        return data || [];
      }

      return updatedData || [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching from database:', error);
    return [];
  }
}