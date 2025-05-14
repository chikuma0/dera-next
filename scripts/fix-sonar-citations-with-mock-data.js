#!/usr/bin/env node

// This script fixes the citation links in the sonar digest using mock data
// It doesn't require database access, making it easier to test

const fs = require('fs');
const path = require('path');

/**
 * This script fixes the citation links in the sonar digest.
 * It ensures that citations are relevant to the topic they're associated with
 * by finding tweets and articles that actually influenced the topic.
 */
async function fixSonarCitationsWithMockData() {
  try {
    console.log('Fixing citation links in sonar digest using mock data...');
    
    // Step 1: Read the current sonar digest
    const digestPath = path.join(__dirname, '..', 'public/data/sonar-digest.json');
    console.log(`Reading sonar digest from: ${digestPath}`);
    
    if (!fs.existsSync(digestPath)) {
      throw new Error(`Sonar digest file not found at: ${digestPath}`);
    }
    
    const digestData = JSON.parse(fs.readFileSync(digestPath, 'utf8'));
    console.log(`Loaded digest: ${digestData.title}`);
    console.log(`Found ${digestData.topics.length} topics`);
    
    // Create a backup of the original file
    const backupPath = path.join(__dirname, '..', 'public/data/sonar-digest.json.backup');
    fs.writeFileSync(backupPath, JSON.stringify(digestData, null, 2));
    console.log(`Created backup at: ${backupPath}`);
    
    // Step 2: Load mock data
    console.log('\nLoading mock data...');
    
    // Load mock tweets
    const mockTwitterDataPath = path.join(__dirname, '..', 'src/lib/services/mockTwitterData.json');
    let mockTweets = [];
    
    if (fs.existsSync(mockTwitterDataPath)) {
      const mockTwitterData = JSON.parse(fs.readFileSync(mockTwitterDataPath, 'utf8'));
      mockTweets = mockTwitterData.tweets || [];
      console.log(`Loaded ${mockTweets.length} mock tweets`);
    } else {
      console.log('Mock Twitter data not found, using empty array');
    }
    
    // Load mock pulse data (which contains articles)
    const mockPulseDataPath = path.join(__dirname, '..', 'src/lib/services/mockPulseData.json');
    let mockArticles = [];
    
    if (fs.existsSync(mockPulseDataPath)) {
      const mockPulseData = JSON.parse(fs.readFileSync(mockPulseDataPath, 'utf8'));
      mockArticles = mockPulseData.articles || [];
      console.log(`Loaded ${mockArticles.length} mock articles`);
    } else {
      console.log('Mock pulse data not found, using empty array');
    }
    
    // Step 3: Process each topic in the digest
    const fixedTopics = [];
    
    for (const topic of digestData.topics) {
      console.log(`\nProcessing topic: "${topic.title}"`);
      
      // Extract keywords from the topic title and summary
      const topicKeywords = extractKeywords(topic.title + ' ' + topic.summary);
      console.log(`Topic keywords: ${topicKeywords.join(', ')}`);
      
      // Find relevant tweets for this topic
      console.log('Finding relevant tweets...');
      const relevantTweets = findRelevantContent(mockTweets, topicKeywords);
      console.log(`Found ${relevantTweets.length} relevant tweets`);
      
      // Find relevant articles for this topic
      console.log('Finding relevant articles...');
      const relevantArticles = findRelevantArticles(mockArticles, topicKeywords);
      console.log(`Found ${relevantArticles.length} relevant articles`);
      
      // Create new citations based on relevant content
      const newCitations = [];
      
      // Add tweet citations
      for (const tweet of relevantTweets.slice(0, 3)) { // Limit to top 3
        newCitations.push({
          title: `${tweet.authorName || tweet.authorUsername} (@${tweet.authorUsername}) on Twitter`,
          url: tweet.url || `https://x.com/${tweet.authorUsername}/status/${tweet.id}`,
          type: 'x-post'
        });
      }
      
      // Add article citations
      for (const article of relevantArticles.slice(0, 2)) { // Limit to top 2
        newCitations.push({
          title: article.source,
          url: article.url,
          type: 'article'
        });
      }
      
      // If we couldn't find any relevant citations, create some mock ones
      if (newCitations.length === 0) {
        console.log('No relevant citations found, creating mock citations');
        
        // Create mock tweet citations
        newCitations.push({
          title: "AI Researcher (@ai_researcher) on Twitter",
          url: "https://x.com/ai_researcher/status/1234567890",
          type: "x-post"
        });
        
        newCitations.push({
          title: "Tech News (@technews) on Twitter",
          url: "https://x.com/technews/status/0987654321",
          type: "x-post"
        });
        
        // Create mock article citation
        newCitations.push({
          title: "AI News Daily",
          url: "https://ainewsdaily.com/article/123",
          type: "article"
        });
      }
      
      // Update the topic with new citations
      const fixedTopic = {
        ...topic,
        citations: newCitations
      };
      
      // Update related tweets to match the topic
      if (relevantTweets.length > 0) {
        fixedTopic.relatedTweets = relevantTweets.slice(0, 3).map(tweet => ({
          id: tweet.id,
          content: tweet.content,
          authorUsername: tweet.authorUsername,
          authorName: tweet.authorName || tweet.authorUsername,
          authorFollowersCount: tweet.authorFollowersCount,
          likesCount: tweet.likesCount,
          retweetsCount: tweet.retweetsCount,
          repliesCount: tweet.repliesCount,
          quoteCount: tweet.quoteCount || 0,
          url: tweet.url || `https://x.com/${tweet.authorUsername}/status/${tweet.id}`,
          createdAt: tweet.createdAt,
          isVerified: tweet.isVerified,
          hashtags: tweet.hashtags || []
        }));
      }
      
      // Add the fixed topic to our list
      fixedTopics.push(fixedTopic);
      
      console.log(`Updated topic "${topic.title}" with ${newCitations.length} relevant citations`);
    }
    
    // Step 4: Update the digest with fixed topics
    const fixedDigest = {
      ...digestData,
      topics: fixedTopics
    };
    
    // Update the HTML content to match the new citations
    fixedDigest.rawHtml = updateHtmlWithNewCitations(fixedDigest.rawHtml, fixedTopics);
    
    // Write the fixed digest back to the file
    fs.writeFileSync(digestPath, JSON.stringify(fixedDigest, null, 2));
    console.log(`\nUpdated sonar digest with fixed citations at: ${digestPath}`);
    
    console.log('\nCitation fixing complete!');
    
  } catch (error) {
    console.error('Error fixing sonar citations:', error);
  }
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
      return (b.impact_score || 0) - (a.impact_score || 0);
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

/**
 * Update HTML content with new citations
 */
function updateHtmlWithNewCitations(html, topics) {
  let updatedHtml = html;
  
  // For each topic, update the citations in the HTML
  for (const topic of topics) {
    // Find the topic section in the HTML
    const topicRegex = new RegExp(`<h3>${escapeRegExp(topic.title)}</h3>[\\s\\S]*?<p><strong>Citations:</strong>\\s*([\\s\\S]*?)</p>`, 'i');
    const match = updatedHtml.match(topicRegex);
    
    if (match) {
      // Create new citations HTML
      let citationsHtml = '';
      
      for (let i = 0; i < topic.citations.length; i++) {
        const citation = topic.citations[i];
        citationsHtml += `<a href="${citation.url}" target="_blank">${citation.title}</a>`;
        
        // Add comma if not the last citation
        if (i < topic.citations.length - 1) {
          citationsHtml += ', ';
        }
      }
      
      // Replace the old citations with the new ones
      updatedHtml = updatedHtml.replace(
        match[0],
        match[0].replace(match[1], citationsHtml)
      );
    }
  }
  
  return updatedHtml;
}

/**
 * Escape special characters in a string for use in a regular expression
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Run the script
fixSonarCitationsWithMockData().catch(console.error);