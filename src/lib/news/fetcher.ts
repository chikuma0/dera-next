// src/lib/news/fetcher.ts
import { NewsItem, NEWS_SOURCES } from '@/types/news';
import { validateEnv } from '../config/env';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ArticleService } from '../services/articleService';
import { TranslationService } from '../services/translationService';
import { PerplexityService } from '../services/perplexityService';
import { generateUUID } from './generateUUID';

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

// Map of source names to their database source_id values
const SOURCE_ID_MAP: Record<string, string> = {
  // Known mappings from the existing database data
  "TechCrunch AI": "772bc9c4-e9c8-4447-989d-285f6e40292f",
  "Google News - AI": "558d309b-2d96-4779-add8-6db559673018",
  
  // Following are educated guesses based on the pattern of existing sources
  "Google News - AI Tech": "558d309b-2d96-4779-add8-6db559673018",  // Same as Google News - AI
  "Google News - AI Development": "558d309b-2d96-4779-add8-6db559673018",  // Same as Google News - AI
  "Google News - AI Applications": "558d309b-2d96-4779-add8-6db559673018",  // Same as Google News - AI
  "Google News - Tech Innovation": "558d309b-2d96-4779-add8-6db559673018"   // Same as Google News - AI
};

/**
 * Get source_id for a source name
 * @param sourceName The name of the source
 * @returns The source_id from the map, or a fallback based on the pattern
 */
function getSourceId(sourceName: string): string {
  // Return the mapped ID if it exists
  if (SOURCE_ID_MAP[sourceName]) {
    return SOURCE_ID_MAP[sourceName];
  }
  
  // For Google News sources, use the Google News - AI source_id
  if (sourceName.startsWith('Google News')) {
    return SOURCE_ID_MAP["Google News - AI"];
  }
  
  // Fallback to TechCrunch AI source_id
  return SOURCE_ID_MAP["TechCrunch AI"];
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

        // Normalize the URL to avoid issues
        const normalizedUrl = (item.link?.trim() || '').replace(/\s/g, '');
        
        let summary = cleanedSummary;
        
        // Try to get an AI-enhanced summary for the article
        if (normalizedUrl) {
          try {
            console.log(`Attempting to enhance summary for ${normalizedUrl}...`);
            const enhancedSummary = await perplexityService.summarize(normalizedUrl, language);
            if (enhancedSummary && enhancedSummary.length > 20) {
              // Only use the enhanced summary if it's meaningful
              console.log(`Successfully enhanced summary for ${normalizedUrl}`);
              summary = enhancedSummary;
            } else {
              console.log(`Enhanced summary too short or empty for ${normalizedUrl}, using original`);
            }
          } catch (error) {
            // Just log the error and continue with the original summary
            console.log(`Could not enhance summary for ${normalizedUrl}, using original`);
            console.error('Perplexity summary error:', error instanceof Error ? error.message : String(error));
          }
        }

        if (language === 'ja') {
          try {
            // For Japanese content, translate summary to make it easier to process
            console.log(`Attempting to translate Japanese content for ${source.name} article`);
            const translated = await translationService.translate(cleanedSummary, 'en');
            
            if (translated && translated.length > 10) {
              console.log(`Successfully translated content`);
              summary = translated;
            } else {
              console.log(`Translation result empty or too short, using original`);
              summary = cleanedSummary;
            }
          } catch (error) {
            console.error('Translation error:', error instanceof Error ? error.message : String(error));
            console.log(`Using original Japanese content due to translation failure`);
            summary = cleanedSummary; // Fall back to original
          }
        }

        // We already have normalizedUrl from earlier
        // Ensure we have a valid URL to generate the ID
        const idSource = normalizedUrl || `${source.name}-${title}`;
        
        const newsItem: NewsItem = {
          id: generateUUID(idSource),
          title,
          url: normalizedUrl,
          source: source.name,
          source_id: getSourceId(source.name), // Use the mapping function
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
      .limit(50);

    if (error) {
      console.error('Database fetch error:', error);
      return [];
    }

    return data as NewsItem[];
  } catch (error) {
    console.error('Failed to get news:', error);
    return [];
  }
}
