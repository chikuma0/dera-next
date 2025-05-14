#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function queryNewsDatabase() {
  try {
    // Get Supabase credentials
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Fetch all English articles
    console.log('\n===== ENGLISH ARTICLES =====');
    const { data: enArticles, error: enError } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', 'en')
      .order('importance_score', { ascending: false });
    
    if (enError) {
      console.error('Error fetching English articles:', enError);
    } else if (enArticles && enArticles.length > 0) {
      console.log(`\nFound ${enArticles.length} English articles`);
      
      // Display all articles
      enArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
        console.log(`Source: ${article.source}`);
        console.log(`URL: ${article.url}`);
        console.log(`SCORE: ${article.importance_score || 0}`);
      });
      
      // Show top 5 articles
      console.log('\n===== TOP 5 ENGLISH ARTICLES =====');
      enArticles.slice(0, 5).forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`SCORE: ${article.importance_score || 0}`);
      });
    } else {
      console.log('No English articles found');
    }
    
    // Fetch all Japanese articles
    console.log('\n\n===== JAPANESE ARTICLES =====');
    const { data: jaArticles, error: jaError } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', 'ja')
      .order('importance_score', { ascending: false });
    
    if (jaError) {
      console.error('Error fetching Japanese articles:', jaError);
    } else if (jaArticles && jaArticles.length > 0) {
      console.log(`\nFound ${jaArticles.length} Japanese articles`);
      
      // Display all articles
      jaArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
        console.log(`Source: ${article.source}`);
        console.log(`URL: ${article.url}`);
        console.log(`SCORE: ${article.importance_score || 0}`);
      });
      
      // Show top 5 articles
      console.log('\n===== TOP 5 JAPANESE ARTICLES =====');
      jaArticles.slice(0, 5).forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`SCORE: ${article.importance_score || 0}`);
      });
    } else {
      console.log('No Japanese articles found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

queryNewsDatabase().catch(console.error);