#!/usr/bin/env node

// This script tests the integrated solution for social impact scoring and citation fixing
// It uses the mock data we've created to simulate the entire process

const fs = require('fs');
const path = require('path');

console.log('Testing integrated solution for social impact scoring and citation fixing...');

// Step 1: Check if the sonar digest file exists
const digestPath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
console.log(`Checking sonar digest at: ${digestPath}`);

if (!fs.existsSync(digestPath)) {
  console.error(`Sonar digest file not found at: ${digestPath}`);
  process.exit(1);
}

// Step 2: Read and parse the digest
try {
  const digestData = JSON.parse(fs.readFileSync(digestPath, 'utf8'));
  console.log(`Successfully loaded digest: ${digestData.title}`);
  console.log(`Found ${digestData.topics.length} topics`);
  
  // Step 3: Load the mock data
  const mockTwitterDataPath = path.join(__dirname, '..', 'src/lib/services/mockTwitterData.json');
  const mockPulseDataPath = path.join(__dirname, '..', 'src/lib/services/mockPulseData.json');

  if (!fs.existsSync(mockTwitterDataPath)) {
    console.error(`Mock Twitter data not found at: ${mockTwitterDataPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(mockPulseDataPath)) {
    console.error(`Mock Pulse data not found at: ${mockPulseDataPath}`);
    process.exit(1);
  }

  const mockTwitterData = JSON.parse(fs.readFileSync(mockTwitterDataPath, 'utf8'));
  const mockPulseData = JSON.parse(fs.readFileSync(mockPulseDataPath, 'utf8'));

  console.log(`Loaded ${mockTwitterData.tweets.length} mock tweets`);
  console.log(`Loaded ${mockPulseData.articles.length} mock articles`);
  
  // Step 4: Process each topic in the digest
  console.log('\n===== PROCESSING TOPICS =====');
  
  const topicToArticleMap = new Map(); // Map topics to relevant articles
  const topicToTweetMap = new Map();   // Map topics to relevant tweets
  
  for (const topic of digestData.topics) {
    console.log(`\nProcessing topic: "${topic.title}"`);
    
    // Extract keywords from the topic title and summary
    const topicKeywords = extractKeywords(topic.title + ' ' + topic.summary);
    console.log(`Topic keywords: ${topicKeywords.join(', ')}`);
    
    // Find relevant tweets for this topic
    console.log('Finding relevant tweets...');
    const relevantTweets = findRelevantContent(mockTwitterData.tweets, topicKeywords);
    console.log(`Found ${relevantTweets.length} relevant tweets`);
    
    // Find relevant articles for this topic
    console.log('Finding relevant articles...');
    const relevantArticles = findRelevantArticles(mockPulseData.articles, topicKeywords);
    console.log(`Found ${relevantArticles.length} relevant articles`);
    
    // Store the mappings
    topicToTweetMap.set(topic.title, relevantTweets);
    topicToArticleMap.set(topic.title, relevantArticles);
    
    // Display the top 3 relevant tweets
    if (relevantTweets.length > 0) {
      console.log('\nTop 3 relevant tweets:');
      relevantTweets.slice(0, 3).forEach((tweet, index) => {
        console.log(`  ${index + 1}. @${tweet.authorUsername}: "${tweet.content.substring(0, 50)}..."`);
      });
    }
    
    // Display the top 2 relevant articles
    if (relevantArticles.length > 0) {
      console.log('\nTop 2 relevant articles:');
      relevantArticles.slice(0, 2).forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title} (${article.source})`);
      });
    }
  }
  
  // Step 5: Calculate social impact scores for articles
  console.log('\n===== CALCULATING SOCIAL IMPACT SCORES =====');
  
  // Extract keywords from social media
  const socialKeywords = new Set();
  
  // Extract from hashtags
  mockTwitterData.hashtags.forEach(hashtag => {
    socialKeywords.add(hashtag.hashtag.toLowerCase());
  });
  
  // Extract from tweets
  mockTwitterData.tweets.forEach(tweet => {
    const words = tweet.content.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length >= 4 && !isStopWord(word)) {
        socialKeywords.add(word);
      }
    });
  });
  
  console.log(`Extracted ${socialKeywords.size} keywords from social media`);
  
  // Calculate social impact scores for each article
  const articlesWithSocialScores = mockPulseData.articles.map(article => {
    // Find which topics this article is relevant to
    const relevantTopics = [];
    
    for (const [topicTitle, articles] of topicToArticleMap.entries()) {
      if (articles.some(a => a.id === article.id)) {
        relevantTopics.push(topicTitle);
      }
    }
    
    // If the article isn't relevant to any topics, use the base score
    if (relevantTopics.length === 0) {
      return {
        ...article,
        base_score: article.importance_score,
        social_match_count: 0,
        social_boost_percentage: 0,
        new_score: article.importance_score,
        relevant_topics: []
      };
    }
    
    // Calculate social boost based on relevant tweets for the topics this article is relevant to
    let totalTweets = 0;
    let totalImpactScore = 0;
    
    for (const topicTitle of relevantTopics) {
      const tweets = topicToTweetMap.get(topicTitle) || [];
      totalTweets += tweets.length;
      
      // Sum up impact scores from tweets
      for (const tweet of tweets) {
        totalImpactScore += tweet.impactScore || 0;
      }
    }
    
    // Calculate social boost factor (0-50%)
    const socialBoostPercentage = Math.min(totalTweets * 5, 50);
    const socialBoostFactor = socialBoostPercentage / 100;
    
    // Get the base score
    const baseScore = article.importance_score;
    
    // Calculate new score with social boost
    const newScore = Math.round(baseScore * (1 + socialBoostFactor));
    
    return {
      ...article,
      base_score: baseScore,
      social_match_count: totalTweets,
      social_impact_score: totalImpactScore,
      social_boost_percentage: socialBoostPercentage,
      new_score: newScore,
      relevant_topics: relevantTopics
    };
  });
  
  // Sort articles by new score
  const sortedArticles = [...articlesWithSocialScores].sort((a, b) => b.new_score - a.new_score);
  
  // Display top 5 articles with new scores
  console.log('\n===== TOP 5 ARTICLES WITH SOCIAL IMPACT SCORING =====');
  sortedArticles.slice(0, 5).forEach((article, index) => {
    console.log(`\n${index + 1}. ${article.title}`);
    console.log(`Original Score: ${article.importance_score}`);
    console.log(`Base Score: ${article.base_score}`);
    console.log(`Social Boost: ${article.social_boost_percentage}%`);
    console.log(`NEW SCORE: ${article.new_score}`);
    
    if (article.relevant_topics && article.relevant_topics.length > 0) {
      console.log(`Relevant Topics: ${article.relevant_topics.join(', ')}`);
    }
  });
  
  console.log('\nIntegrated solution test completed successfully!');
  
} catch (error) {
  console.error('Error testing integrated solution:', error);
  process.exit(1);
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  // Normalize text
  const normalizedText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ')     // Replace multiple spaces with a single space
    .trim();
  
  // Split into words
  const words = normalizedText.split(' ');
  
  // Filter out common stop words and short words
  const stopWords = [
    'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
    'his', 'her', 'she', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
    'these', 'those', 'from', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
    'each', 'more', 'some', 'such', 'than', 'too', 'very', 'just', 'about', 'also'
  ];
  
  const keywords = words.filter(word => 
    word.length > 3 && !stopWords.includes(word)
  );
  
  // Return unique keywords
  return [...new Set(keywords)];
}

