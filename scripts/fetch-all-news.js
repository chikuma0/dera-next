#!/usr/bin/env node
import fetch from 'node-fetch';
import { ArticleService } from '../src/lib/services/articleService.js';

async function fetchAllNews() {
  try {
    console.log('Fetching all news articles...');
    
    // Create an instance of ArticleService to calculate scores
    const articleService = new ArticleService();
    
    // Fetch English news
    console.log('\nFetching English news...');
    const enResponse = await fetch('http://localhost:3000/api/news?language=en&refresh=true');
    const enData = await enResponse.json();
    
    if (enData.success && enData.data && enData.data.length > 0) {
      console.log(`\nFound ${enData.data.length} English articles`);
      
      // Calculate scores for all articles
      const scoredArticles = enData.data.map(article => ({
        ...article,
        score_breakdown: articleService.calculateArticleScore(article)
      }));
      
      // Sort by the calculated scores
      scoredArticles.sort((a, b) => b.score_breakdown.total - a.score_breakdown.total);
      
      // Display all articles
      console.log('\n===== ALL ENGLISH ARTICLES (SORTED BY SCORE) =====');
      scoredArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
        console.log(`Source: ${article.source}`);
        console.log(`URL: ${article.url}`);
        
        const breakdown = article.score_breakdown;
        console.log(`Base Keyword Score: ${breakdown.breakdown.keywordScore}`);
        console.log(`Time Decay: ${breakdown.breakdown.timeDecay.toFixed(2)}`);
        console.log(`Impact Bonus: ${(breakdown.breakdown.impactBonus * 100).toFixed(2)}%`);
        
        // Log headline worthiness if available
        if (breakdown.breakdown.headlineWorthiness !== undefined) {
          console.log(`Headline Worthiness: ${(breakdown.breakdown.headlineWorthiness * 100).toFixed(2)}%`);
        }
        
        console.log(`FINAL SCORE: ${breakdown.total}`);
      });
      
      // Show top 5 articles
      console.log('\n===== TOP 5 ENGLISH ARTICLES =====');
      scoredArticles.slice(0, 5).forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`SCORE: ${article.score_breakdown.total}`);
      });
    } else {
      console.log('No English articles found or error fetching data');
      console.log(enData);
    }
    
    // Fetch Japanese news
    console.log('\nFetching Japanese news...');
    const jaResponse = await fetch('http://localhost:3000/api/news?language=ja&refresh=true');
    const jaData = await jaResponse.json();
    
    if (jaData.success && jaData.data && jaData.data.length > 0) {
      console.log(`\nFound ${jaData.data.length} Japanese articles`);
      
      // Calculate scores for all articles
      const scoredArticles = jaData.data.map(article => ({
        ...article,
        score_breakdown: articleService.calculateArticleScore(article)
      }));
      
      // Sort by the calculated scores
      scoredArticles.sort((a, b) => b.score_breakdown.total - a.score_breakdown.total);
      
      // Display all articles
      console.log('\n===== ALL JAPANESE ARTICLES (SORTED BY SCORE) =====');
      scoredArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
        console.log(`Source: ${article.source}`);
        console.log(`URL: ${article.url}`);
        
        const breakdown = article.score_breakdown;
        console.log(`Base Keyword Score: ${breakdown.breakdown.keywordScore}`);
        console.log(`Time Decay: ${breakdown.breakdown.timeDecay.toFixed(2)}`);
        console.log(`Impact Bonus: ${(breakdown.breakdown.impactBonus * 100).toFixed(2)}%`);
        
        // Log headline worthiness if available
        if (breakdown.breakdown.headlineWorthiness !== undefined) {
          console.log(`Headline Worthiness: ${(breakdown.breakdown.headlineWorthiness * 100).toFixed(2)}%`);
        }
        
        console.log(`FINAL SCORE: ${breakdown.total}`);
      });
      
      // Show top 5 articles
      console.log('\n===== TOP 5 JAPANESE ARTICLES =====');
      scoredArticles.slice(0, 5).forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`SCORE: ${article.score_breakdown.total}`);
      });
    } else {
      console.log('No Japanese articles found or error fetching data');
      console.log(jaData);
    }
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}

fetchAllNews().catch(console.error);