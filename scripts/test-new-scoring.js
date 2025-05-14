#!/usr/bin/env node
import { ArticleService } from '../src/lib/services/articleService';
import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../src/lib/config/env';

async function testNewScoring() {
  try {
    const env = validateEnv();
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    const articleService = new ArticleService();

    console.log('Fetching all articles...');
    const { data: articles, error } = await supabase
      .from('news_items')
      .select('*')
      .order('importance_score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching articles:', error);
      return;
    }

    console.log(`\nFound ${articles.length} articles to analyze`);

    // Calculate new scores for all articles
    const scoredArticles = articles.map(article => ({
      ...article,
      new_score: articleService.calculateArticleScore(article)
    }));

    // Sort by new scores
    scoredArticles.sort((a, b) => b.new_score.total - a.new_score.total);

    console.log('\n===== TOP 10 ARTICLES WITH NEW SCORING =====');
    scoredArticles.slice(0, 10).forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
      console.log(`Source: ${article.source}`);
      console.log(`Original Score: ${article.importance_score}`);
      console.log(`New Score: ${article.new_score.total}`);
      console.log('Score Breakdown:', {
        keywordScore: article.new_score.breakdown.keywordScore,
        timeDecay: article.new_score.breakdown.timeDecay.toFixed(2),
        impactBonus: (article.new_score.breakdown.impactBonus * 100).toFixed(2) + '%',
        headlineWorthiness: article.new_score.breakdown.headlineWorthiness ? 
          (article.new_score.breakdown.headlineWorthiness * 100).toFixed(2) + '%' : 'N/A',
        sourceBonus: (article.new_score.breakdown.sourceBonus * 100).toFixed(2) + '%'
      });
    });

    // Show comparison with original top articles
    const originalTopArticles = [...articles]
      .sort((a, b) => b.importance_score - a.importance_score)
      .slice(0, 5);

    console.log('\n===== COMPARISON WITH ORIGINAL TOP 5 ARTICLES =====');
    originalTopArticles.forEach((article, index) => {
      const withNewScore = scoredArticles.find(a => a.id === article.id);
      const newRank = scoredArticles.findIndex(a => a.id === article.id) + 1;
      
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`Original Score: ${article.importance_score}`);
      console.log(`New Score: ${withNewScore?.new_score.total || 0}`);
      console.log(`New Rank: ${newRank}`);
      console.log(`Change: ${index + 1 === newRank ? 'No change' : 
        (newRank < index + 1 ? `↑ Moved up ${index + 1 - newRank} positions` : 
        `↓ Moved down ${newRank - (index + 1)} positions`)}`);
    });

    // Show new articles that made it to top 5
    const newTopArticles = scoredArticles.slice(0, 5);
    const newEntries = newTopArticles.filter(article => 
      !originalTopArticles.some(original => original.id === article.id)
    );

    if (newEntries.length > 0) {
      console.log('\n===== NEW ARTICLES IN TOP 5 =====');
      newEntries.forEach((article, index) => {
        const newRank = scoredArticles.findIndex(a => a.id === article.id) + 1;
        const originalRank = articles
          .sort((a, b) => b.importance_score - a.importance_score)
          .findIndex(a => a.id === article.id) + 1;
        
        console.log(`\n${newRank}. ${article.title}`);
        console.log(`Original Score: ${article.importance_score}`);
        console.log(`Original Rank: ${originalRank}`);
        console.log(`New Score: ${article.new_score.total}`);
        console.log(`Moved up ${originalRank - newRank} positions due to new scoring`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testNewScoring(); 