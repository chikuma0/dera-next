#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { ArticleService } from '../src/lib/services/articleService.js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * This script enhances article scoring by incorporating social media impact.
 * It looks for trending topics on social media and boosts the scores of related articles.
 */
async function enhanceArticleScoringWithSocialImpact() {
  try {
    console.log('Enhancing article scoring with social media impact...');
    
    // Get Supabase credentials
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const articleService = new ArticleService();
    
    // Step 1: Get top hashtags from Twitter
    console.log('\nFetching top hashtags from Twitter...');
    const { data: topHashtags, error: hashtagError } = await supabase
      .from('tweet_hashtags')
      .select('*')
      .order('impact_score', { ascending: false })
      .limit(20);
    
    if (hashtagError) {
      console.error('Error fetching top hashtags:', hashtagError);
      return;
    }
    
    console.log(`Found ${topHashtags.length} top hashtags`);
    
    // Step 2: Get top tweets
    console.log('\nFetching top tweets...');
    const { data: topTweets, error: tweetError } = await supabase
      .from('tweets')
      .select('*')
      .order('impact_score', { ascending: false })
      .limit(50);
    
    if (tweetError) {
      console.error('Error fetching top tweets:', tweetError);
      return;
    }
    
    console.log(`Found ${topTweets.length} top tweets`);
    
    // Step 3: Extract keywords from top tweets and hashtags
    const socialKeywords = new Set();
    
    // Extract from hashtags
    topHashtags.forEach(hashtag => {
      socialKeywords.add(hashtag.hashtag.toLowerCase());
    });
    
    // Extract from tweets (simple word extraction)
    topTweets.forEach(tweet => {
      const words = tweet.content.toLowerCase().split(/\s+/);
      words.forEach(word => {
        // Only add words that are at least 4 characters and not common stop words
        if (word.length >= 4 && !isStopWord(word)) {
          socialKeywords.add(word);
        }
      });
    });
    
    console.log(`Extracted ${socialKeywords.size} keywords from social media`);
    console.log('Sample keywords:', Array.from(socialKeywords).slice(0, 10));
    
    // Step 4: Fetch all English articles
    console.log('\nFetching all English articles...');
    const { data: articles, error: articleError } = await supabase
      .from('news_items')
      .select('*')
      .eq('language', 'en');
    
    if (articleError) {
      console.error('Error fetching articles:', articleError);
      return;
    }
    
    console.log(`Found ${articles.length} articles to analyze`);
    
    // Step 5: Calculate social impact score for each article
    console.log('\nCalculating social impact scores...');
    const articlesWithSocialScores = articles.map(article => {
      const title = article.title.toLowerCase();
      const summary = (article.summary || '').toLowerCase();
      const fullText = `${title} ${summary}`;
      
      // Count matches with social keywords
      let matchCount = 0;
      let impactScore = 0;
      
      socialKeywords.forEach(keyword => {
        if (fullText.includes(keyword)) {
          matchCount++;
          
          // Find related hashtags to get their impact score
          const relatedHashtags = topHashtags.filter(hashtag => 
            hashtag.hashtag.toLowerCase() === keyword
          );
          
          // Add the impact score of matching hashtags
          relatedHashtags.forEach(hashtag => {
            impactScore += hashtag.impact_score;
          });
        }
      });
      
      // Calculate social boost factor (0-50%)
      const socialBoostPercentage = Math.min(matchCount * 5, 50);
      const socialBoostFactor = socialBoostPercentage / 100;
      
      // Get the base score from ArticleService
      const baseScoreResult = articleService.calculateArticleScore(article);
      const baseScore = baseScoreResult.total;
      
      // Calculate new score with social boost
      const newScore = Math.round(baseScore * (1 + socialBoostFactor));
      
      return {
        ...article,
        base_score: baseScore,
        social_match_count: matchCount,
        social_impact_score: impactScore,
        social_boost_percentage: socialBoostPercentage,
        new_score: newScore
      };
    });
    
    // Step 6: Sort articles by new score
    const sortedArticles = [...articlesWithSocialScores].sort((a, b) => b.new_score - a.new_score);
    
    // Step 7: Display results
    console.log('\n===== TOP 10 ARTICLES WITH SOCIAL IMPACT SCORING =====');
    sortedArticles.slice(0, 10).forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
      console.log(`Source: ${article.source}`);
      console.log(`Base Score: ${article.base_score}`);
      console.log(`Social Matches: ${article.social_match_count}`);
      console.log(`Social Boost: ${article.social_boost_percentage}%`);
      console.log(`NEW SCORE: ${article.new_score}`);
    });
    
    // Step 8: Show comparison with original top articles
    const originalTopArticles = [...articles]
      .sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0))
      .slice(0, 5);
    
    console.log('\n===== COMPARISON WITH ORIGINAL TOP 5 ARTICLES =====');
    originalTopArticles.forEach((article, index) => {
      const withSocialImpact = sortedArticles.find(a => a.id === article.id);
      const newRank = sortedArticles.findIndex(a => a.id === article.id) + 1;
      
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`Original Score: ${article.importance_score || 0}`);
      console.log(`New Score: ${withSocialImpact?.new_score || 0}`);
      console.log(`New Rank: ${newRank}`);
      console.log(`Change: ${index + 1 === newRank ? 'No change' : (newRank < index + 1 ? `↑ Moved up ${index + 1 - newRank} positions` : `↓ Moved down ${newRank - (index + 1)} positions`)}`);
    });
    
    // Step 9: Show new articles that made it to top 5
    const newTopArticles = sortedArticles.slice(0, 5);
    const newEntries = newTopArticles.filter(article => 
      !originalTopArticles.some(original => original.id === article.id)
    );
    
    if (newEntries.length > 0) {
      console.log('\n===== NEW ARTICLES IN TOP 5 =====');
      newEntries.forEach((article, index) => {
        const newRank = sortedArticles.findIndex(a => a.id === article.id) + 1;
        const originalRank = articles
          .sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0))
          .findIndex(a => a.id === article.id) + 1;
        
        console.log(`\n${newRank}. ${article.title}`);
        console.log(`Original Score: ${article.importance_score || 0}`);
        console.log(`Original Rank: ${originalRank}`);
        console.log(`New Score: ${article.new_score}`);
        console.log(`Moved up ${originalRank - newRank} positions due to social impact`);
      });
    }
    
    // Step 10: Ask if user wants to update the database with new scores
    console.log('\nTo update the database with these new scores, run:');
    console.log('node scripts/update-scores-with-social-impact.js');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Helper function to check if a word is a common stop word
function isStopWord(word) {
  const stopWords = [
    'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
    'his', 'her', 'she', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
    'these', 'those', 'from', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
    'each', 'more', 'some', 'such', 'than', 'too', 'very', 'just', 'https', 'http'
  ];
  return stopWords.includes(word);
}

// Run the script
enhanceArticleScoringWithSocialImpact().catch(console.error);