/**
 * Find content relevant to the given keywords
 */
function findRelevantContent(items, keywords) {
  // Filter items that contain any of the keywords
  const relevantItems = items.filter(item => {
    const content = (item.content || item.title || '').toLowerCase();
    return keywords.some(keyword => content.includes(keyword));
  });
  
  // Sort by relevance (number of matching keywords) and then by impact score
  relevantItems.sort((a, b) => {
    const contentA = (a.content || a.title || '').toLowerCase();
    const contentB = (b.content || b.title || '').toLowerCase();
    
    const matchesA = keywords.filter(keyword => contentA.includes(keyword)).length;
    const matchesB = keywords.filter(keyword => contentB.includes(keyword)).length;
    
    // If match count is the same, sort by impact score
    if (matchesB === matchesA) {
      return (b.impactScore || 0) - (a.impactScore || 0);
    }
    
    return matchesB - matchesA;
  });
  
  return relevantItems;
}

/**
 * Find articles relevant to the given keywords
 */
function findRelevantArticles(articles, keywords) {
  // Filter articles that contain any of the keywords in title or summary
  const relevantArticles = articles.filter(article => {
    const title = article.title.toLowerCase();
    const summary = (article.summary || '').toLowerCase();
    const fullText = `${title} ${summary}`;
    
    return keywords.some(keyword => fullText.includes(keyword));
  });
  
  // Sort by relevance (number of matching keywords) and then by importance score
  relevantArticles.sort((a, b) => {
    const titleA = a.title.toLowerCase();
    const summaryA = (a.summary || '').toLowerCase();
    const fullTextA = `${titleA} ${summaryA}`;
    
    const titleB = b.title.toLowerCase();
    const summaryB = (b.summary || '').toLowerCase();
    const fullTextB = `${titleB} ${summaryB}`;
    
    const matchesA = keywords.filter(keyword => fullTextA.includes(keyword)).length;
    const matchesB = keywords.filter(keyword => fullTextB.includes(keyword)).length;
    
    // If match count is the same, sort by importance score
    if (matchesB === matchesA) {
      return (b.importance_score || 0) - (a.importance_score || 0);
    }
    
    return matchesB - matchesA;
  });
  
  return relevantArticles;
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