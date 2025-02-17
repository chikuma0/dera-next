#!/usr/bin/env node
import { ArticleService } from '../src/lib/services/articleService.js';

async function testScoring() {
  const articleService = new ArticleService();

  console.log('Updating article scores...');
  await articleService.updateArticleScores();

  console.log('\nFetching top English articles...');
  const enArticles = await articleService.getTopArticles('en', 5);
  
  console.log('\nTop 5 English Articles:');
  enArticles.forEach((article, index) => {
    console.log(`\n${index + 1}. ${article.title}`);
    console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
    console.log(`URL: ${article.url}`);
    console.log('Score Breakdown:', JSON.stringify(article.score_breakdown, null, 2));
  });

  console.log('\nFetching top Japanese articles...');
  const jaArticles = await articleService.getTopArticles('ja', 5);
  
  console.log('\nTop 5 Japanese Articles:');
  jaArticles.forEach((article, index) => {
    console.log(`\n${index + 1}. ${article.title}`);
    console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
    console.log(`URL: ${article.url}`);
    console.log('Score Breakdown:', JSON.stringify(article.score_breakdown, null, 2));
  });
}

testScoring().catch(console.error);