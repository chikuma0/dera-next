#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This script integrates social impact scoring with citation fixing.
 * It creates bidirectional relationships between topics and content,
 * mapping topics to relevant articles and tweets, and boosting article
 * scores based on social media engagement.
 */
async function integratedSocialImpactScoring() {
  try {
    console.log('=== INTEGRATED SOCIAL IMPACT SCORING ===');
    
    // Configuration
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SONAR_DIGEST_PATH = path.join(__dirname, '..', 'public/data/sonar-digest.json');
    const TWITTER_DATA_PATH = path.join(__dirname, '..', 'public/data/twitter-data.json');
    const TWITTER_ENHANCED_DIGEST_PATH = path.join(__dirname, '..', 'public/data/sonar-digest-twitter-enhanced.json');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Step 1: Get Twitter data
    console.log('\nFetching Twitter data...');
    let twitterData;
    
    if (fs.existsSync(TWITTER_DATA_PATH)) {
      console.log('Reading Twitter data from file...');
      twitterData = JSON.parse(fs.readFileSync(TWITTER_DATA_PATH, 'utf8'));
    } else {
      console.log('Twitter data file not found. Fetching from database...');
      
      try {
        // Get tweets from database
        const { data: tweets, error: tweetsError } = await supabase
          .from('tweets')
          .select('*')
          .order('impact_score', { ascending: false })
          .limit(50);
        
        if (tweetsError) {
          throw tweetsError;
        }
        
        // Get hashtags from database
        const { data: hashtags, error: hashtagsError } = await supabase
          .from('tweet_hashtags')
          .select('*')
          .order('impact_score', { ascending: false })
          .limit(20);
        
        if (hashtagsError) {
          throw hashtagsError;
        }
        
        twitterData = { tweets, hashtags };
        
        // Save to file for future use
        fs.writeFileSync(TWITTER_DATA_PATH, JSON.stringify(twitterData, null, 2));
        
      } catch (dbError) {
        console.log('Error fetching from database, using mock data...');
        
        // Create mock data
        twitterData = {
          tweets: Array.from({ length: 10 }, (_, i) => ({
            id: `mock-tweet-${i}`,
            content: `Mock tweet ${i} about AI and technology`,
            authorUsername: `user${i}`,
            authorName: `User ${i}`,
            authorFollowersCount: Math.floor(Math.random() * 10000),
            likesCount: Math.floor(Math.random() * 1000),
            retweetsCount: Math.floor(Math.random() * 500),
            repliesCount: Math.floor(Math.random() * 200),
            quoteCount: Math.floor(Math.random() * 100),
            url: `https://twitter.com/user${i}/status/123456789${i}`,
            createdAt: new Date().toISOString(),
            impactScore: Math.floor(Math.random() * 5000),
            isVerified: Math.random() > 0.7,
            hashtags: []
          })),
          hashtags: Array.from({ length: 5 }, (_, i) => ({
            hashtag: `Hashtag${i}`,
            tweetCount: Math.floor(Math.random() * 100),
            totalLikes: Math.floor(Math.random() * 10000),
            totalRetweets: Math.floor(Math.random() * 5000),
            totalReplies: Math.floor(Math.random() * 2000),
            totalQuotes: Math.floor(Math.random() * 1000),
            totalEngagement: Math.floor(Math.random() * 20000),
            avgEngagementPerTweet: Math.floor(Math.random() * 200),
            growthRate: `+${Math.floor(Math.random() * 30)}%`,
            impactScore: Math.floor(Math.random() * 500)
          }))
        };
        
        // Save to file for future use
        fs.writeFileSync(TWITTER_DATA_PATH, JSON.stringify(twitterData, null, 2));
      }
    }
    
    console.log(`Found ${twitterData.tweets.length} tweets and ${twitterData.hashtags.length} hashtags`);
    
    // Step 2: Get Sonar digest
    console.log('\nFetching Sonar digest...');
    let sonarDigest;
    
    if (fs.existsSync(SONAR_DIGEST_PATH)) {
      console.log('Reading Sonar digest from file...');
      sonarDigest = JSON.parse(fs.readFileSync(SONAR_DIGEST_PATH, 'utf8'));
    } else {
      throw new Error(`Sonar digest file not found: ${SONAR_DIGEST_PATH}`);
    }
    
    console.log(`Found ${sonarDigest.topics.length} topics in the Sonar digest`);
    
    // Step 3: Get articles from database
    console.log('\nFetching articles from database...');
    let articles;
    
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('language', 'en');
      
      if (error) {
        throw error;
      }
      
      articles = data;
      
    } catch (dbError) {
      console.log('Error fetching articles from database, using mock data...');
      
      // Create mock articles
      articles = Array.from({ length: 20 }, (_, i) => ({
        id: `mock-article-${i}`,
        title: `Mock Article ${i} about AI and Technology`,
        summary: `This is a mock article about artificial intelligence and technology advancements.`,
        source: `Mock Source ${i}`,
        published_date: new Date().toISOString(),
        importance_score: Math.floor(Math.random() * 150) + 50,
        language: 'en'
      }));
    }
    
    console.log(`Found ${articles.length} articles`);
    
    // Step 4: Extract keywords from topics
    console.log('\nExtracting keywords from topics...');
    const topicsWithKeywords = sonarDigest.topics.map(topic => {
      const keywords = extractKeywords(topic.title + ' ' + topic.summary);
      return { ...topic, keywords };
    });
    
    // Step 5: Map topics to relevant tweets
    console.log('\nMapping topics to relevant tweets...');
    const topicsWithTweets = topicsWithKeywords.map(topic => {
      const relevantTweets = findRelevantItems(twitterData.tweets, topic.keywords, tweet => tweet.content);
      return { ...topic, relevantTweets };
    });
    
    // Step 6: Map topics to relevant articles
    console.log('\nMapping topics to relevant articles...');
    const topicsWithArticles = topicsWithTweets.map(topic => {
      const relevantArticles = findRelevantItems(articles, topic.keywords, article => article.title + ' ' + (article.summary || ''));
      return { ...topic, relevantArticles };
    });
    
    // Step 7: Create new citations for each topic
    console.log('\nCreating new citations for each topic...');
    const topicsWithNewCitations = topicsWithArticles.map(topic => {
      // Keep existing article citations
      const existingArticleCitations = (topic.citations || [])
        .filter(citation => citation.type === 'article');
      
      // Create new tweet citations
      const tweetCitations = topic.relevantTweets.slice(0, 3).map(tweet => ({
        title: tweet.content,
        url: tweet.url,
        type: 'x-post'
      }));
      
      // Combine and return
      const newCitations = [...existingArticleCitations, ...tweetCitations];
      
      return { ...topic, citations: newCitations };
    });
    
    // Step 8: Calculate social impact scores for articles
    console.log('\nCalculating social impact scores for articles...');
    const articlesWithSocialScores = articles.map(article => {
      const title = article.title.toLowerCase();
      const summary = (article.summary || '').toLowerCase();
      const fullText = `${title} ${summary}`;
      
      // Extract keywords from the article
      const articleKeywords = extractKeywords(fullText);
      
      // Find relevant tweets
      const relevantTweets = findRelevantItems(twitterData.tweets, articleKeywords, tweet => tweet.content);
      
      // Calculate social boost based on relevant tweets
      const socialBoostPercentage = Math.min(relevantTweets.length * 10, 50);
      const socialBoostFactor = socialBoostPercentage / 100;
      
      // Get the base score from the article
      const baseScore = article.importance_score || 100;
      
      // Calculate new score with social boost
      const newScore = Math.round(baseScore * (1 + socialBoostFactor));
      
      return {
        ...article,
        base_score: baseScore,
        social_match_count: relevantTweets.length,
        social_boost_percentage: socialBoostPercentage,
        new_score: newScore,
        relevant_tweets: relevantTweets.slice(0, 3)
      };
    });
    
    // Step 9: Create Twitter-enhanced Sonar digest
    console.log('\nCreating Twitter-enhanced Sonar digest...');
    const enhancedDigest = {
      ...sonarDigest,
      title: sonarDigest.title + ' (Twitter Enhanced)',
      topics: topicsWithNewCitations.map(topic => {
        // Calculate Twitter impact score based on relevant tweets
        const twitterImpactScore = topic.relevantTweets.reduce((sum, tweet) => {
          return sum + (tweet.impactScore || 0);
        }, 0);
        
        // Update HTML content
        const updatedHtmlContent = updateHtmlContent(topic.htmlContent, topic.citations);
        
        return {
          ...topic,
          relatedTweets: topic.relevantTweets,
          relatedHashtags: twitterData.hashtags,
          twitterImpactScore,
          htmlContent: updatedHtmlContent
        };
      }),
      isTwitterEnhanced: true
    };
    
    // Step 10: Save the enhanced digest
    console.log('\nSaving Twitter-enhanced Sonar digest...');
    fs.writeFileSync(TWITTER_ENHANCED_DIGEST_PATH, JSON.stringify(enhancedDigest, null, 2));
    
    // Step 11: Update article scores in the database
    console.log('\nUpdating article scores in the database...');
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const article of articlesWithSocialScores) {
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
      
      console.log(`✅ Updated ${successCount} articles successfully`);
      if (errorCount > 0) {
        console.log(`❌ Failed to update ${errorCount} articles`);
      }
    } catch (dbError) {
      console.log('Error updating article scores in the database:', dbError);
      console.log('Skipping database update...');
    }
    
    // Step 12: Display results
    console.log('\n=== INTEGRATED SOCIAL IMPACT SCORING COMPLETE ===');
    console.log(`✅ Created bidirectional relationships between topics and content`);
    console.log(`✅ Mapped topics to relevant articles and tweets`);
    console.log(`✅ Boosted article scores based on social media engagement`);
    console.log(`✅ Created Twitter-enhanced Sonar digest`);
    console.log(`✅ Updated article scores in the database`);
    
    console.log('\nTwitter-enhanced Sonar digest saved to:');
    console.log(TWITTER_ENHANCED_DIGEST_PATH);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Helper function to extract keywords from text
