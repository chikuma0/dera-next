import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config({ path: '.env.local' });

if (typeof window === 'undefined') {
  (global as any).fetch = fetch;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to clean HTML from text
function cleanText(text: string): string {
  if (!text) return '';
  // Remove HTML tags
  return text.replace(/<[^>]*>?/gm, '')
    // Replace HTML entities
    .replace(/&(?:amp|lt|gt|quot|#39|#x2F);/g, 
      match => ({
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#x2F;': '/'
      }[match] || match));
}

// --- Categorization Rules ---
const CATEGORY_RULES: { name: string; keywords: string[]; sources?: string[] }[] = [
  {
    name: 'AI & ML',
    keywords: ['ai', 'machine learning', 'deep learning', 'neural network'],
  },
  {
    name: 'Startups',
    keywords: ['startup', 'funding', 'seed round', 'series a', 'venture'],
  },
  {
    name: 'Research',
    keywords: ['research', 'paper', 'study', 'academic'],
    sources: ['arxiv', 'Science Daily'],
  },
  {
    name: 'Industry',
    keywords: ['industry', 'enterprise', 'business', 'deployment', 'adoption'],
  },
  {
    name: 'Policy',
    keywords: ['policy', 'regulation', 'law', 'government', 'compliance'],
  },
  {
    name: 'Japan Market',
    keywords: ['japan', 'japanese'],
    sources: ['Tech Crunch Japan'],
  },
];
const UNCATEGORIZED = 'Uncategorized';

async function findOrCreateCategory(name: string) {
  // Try to find category
  let { data, error } = await supabase
    .from('news_categories')
    .select('id')
    .eq('name', name)
    .single();
  if (data && data.id) return data.id;
  // Create if not found
  const { data: created, error: createError } = await supabase
    .from('news_categories')
    .insert([{ name }])
    .select('id')
    .single();
  if (created && created.id) return created.id;
  throw new Error(`Failed to find or create category '${name}': ${error?.message || createError?.message}`);
}

function getCategoriesForArticle(article: any): string[] {
  try {
    const title = cleanText(article.title || '').toLowerCase();
    const summary = cleanText(article.summary || '').toLowerCase();
    const content = cleanText(article.content || '').toLowerCase();
    const source = (article.source_name || '').toLowerCase();
    
    const matched = new Set<string>();
    
    // Check each rule against the article
    for (const rule of CATEGORY_RULES) {
      // Check if any keyword matches in title, summary, or content
      const hasKeywordMatch = rule.keywords.some(keyword => 
        title.includes(keyword) || 
        summary.includes(keyword) || 
        content.includes(keyword)
      );
      
      // Check if source matches
      const hasSourceMatch = rule.sources?.some(s => source.includes(s.toLowerCase()));
      
      if (hasKeywordMatch || hasSourceMatch) {
        matched.add(rule.name);
      }
    }
    
    // If no categories matched, use uncategorized
    return matched.size > 0 ? Array.from(matched) : [UNCATEGORIZED];
  } catch (error) {
    console.error('Error in getCategoriesForArticle:', error);
    return [UNCATEGORIZED];
  }
}

async function linkArticleCategory(news_item_id: string, category_id: string) {
  // Check if already linked
  const { data: existing } = await supabase
    .from('news_item_categories')
    .select('news_item_id')
    .eq('news_item_id', news_item_id)
    .eq('category_id', category_id)
    .maybeSingle();
  if (existing) return;
  // Link
  await supabase
    .from('news_item_categories')
    .insert([{ news_item_id, category_id }]);
}

async function main() {
  console.log('Fetching all news articles...');
  
  // First, get all news items with their sources
  const { data: articles, error: articlesError } = await supabase
    .from('news_items')
    .select(`
      id, 
      title, 
      summary, 
      content,
      source_id, 
      url, 
      published_date,
      news_sources (id, name, url)
    `);
    
  if (articlesError) {
    console.error('Error fetching articles:', articlesError);
    process.exit(1);
  }

  console.log(`Found ${articles?.length || 0} articles to process...`);
  
  if (!articles || articles.length === 0) {
    console.log('No articles found to process.');
    return;
  }

  let processed = 0;
  const total = articles.length;
  
  for (const article of articles) {
    try {
      // Clean up the content and summary
      const cleanSummary = cleanText(article.summary || '');
      const cleanContent = cleanText(article.content || '');
      
      // Update the article with cleaned content
      const { error: updateError } = await supabase
        .from('news_items')
        .update({ 
          summary: cleanSummary,
          content: cleanContent
        })
        .eq('id', article.id);
      
      if (updateError) {
        console.error(`Error updating article ${article.id}:`, updateError);
        continue;
      }
      
      // Get categories based on the cleaned content
      const categories = getCategoriesForArticle({
        ...article,
        summary: cleanSummary,
        content: cleanContent,
        source_name: (article.news_sources as any)?.name || ''
      });
      
      // Link categories
      for (const cat of categories) {
        try {
          const catId = await findOrCreateCategory(cat);
          await linkArticleCategory(article.id, catId);
        } catch (catError) {
          console.error(`Error processing category ${cat} for article ${article.id}:`, catError);
        }
      }
      
      processed++;
      if (processed % 10 === 0 || processed === total) {
        console.log(`Processed ${processed}/${total} articles...`);
      }
    } catch (error) {
      console.error(`Error processing article ${article.id}:`, error);
    }
  }
  
  console.log(`Done! Successfully processed ${processed} out of ${total} articles.`);
}

main().catch(e => { console.error(e); process.exit(1); }); 