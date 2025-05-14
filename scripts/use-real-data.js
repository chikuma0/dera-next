// scripts/use-real-data.js
const fs = require('fs');
const path = require('path');

/**
 * This script modifies the API routes to use real data instead of mock data.
 * It removes the fallback to mock data and forces the application to use real data.
 */

function updateFile(filePath, searchText, replaceText) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the text
    const updatedContent = content.replace(searchText, replaceText);
    
    // Write the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`Successfully updated ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// Update the trends API route
const trendsRoutePath = path.join(__dirname, '../src/app/api/trends/route.ts');
const trendsRouteSearchText = `    // If we still don't have data, ensure we use the mock data
    if (topTweets.length === 0) {
      console.log('No tweets from database, using mock data');
      // Load mock Twitter data if not already loaded
      const mockData = loadMockTwitterData();
      // Convert mock data to match the expected format if needed
      topTweets = (mockData.tweets || []).map((tweet: any) => ({
        id: tweet.id,
        content: tweet.content,
        authorUsername: tweet.authorUsername,
        authorName: tweet.authorName,
        authorFollowersCount: tweet.authorFollowersCount,
        likesCount: tweet.likesCount,
        retweetsCount: tweet.retweetsCount,
        repliesCount: tweet.repliesCount,
        quoteCount: tweet.quoteCount,
        url: tweet.url,
        createdAt: new Date(tweet.createdAt),
        impactScore: tweet.impactScore,
        isVerified: tweet.isVerified,
        hashtags: tweet.hashtags || []
      }));
    }
    
    if (topHashtags.length === 0) {
      console.log('No hashtags from database, using mock data');
      // Load mock Twitter data if not already loaded
      const mockData = loadMockTwitterData();
      // Convert mock data to match the expected format if needed
      topHashtags = (mockData.hashtags || []).map((hashtag: any) => ({
        hashtag: hashtag.hashtag,
        tweetCount: hashtag.tweetCount,
        totalLikes: hashtag.totalLikes,
        totalRetweets: hashtag.totalRetweets,
        totalReplies: hashtag.totalReplies,
        impactScore: hashtag.impactScore
      }));
    }`;

const trendsRouteReplaceText = `    // Only use real data, no fallback to mock data
    if (topTweets.length === 0) {
      console.log('No tweets found in database. Please run the setup-real-twitter-data.js script to fetch real data.');
      topTweets = [];
    }
    
    if (topHashtags.length === 0) {
      console.log('No hashtags found in database. Please run the setup-real-twitter-data.js script to fetch real data.');
      topHashtags = [];
    }`;

updateFile(trendsRoutePath, trendsRouteSearchText, trendsRouteReplaceText);

// Update the impact API route
const impactRoutePath = path.join(__dirname, '../src/app/api/trends/impact/route.ts');
const impactRouteSearchText = `      // Try to load mock data
      const mockData = loadMockPulseData();
      
      if (mockData) {
        console.log('Using pre-generated mock data');
        // Convert mock data to match the expected format if needed
        impactData = {
          topTechnologies: mockData.topTechnologies.map((tech: any) => ({
            id: tech.id,
            name: tech.name,
            slug: tech.slug,
            maxImpact: tech.maxImpact,
            maturityLevel: tech.maturityLevel
          })),
          impactHeatmap: mockData.impactHeatmap.map((item: any) => ({
            technologyId: item.technologyId,
            technologyName: item.technologyName,
            industryId: item.industryId,
            industryName: item.industryName,
            impactLevel: item.impactLevel
          })),
          latestInsights: mockData.latestInsights.map((insight: any) => ({
            id: insight.id,
            technologyId: insight.technologyId,
            technologyName: insight.technologyName,
            title: insight.title,
            summary: insight.summary,
            insightType: insight.insightType,
            createdAt: insight.createdAt
          }))
        };
      } else {`;

const impactRouteReplaceText = `      // Only use real data, no fallback to mock data
      console.log('No impact data found. Please run the fetch-real-trend-data.js script to generate real impact data.');
      
      // Return empty data
      impactData = {
        topTechnologies: [],
        impactHeatmap: [],
        latestInsights: []
      };
      
      // Skip the else block
      if (false) {`;

updateFile(impactRoutePath, impactRouteSearchText, impactRouteReplaceText);

console.log('Successfully updated API routes to use real data only.');
console.log('Please run the following commands to fetch real data:');
console.log('1. node scripts/setup-real-twitter-data.js');
console.log('2. node scripts/fetch-real-trend-data.js');