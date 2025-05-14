#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * This script updates article scores in the database with social impact factored in.
 * It requires confirmation before making changes.
 */
async function updateScoresWithSocialImpact() {
  try {
    console.log('=== UPDATE ARTICLE SCORES WITH SOCIAL IMPACT ===');
    console.log('This script will update article scores in the database based on social media impact.');
    console.log('WARNING: This will modify the importance_score field in the news_items table.');
    
    // Get Supabase credentials
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Step 1: Get Twitter data from the file
    console.log('\nFetching Twitter data from file...');
    const twitterDataPath = path.join(__dirname, '..', 'public/data/twitter-data.json');
    
    if (!fs.existsSync(twitterDataPath)) {
      throw new Error('Twitter data file not found. Run enhanced-refresh-sonar-with-grok-data.js first.');
    }
    
    const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
    const topTweets = twitterData.tweets;
    const topHashtags = twitterData.hashtags;
    
    console.log(`Found ${topTweets.length} tweets and ${topHashtags.length} hashtags`);
    
    // Step 2: Extract keywords from top tweets and hashtags
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
    
    // Step 3: Fetch all English articles
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
    
    // Step 4: Calculate social impact score for each article
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
            impactScore += hashtag.impactScore || 0;
          });
        }
      });
      
      // Calculate social boost factor (0-50%)
      const socialBoostPercentage = Math.min(matchCount * 5, 50);
      const socialBoostFactor = socialBoostPercentage / 100;
      
      // Get the base score from the article
      const baseScore = article.importance_score || 100;
      
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
    
    // Step 5: Sort articles by new score
    const sortedArticles = [...articlesWithSocialScores].sort((a, b) => b.new_score - a.new_score);
    
    // Step 6: Display results
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
    
    // Step 7: Show comparison with original top articles
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
    
    // Step 8: Ask for confirmation before updating the database
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\nDo you want to update the database with these new scores? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('\nUpdating article scores in the database...');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const article of sortedArticles) {
          const { error: updateError } = await supabase
            .from('news_items')
            .update({ 
              importance_score: article.new_score,
              social_boost_percentage: article.social_boost_percentage,
              social_match_count: article.social_match_count
            })
            .eq('id', article.id);
          
          if (updateError) {
            console.error(`Error updating score for article ${article.id}:`, updateError);
            errorCount++;
          } else {
            successCount++;
          }
        }
        
        console.log(`\n✅ Updated ${successCount} articles successfully`);
        if (errorCount > 0) {
          console.log(`❌ Failed to update ${errorCount} articles`);
        }
        
        console.log('\nArticle scores have been updated with social impact factored in.');
        console.log('The changes will be reflected in the news feed immediately.');
      } else {
        console.log('\nUpdate cancelled. No changes were made to the database.');
      }
      
      rl.close();
    });
    
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
updateScoresWithSocialImpact().catch(console.error);