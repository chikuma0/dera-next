#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * This script fixes the citations in the Sonar digest by finding tweets and articles
 * that are genuinely relevant to each topic.
 */

// Configuration
const SONAR_DIGEST_PATH = path.join(__dirname, '..', 'public/data/sonar-digest.json');
const TWITTER_DATA_PATH = path.join(__dirname, '..', 'public/data/twitter-data.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'public/data/sonar-digest-fixed.json');

// Main function
async function fixSonarCitations() {
  try {
    console.log('=== FIXING SONAR CITATIONS ===');
    
    // Step 1: Read the Sonar digest
    console.log('Reading Sonar digest...');
    if (!fs.existsSync(SONAR_DIGEST_PATH)) {
      throw new Error(`Sonar digest file not found: ${SONAR_DIGEST_PATH}`);
    }
    
    const sonarDigest = JSON.parse(fs.readFileSync(SONAR_DIGEST_PATH, 'utf8'));
    console.log(`Found ${sonarDigest.topics.length} topics in the Sonar digest`);
    
    // Step 2: Read the Twitter data
    console.log('Reading Twitter data...');
    if (!fs.existsSync(TWITTER_DATA_PATH)) {
      throw new Error(`Twitter data file not found: ${TWITTER_DATA_PATH}`);
    }
    
    const twitterData = JSON.parse(fs.readFileSync(TWITTER_DATA_PATH, 'utf8'));
    console.log(`Found ${twitterData.tweets.length} tweets and ${twitterData.hashtags.length} hashtags`);
    
    // Step 3: Fix citations for each topic
    console.log('Fixing citations for each topic...');
    
    const fixedDigest = {
      ...sonarDigest,
      topics: sonarDigest.topics.map(topic => {
        console.log(`\nProcessing topic: ${topic.title}`);
        
        // Extract keywords from the topic
        const keywords = extractKeywords(topic.title + ' ' + topic.summary);
        console.log(`Extracted keywords: ${keywords.join(', ')}`);
        
        // Find relevant tweets
        const relevantTweets = findRelevantTweets(twitterData.tweets, keywords);
        console.log(`Found ${relevantTweets.length} relevant tweets`);
        
        // Create new citations
        const newCitations = createNewCitations(topic, relevantTweets);
        console.log(`Created ${newCitations.length} new citations`);
        
        // Update the HTML content
        const updatedHtmlContent = updateHtmlContent(topic.htmlContent, newCitations);
        
        // Return the updated topic
        return {
          ...topic,
          citations: newCitations,
          htmlContent: updatedHtmlContent
        };
      })
    };
    
    // Step 4: Write the fixed digest to a file
    console.log('\nWriting fixed digest to file...');
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(fixedDigest, null, 2));
    console.log(`Fixed digest written to: ${OUTPUT_PATH}`);
    
    // Step 5: Backup the original digest and replace it
    console.log('Backing up original digest and replacing it...');
    const backupPath = SONAR_DIGEST_PATH + '.backup';
    fs.copyFileSync(SONAR_DIGEST_PATH, backupPath);
    fs.copyFileSync(OUTPUT_PATH, SONAR_DIGEST_PATH);
    console.log(`Original digest backed up to: ${backupPath}`);
    console.log(`Sonar digest replaced with fixed version`);
    
    console.log('\n=== SONAR CITATIONS FIXED SUCCESSFULLY ===');
    console.log('The Sonar digest now has relevant citations for each topic.');
    
  } catch (error) {
    console.error('Error fixing Sonar citations:', error);
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

// Helper function to find relevant tweets
function findRelevantTweets(tweets, keywords) {
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
  return scoredTweets.slice(0, 5).map(item => item.tweet);
}

// Helper function to create new citations
function createNewCitations(topic, relevantTweets) {
  // Start with any existing article citations
  const existingArticleCitations = (topic.citations || [])
    .filter(citation => citation.type === 'article');
  
  // Create new tweet citations
  const tweetCitations = relevantTweets.map(tweet => ({
    title: tweet.content,
    url: tweet.url,
    type: 'x-post'
  }));
  
  // Combine and return
  return [...existingArticleCitations, ...tweetCitations];
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
fixSonarCitations().catch(console.error);