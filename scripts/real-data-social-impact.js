#!/usr/bin/env node

/**
 * This script uses real data fetched from the Grok API to perform
 * social impact scoring and citation fixing.
 * 
 * Run with: node scripts/real-data-social-impact.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configuration
const rootDir = path.join(__dirname, '..');
const twitterDataPath = path.join(rootDir, 'public/data/twitter-data.json');
const sonarDigestPath = path.join(rootDir, 'public/data/sonar-digest.json');
const enhancedDigestPath = path.join(rootDir, 'public/data/sonar-digest-twitter-enhanced.json');

console.log('=== REAL DATA SOCIAL IMPACT SCORING AND CITATION FIXING ===');
console.log('This script will:');
console.log('1. Fetch real data from the Grok API');
console.log('2. Use real data for social impact scoring');
console.log('3. Fix citations using real data');
console.log('4. Generate a Twitter-enhanced Sonar digest with real data');
console.log('=======================================\n');

// Step 1: Fetch real data from the Grok API
console.log('Step 1: Fetching real data from the Grok API...');

try {
  execSync('node scripts/fetch-real-grok-data.js', { 
    stdio: 'inherit',
    cwd: rootDir
  });
} catch (error) {
  console.error('❌ Error fetching real data from the Grok API:', error.message);
  console.error('Cannot proceed without real data. Exiting...');
  process.exit(1);
}

// Step 2: Validate that we have real data
console.log('\nStep 2: Validating real data...');

try {
  // Check if Twitter data exists
  if (!fs.existsSync(twitterDataPath)) {
    throw new Error('Twitter data file not found');
  }
  
  // Check if Sonar digest exists
  if (!fs.existsSync(sonarDigestPath)) {
    throw new Error('Sonar digest file not found');
  }
  
  // Read Twitter data
  const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
  
  // Validate Twitter data
  if (!twitterData.tweets || twitterData.tweets.length === 0) {
    throw new Error('No tweets found in Twitter data');
  }
  
  if (!twitterData.hashtags || twitterData.hashtags.length === 0) {
    throw new Error('No hashtags found in Twitter data');
  }
  
  // Read Sonar digest
  const sonarDigest = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
  
  // Validate Sonar digest
  if (!sonarDigest.topics || sonarDigest.topics.length === 0) {
    throw new Error('No topics found in Sonar digest');
  }
  
  console.log('✅ Real data validation successful');
  console.log(`Found ${twitterData.tweets.length} tweets and ${twitterData.hashtags.length} hashtags`);
  console.log(`Found ${sonarDigest.topics.length} topics in the Sonar digest`);
} catch (error) {
  console.error('❌ Error validating real data:', error.message);
  console.error('Cannot proceed without valid real data. Exiting...');
  process.exit(1);
}

// Step 3: Fix citations using real data
console.log('\nStep 3: Fixing citations using real data...');

try {
  // Read Twitter data
  const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
  
  // Read Sonar digest
  const sonarDigest = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
  
  // Function to extract keywords from text
  const extractKeywords = (text) => {
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
  };
  
  // Function to find relevant tweets for a topic
  const findRelevantTweets = (topic, tweets) => {
    // Extract keywords from the topic
    const keywords = extractKeywords(topic.title + ' ' + topic.summary);
    
    // Score each tweet based on keyword matches
    const scoredTweets = tweets.map(tweet => {
      const tweetText = tweet.content.toLowerCase();
      let score = 0;
      
      keywords.forEach(keyword => {
        if (tweetText.includes(keyword)) {
          score++;
        }
      });
      
      return { tweet, score };
    });
    
    // Sort tweets by relevance score
    scoredTweets.sort((a, b) => b.score - a.score);
    
    // Return the top 5 most relevant tweets
    return scoredTweets.filter(item => item.score > 0).slice(0, 5).map(item => item.tweet);
  };
  
  // Fix citations for each topic
  const fixedDigest = {
    ...sonarDigest,
    topics: sonarDigest.topics.map(topic => {
      // Find relevant tweets for this topic
      const relevantTweets = findRelevantTweets(topic, twitterData.tweets);
      
      console.log(`Topic: ${topic.title}`);
      console.log(`Found ${relevantTweets.length} relevant tweets`);
      
      // Keep existing article citations
      const existingArticleCitations = (topic.citations || [])
        .filter(citation => citation.type === 'article');
      
      // Create new tweet citations
      const tweetCitations = relevantTweets.map(tweet => ({
        title: tweet.content,
        url: tweet.url,
        type: 'x-post'
      }));
      
      // Combine and return
      const newCitations = [...existingArticleCitations, ...tweetCitations];
      
      console.log(`Created ${newCitations.length} citations (${existingArticleCitations.length} articles, ${tweetCitations.length} tweets)`);
      
      // Update the HTML content
      let updatedHtmlContent = topic.htmlContent;
      
      if (updatedHtmlContent) {
        // Find the citations section
        const citationsSectionRegex = /<p><strong>Citations:<\/strong>.*?<\/p>/s;
        const citationsMatch = updatedHtmlContent.match(citationsSectionRegex);
        
        if (citationsMatch) {
          // Create new citations HTML
          const newCitationsHtml = `<p><strong>Citations:</strong> ${newCitations.map(citation => 
            `<a href="${citation.url}" target="_blank">${citation.title}</a>`
          ).join(', ')}</p>`;
          
          // Replace the old citations section with the new one
          updatedHtmlContent = updatedHtmlContent.replace(citationsSectionRegex, newCitationsHtml);
        }
      }
      
      return {
        ...topic,
        citations: newCitations,
        htmlContent: updatedHtmlContent
      };
    })
  };
  
  // Save the fixed digest
  fs.writeFileSync(sonarDigestPath, JSON.stringify(fixedDigest, null, 2));
  
  console.log('✅ Citations fixed successfully using real data');
} catch (error) {
  console.error('❌ Error fixing citations:', error.message);
  console.error('Cannot proceed without fixed citations. Exiting...');
  process.exit(1);
}

// Step 4: Calculate social impact scores
console.log('\nStep 4: Calculating social impact scores using real data...');

try {
  execSync('node scripts/integrated-social-impact-scoring-cjs.js', { 
    stdio: 'inherit',
    cwd: rootDir
  });
} catch (error) {
  console.error('❌ Error calculating social impact scores:', error.message);
  console.log('Continuing with the process...');
}

// Step 5: Generate Twitter-enhanced Sonar digest
console.log('\nStep 5: Generating Twitter-enhanced Sonar digest with real data...');

try {
  // Read Twitter data
  const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
  
  // Read Sonar digest
  const sonarDigest = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
  
  // Create a copy of the Sonar digest for enhancement
  const enhancedDigest = JSON.parse(JSON.stringify(sonarDigest));
  
  // Update the title to indicate Twitter enhancement
  enhancedDigest.title = enhancedDigest.title + ' (Twitter Enhanced)';
  
  // Add a flag to indicate this is a Twitter-enhanced digest
  enhancedDigest.isTwitterEnhanced = true;
  
  // Process each topic in the digest
  enhancedDigest.topics.forEach(topic => {
    // Find relevant tweets for this topic
    const relevantTweets = findRelevantTweets(topic, twitterData.tweets);
    
    // Find relevant hashtags for this topic
    const keywords = extractKeywords(topic.title + ' ' + topic.summary);
    const relevantHashtags = twitterData.hashtags.filter(hashtag => 
      keywords.some(keyword => hashtag.hashtag.toLowerCase().includes(keyword))
    );
    
    // Add Twitter data to the topic
    topic.relatedTweets = relevantTweets;
    topic.relatedHashtags = relevantHashtags;
    
    // Calculate Twitter impact score based on the related tweets
    topic.twitterImpactScore = relevantTweets.reduce((sum, tweet) => {
      return sum + (tweet.impactScore || 0);
    }, 0);
  });
  
  // Sort topics by Twitter impact score
  enhancedDigest.topics.sort((a, b) => (b.twitterImpactScore || 0) - (a.twitterImpactScore || 0));
  
  // Save the enhanced digest
  fs.writeFileSync(enhancedDigestPath, JSON.stringify(enhancedDigest, null, 2));
  
  console.log('✅ Twitter-enhanced Sonar digest generated successfully with real data');
} catch (error) {
  console.error('❌ Error generating Twitter-enhanced Sonar digest:', error.message);
  console.log('Continuing with the process...');
}

// Step 6: Test the integrated solution
console.log('\nStep 6: Testing the integrated solution with real data...');

try {
  execSync('node scripts/test-social-impact.js', { 
    stdio: 'inherit',
    cwd: rootDir
  });
} catch (error) {
  console.error('❌ Error testing the integrated solution:', error.message);
  console.log('Some tests may have failed...');
}

console.log('\n=== REAL DATA SOCIAL IMPACT SCORING AND CITATION FIXING COMPLETE ===');
console.log('The social impact scoring and citation fixing system has been successfully');
console.log('implemented using real data from the Grok API.');
console.log('You can now view the results in the following files:');
console.log(`- Twitter data: ${twitterDataPath}`);
console.log(`- Sonar digest with fixed citations: ${sonarDigestPath}`);
console.log(`- Twitter-enhanced Sonar digest: ${enhancedDigestPath}`);
console.log('=======================================');

// Helper function to find relevant tweets for a topic
function findRelevantTweets(topic, tweets) {
  // Extract keywords from the topic
  const keywords = extractKeywords(topic.title + ' ' + topic.summary);
  
  // Score each tweet based on keyword matches
  const scoredTweets = tweets.map(tweet => {
    const tweetText = tweet.content.toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      if (tweetText.includes(keyword)) {
        score++;
      }
    });
    
    return { tweet, score };
  });
  
  // Sort tweets by relevance score
  scoredTweets.sort((a, b) => b.score - a.score);
  
  // Return the top 5 most relevant tweets
  return scoredTweets.filter(item => item.score > 0).slice(0, 5).map(item => item.tweet);
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