#!/usr/bin/env node
import fetch from 'node-fetch';

async function displayCurrentNews() {
  try {
    console.log('Fetching current news articles...');
    
    // Fetch English news without refreshing
    console.log('\nFetching English news...');
    const enResponse = await fetch('http://localhost:3000/api/news?language=en');
    const enData = await enResponse.json();
    
    if (enData.success && enData.data && enData.data.length > 0) {
      console.log(`\nFound ${enData.data.length} English articles`);
      
      // Sort by importance score
      const sortedArticles = [...enData.data].sort((a, b) => 
        (b.importance_score || 0) - (a.importance_score || 0)
      );
      
      // Display all articles
      console.log('\n===== ALL ENGLISH ARTICLES (SORTED BY SCORE) =====');
      sortedArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
        console.log(`Source: ${article.source}`);
        console.log(`URL: ${article.url}`);
        console.log(`SCORE: ${article.importance_score || 0}`);
      });
      
      // Show top 5 articles
      console.log('\n===== TOP 5 ENGLISH ARTICLES =====');
      sortedArticles.slice(0, 5).forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`SCORE: ${article.importance_score || 0}`);
      });
    } else {
      console.log('No English articles found or error fetching data');
      console.log(enData);
    }
    
    // Fetch Japanese news without refreshing
    console.log('\nFetching Japanese news...');
    const jaResponse = await fetch('http://localhost:3000/api/news?language=ja');
    const jaData = await jaResponse.json();
    
    if (jaData.success && jaData.data && jaData.data.length > 0) {
      console.log(`\nFound ${jaData.data.length} Japanese articles`);
      
      // Sort by importance score
      const sortedArticles = [...jaData.data].sort((a, b) => 
        (b.importance_score || 0) - (a.importance_score || 0)
      );
      
      // Display all articles
      console.log('\n===== ALL JAPANESE ARTICLES (SORTED BY SCORE) =====');
      sortedArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
        console.log(`Source: ${article.source}`);
        console.log(`URL: ${article.url}`);
        console.log(`SCORE: ${article.importance_score || 0}`);
      });
      
      // Show top 5 articles
      console.log('\n===== TOP 5 JAPANESE ARTICLES =====');
      sortedArticles.slice(0, 5).forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`SCORE: ${article.importance_score || 0}`);
      });
    } else {
      console.log('No Japanese articles found or error fetching data');
      console.log(jaData);
    }
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}

displayCurrentNews().catch(console.error);