#!/usr/bin/env node

// This script tests the social impact scoring functionality
// It uses the mock data we've created to simulate the scoring process

const fs = require('fs');
const path = require('path');

console.log('Testing social impact scoring functionality...');

// Step 1: Load the mock data
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

// Step 2: Extract keywords from tweets and hashtags
console.log('\nExtracting keywords from social media...');
const socialKeywords = new Set();

// Extract from hashtags
mockTwitterData.hashtags.forEach(hashtag => {
  socialKeywords.add(hashtag.hashtag.toLowerCase());
});

// Extract from tweets (simple word extraction)
mockTwitterData.tweets.forEach(tweet => {
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

// Step 3: Calculate social impact score for each article
console.log('\nCalculating social impact scores...');
const articlesWithSocialScores = mockPulseData.articles.map(article => {
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
      const relatedHashtags = mockTwitterData.hashtags.filter(hashtag => 
        hashtag.hashtag.toLowerCase() === keyword
      );
      
      // Add the impact score of matching hashtags
      relatedHashtags.forEach(hashtag => {
        impactScore += hashtag.impactScore;
      });
    }
  });
  
  // Calculate social boost factor (0-50%)
  const socialBoostPercentage = Math.min(matchCount * 5, 50);
  const socialBoostFactor = socialBoostPercentage / 100;
  
  // Get the base score
  const baseScore = article.importance_score;
  
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

// Step 4: Sort articles by new score
const sortedArticles = [...articlesWithSocialScores].sort((a, b) => b.new_score - a.new_score);

// Step 5: Display results
console.log('\n===== TOP ARTICLES WITH SOCIAL IMPACT SCORING =====');
sortedArticles.forEach((article, index) => {
  console.log(`\n${index + 1}. ${article.title}`);
  console.log(`Published: ${new Date(article.published_date).toLocaleDateString()}`);
  console.log(`Source: ${article.source}`);
  console.log(`Base Score: ${article.base_score}`);
  console.log(`Social Matches: ${article.social_match_count}`);
  console.log(`Social Boost: ${article.social_boost_percentage}%`);
  console.log(`NEW SCORE: ${article.new_score}`);
});

// Step 6: Show comparison with original top articles
const originalTopArticles = [...mockPulseData.articles]
  .sort((a, b) => b.importance_score - a.importance_score)
  .slice(0, 3);

console.log('\n===== COMPARISON WITH ORIGINAL TOP 3 ARTICLES =====');
originalTopArticles.forEach((article, index) => {
  const withSocialImpact = sortedArticles.find(a => a.id === article.id);
  const newRank = sortedArticles.findIndex(a => a.id === article.id) + 1;
  
  console.log(`\n${index + 1}. ${article.title}`);
  console.log(`Original Score: ${article.importance_score}`);
  console.log(`New Score: ${withSocialImpact?.new_score || 0}`);
  console.log(`New Rank: ${newRank}`);
  console.log(`Change: ${index + 1 === newRank ? 'No change' : (newRank < index + 1 ? `↑ Moved up ${index + 1 - newRank} positions` : `↓ Moved down ${newRank - (index + 1)} positions`)}`);
});

// Step 7: Show new articles that made it to top 3
const newTopArticles = sortedArticles.slice(0, 3);
const newEntries = newTopArticles.filter(article => 
  !originalTopArticles.some(original => original.id === article.id)
);

if (newEntries.length > 0) {
  console.log('\n===== NEW ARTICLES IN TOP 3 =====');
  newEntries.forEach((article, index) => {
    const newRank = sortedArticles.findIndex(a => a.id === article.id) + 1;
    const originalRank = mockPulseData.articles
      .sort((a, b) => b.importance_score - a.importance_score)
      .findIndex(a => a.id === article.id) + 1;
    
    console.log(`\n${newRank}. ${article.title}`);
    console.log(`Original Score: ${article.importance_score}`);
    console.log(`Original Rank: ${originalRank}`);
    console.log(`New Score: ${article.new_score}`);
    console.log(`Moved up ${originalRank - newRank} positions due to social impact`);
  });
}

console.log('\nSocial impact scoring test completed successfully!');

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