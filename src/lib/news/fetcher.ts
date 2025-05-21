// src/lib/news/fetcher.ts
import { NewsItem, NEWS_SOURCES } from '@/types/news';
import { validateEnv } from '../config/env';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ArticleService } from '../services/articleService';
import { TranslationService } from '../services/translationService';
import { PerplexityService } from '../services/perplexityService';
import { createHash } from 'crypto';

function getSupabaseClient(): SupabaseClient {
  const env = validateEnv();
  return createClient(env.supabase.url, env.supabase.serviceRoleKey);
}

async function fetchRSSWithProxy(url: string): Promise<any[]> {
  console.log('Fetching RSS with proxy:', url);
  
  // Check if API key is available
  if (!process.env.RSS2JSON_API_KEY) {
    console.error('RSS2JSON_API_KEY is not set in environment variables');
    throw new Error('RSS2JSON_API_KEY is not configured');
  }
  
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=${process.env.RSS2JSON_API_KEY}`;
  
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
    // Return empty array instead of throwing to prevent complete failure
    return [];
  }
}

function generateUUIDFromString(input: string): string {
  const hash = createHash('sha256').update(input).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32)
  ].join('-');
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
      'テクノロジー', '技術', '開発', '研究', '革新'
    ] :
    [
      // Core AI & ML
      'artificial intelligence', 'machine learning', 'deep learning',
      'neural network', 'language model', 'llm', 'gpt',
      'ai', 'technology', 'development', 'research', 'innovation',
      'software', 'system', 'application', 'platform'
    ];

  // For both languages, require only one match
  for (const keyword of technicalKeywords) {
    if (findKeywordInText(text, keyword, isJapanese)) {
      return true;
    }
  }
  return false;
}

export async function fetchAndStoreNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
  const supabase = getSupabaseClient();
  const sources = NEWS_SOURCES.filter(source => source.language === language);
  const allItems: NewsItem[] = [];
  const articleService = new ArticleService();
  const translationService = new TranslationService();
  const perplexityService = new PerplexityService();

  console.log(`Starting fetch for ${sources.length} ${language} sources`);

  for (const source of sources) {
    try {
      console.log(`Fetching from ${source.name}...`);
      const items = await fetchRSSWithProxy(source.url);
      
      const processed = await Promise.all(items.map(async (item: any) => {
        const title = item.title?.trim() || '';
        const rawSummary = item.description?.trim() || item.content?.trim() || '';
        const cleanedSummary = rawSummary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const fullText = `${title} ${cleanedSummary}`;

        if (!isTechnicalContent(fullText, language === 'ja')) {
          return null;
        }

        let summary = cleanedSummary;

        if (language === 'ja') {
          try {
            const perplexitySummary = await perplexityService.summarize(item.link);
            if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(perplexitySummary)) {
              summary = perplexitySummary;
            } else {
              summary = await translationService.translate(perplexitySummary, 'ja');
            }
          } catch (err) {
            console.error('Perplexity summary error:', err);
          }
        }

        const idSource = item.link || `${source.name}-${title}`;
        const newsItem: NewsItem = {
          id: generateUUIDFromString(idSource),
          title,
          url: item.link?.trim() || '',
          source: source.name,
          published_date: item.pubDate ? new Date(item.pubDate) : new Date(),
          language,
          summary,
          created_at: new Date(),
          updated_at: new Date()
        };

        const { total: score } = articleService.calculateArticleScore(newsItem);
        newsItem.importance_score = score;
        return newsItem;
      }));

      const newsItems: NewsItem[] = processed.filter((item): item is NewsItem => Boolean(item && item.title && item.url));

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
  const articleService = new ArticleService();
  console.log('Getting latest news from database:', language);

  try {
    // Get articles ordered by importance_score
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', language)
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
