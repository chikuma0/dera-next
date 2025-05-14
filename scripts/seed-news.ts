import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

async function main() {
  const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);

  const newsArticles = [
    {
      id: uuidv4(),
      title: 'OpenAI Announces GPT-5 Development Progress',
      summary: 'OpenAI reveals early development stages of GPT-5, promising significant improvements in reasoning and multimodal capabilities.',
      source_id: uuidv4(),
      url: 'https://openai.com/blog/gpt-5-development',
      published_date: new Date('2024-03-15').toISOString(),
      importance_score: 95,
      categories: ['AI Research', 'Product Releases']
    },
    {
      id: uuidv4(),
      title: 'Google DeepMind Achieves Breakthrough in Protein Folding',
      summary: 'New AI model predicts protein structures with unprecedented accuracy, potentially revolutionizing drug discovery.',
      source_id: uuidv4(),
      url: 'https://deepmind.google/research/protein-folding',
      published_date: new Date('2024-03-14').toISOString(),
      importance_score: 92,
      categories: ['AI Research', 'Healthcare']
    },
    {
      id: uuidv4(),
      title: 'Japan Announces New AI Regulation Framework',
      summary: 'Japanese government unveils comprehensive AI regulation framework focusing on safety and ethical development.',
      source_id: uuidv4(),
      url: 'https://www.meti.go.jp/ai-regulation',
      published_date: new Date('2024-03-13').toISOString(),
      importance_score: 88,
      categories: ['Policy', 'Industry News', 'Japan Market']
    }
  ];

  console.log('Creating news articles...');
  for (const article of newsArticles) {
    const { error } = await supabase
      .from('news_items')
      .upsert(article);
    
    if (error) {
      console.error(`Error creating article ${article.title}:`, error);
    } else {
      console.log(`Created article: ${article.title}`);
    }
  }

  console.log('Seed completed!');
}

main().catch(console.error); 