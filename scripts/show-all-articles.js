#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { ArticleService } from '../src/lib/services/articleService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

async function showAllArticles() {
  try {
    // Get Supabase credentials
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const articleService = new ArticleService();
    
    // Fetch all English articles
    console.log('\n===== ALL ENGLISH ARTICLES (SORTED BY SCORE) =====');
    const { data: enArticles, error: enError } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', 'en')
      .order('importance_score', { ascending: false });
    
    if (enError) {
      console.error('Error fetching English articles:', enError);
    } else if (enArticles && enArticles.length > 0) {
      console.log(`\nFound ${enArticles.length} English articles`);
      
      // Calculate scores for all articles
      const scoredArticles = enArticles.map(article => ({
        ...article,
        score_breakdown: articleService.calculateArticleScore(article)
      }));
      
      // Sort by the calculated scores
      scoredArticles.sort((a, b) => b.score_breakdown.total - a.score_breakdown.total);
      
      // Display all articles
      scoredArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
        console.log(`Source: ${article.source}`);
        console.log(`URL: ${article.url}`);
        
        const breakdown = article.score_breakdown;
        console.log(`Base Keyword Score: ${breakdown.keywordScore}`);
        console.log(`Time Decay: ${breakdown.timeDecay.toFixed(2)}`);
        console.log(`Impact Bonus: ${(breakdown.impactBonus * 100).toFixed(2)}%`);
        
        // Log headline worthiness if available
        if (breakdown.headlineWorthiness !== undefined) {
          console.log(`Headline Worthiness: ${(breakdown.headlineWorthiness * 100).toFixed(2)}%`);
        }
        
        console.log(`FINAL SCORE: ${breakdown.total}`);
      });
    } else {
      console.log('No English articles found');
    }
    
    // Fetch all Japanese articles
    console.log('\n\n===== ALL JAPANESE ARTICLES (SORTED BY SCORE) =====');
    const { data: jaArticles, error: jaError } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', 'ja')
      .order('importance_score', { ascending: false });
    
    if (jaError) {
      console.error('Error fetching Japanese articles:', jaError);
    } else if (jaArticles && jaArticles.length > 0) {
      console.log(`\nFound ${jaArticles.length} Japanese articles`);
      
      // Calculate scores for all articles
      const scoredArticles = jaArticles.map(article => ({
        ...article,
        score_breakdown: articleService.calculateArticleScore(article)
      }));
      
      // Sort by the calculated scores
      scoredArticles.sort((a, b) => b.score_breakdown.total - a.score_breakdown.total);
      
      // Display all articles
      scoredArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
        console.log(`Source: ${article.source}`);
        console.log(`URL: ${article.url}`);
        
        const breakdown = article.score_breakdown;
        console.log(`Base Keyword Score: ${breakdown.keywordScore}`);
        console.log(`Time Decay: ${breakdown.timeDecay.toFixed(2)}`);
        console.log(`Impact Bonus: ${(breakdown.impactBonus * 100).toFixed(2)}%`);
        
        // Log headline worthiness if available
        if (breakdown.headlineWorthiness !== undefined) {
          console.log(`Headline Worthiness: ${(breakdown.headlineWorthiness * 100).toFixed(2)}%`);
        }
        
        console.log(`FINAL SCORE: ${breakdown.total}`);
      });
    } else {
      console.log('No Japanese articles found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

showAllArticles().catch(console.error);