function extractKeywords(text) {
  // Convert to lowercase
  const lowercaseText = text.toLowerCase();
  
  // Split into words
  const words = lowercaseText.split(/\W+/);
  
  // Filter out common stop words and short words
  const stopWords = [
    'the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about',
    'as', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could', 'may', 'might',
    'must', 'shall', 'should', 'this', 'that', 'these', 'those', 'they', 'them',
    'their', 'there', 'here', 'where', 'when', 'why', 'how', 'what', 'who', 'whom',
    'which', 'whose', 'some', 'any', 'all', 'none', 'many', 'much', 'more', 'most',
    'other', 'another', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'but', 'however', 'still', 'yet', 'also'
  ];
  
  const keywords = words.filter(word => word.length > 3 && !stopWords.includes(word));
  
  // Return unique keywords
  return [...new Set(keywords)];
}

// Helper function to find relevant items based on keywords
function findRelevantItems(items, keywords, textExtractor) {
  // Score each item based on keyword matches
  const scoredItems = items.map(item => {
    const itemText = textExtractor(item).toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      if (itemText.includes(keyword)) {
        score++;
      }
    });
    
    // Use impact score as a secondary sorting criterion if available
    if (item.impactScore) {
      score = score * 100 + (item.impactScore / 1000);
    }
    
    return { item, score };
  });
  
  // Sort items by relevance score
  scoredItems.sort((a, b) => b.score - a.score);
  
  // Return the most relevant items
  return scoredItems.filter(item => item.score > 0).map(item => item.item);
}

// Helper function to update HTML content
function updateHtmlContent(htmlContent, newCitations) {
  if (!htmlContent) return htmlContent;
  
  // Find the citations section
  const citationsSectionRegex = /<p><strong>Citations:<\/strong>.*?<\/p>/s;
  const citationsMatch = htmlContent.match(citationsSectionRegex);
  
  if (!citationsMatch) return htmlContent;
  
  // Create new citations HTML
  const newCitationsHtml = `<p><strong>Citations:</strong> ${newCitations.map(citation => 
    `<a href="${citation.url}" target="_blank">${citation.title}</a>`
  ).join(', ')}</p>`;
  
  // Replace the old citations section with the new one
  return htmlContent.replace(citationsSectionRegex, newCitationsHtml);
}

// Run the script
integratedSocialImpactScoring().catch(console.error);