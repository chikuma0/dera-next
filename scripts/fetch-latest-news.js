#!/usr/bin/env node

/**
 * This script fetches the latest AI news using the Perplexity API
 * and updates the sonar-digest.json file with real content.
 * 
 * Run with: node scripts/fetch-latest-news.js
 */

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function fetchLatestNews() {
  try {
    console.log('=== FETCHING LATEST AI NEWS WITH PERPLEXITY API ===');
    console.log('This script will:');
    console.log('1. Use your Perplexity API key to fetch real AI news');
    console.log('2. Generate a properly formatted digest with actual current events');
    console.log('3. Update the sonar-digest.json file with real content');
    console.log('=======================================\n');
    
    // Get API key from environment variable
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.error('❌ No Perplexity API key found in environment variables');
      console.error('Please set PERPLEXITY_API_KEY in your .env.local file');
      return;
    }

    console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    // Format dates for display (using actual current dates, not future dates)
    const formattedWeekStart = weekStart.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedToday = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    console.log(`Fetching AI news from ${formattedWeekStart} to ${formattedToday}...`);
    
    // Create a prompt for real AI news
    const prompt = `Generate a comprehensive WEEKLY digest of the most impactful AI news from ${formattedWeekStart} to ${formattedToday}, focusing on topics that are both viral (trending on social media) and valuable (significant impact in the AI field). This should be the definitive summary of the week's most important AI developments.

For each topic, include:
- A brief summary of the news or development.
- Why it's considered viral (e.g., high engagement on social media, trending hashtags, viral discussions).
- Why it's valuable (e.g., potential impact on AI technology, research, industry, or society).
- Insights or analysis from experts or relevant sources.
- Citations from reliable sources, including both news articles and social media posts.

Format the digest as HTML, with clear headings and links to sources. The HTML should be well-structured with the following format:

<h1>Weekly AI News Digest: ${formattedWeekStart} - ${formattedToday}</h1>
<p>[Overall summary of the week's AI landscape and key themes]</p>
<h2>Top 5 AI Topics This Week</h2>

<div class="topic">
  <h3>[Topic Title]</h3>
  <p><strong>Summary:</strong> [Brief summary of the news]</p>
  <p><strong>Why Viral:</strong> [Explanation of why this topic is trending, including metrics like engagement numbers if available]</p>
  <p><strong>Why Valuable:</strong> [Explanation of the significance and potential impact]</p>
  <p><strong>Insights:</strong> [Analysis or expert opinions]</p>
  <p><strong>Citations:</strong> [Links to sources, including both news articles and social media posts]</p>
</div>

Include EXACTLY 5 topics, focusing on the most impactful news of the entire week. Make sure each topic is truly viral and valuable (with clear explanation of its significance).

Today's date is ${formattedToday}.`;

    console.log('Sending request to Perplexity API...');

    // Call the Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that specializes in creating weekly digests of AI news. You have access to the latest information from the web and social media.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    // Check response status
    if (!response.ok) {
      console.error('❌ Error from Perplexity API:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('Error details:', errorData);
      return;
    }

    console.log('✅ Received response from Perplexity API');
    
    // Parse the response
    const data = await response.json();
    
    // Check if the response contains content
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('❌ No content found in the response');
      return;
    }

    const content = data.choices[0].message.content;
    
    // Parse the content to extract topics
    const { topics, summary } = parseContent(content);
    
    if (topics.length === 0) {
      console.error('❌ No topics found in the content');
      return;
    }
    
    console.log(`✅ Parsed ${topics.length} topics:`);
    topics.forEach((topic, index) => {
      console.log(`  ${index + 1}. ${topic.title}`);
    });

    // Create the digest object with real dates (not future dates)
    const digest = {
      title: `Weekly AI News Digest: ${formattedWeekStart} - ${formattedToday}`,
      date: today.toISOString(),
      summary: summary || 'Weekly digest of viral and valuable AI news topics.',
      topics,
      rawHtml: content,
      publishedAt: new Date().toISOString()
    };

    // Create the directory if it doesn't exist
    const dir = path.join(process.cwd(), 'public/data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Backup existing file if it exists
    const filePath = path.join(dir, 'sonar-digest.json');
    if (fs.existsSync(filePath)) {
      const backupPath = path.join(dir, 'sonar-digest.json.backup');
      fs.copyFileSync(filePath, backupPath);
      console.log(`✅ Backed up existing digest to ${backupPath}`);
    }

    // Write the new digest to the file
    fs.writeFileSync(filePath, JSON.stringify(digest, null, 2));
    console.log(`✅ Saved new digest to ${filePath}`);

    // Update the timestamp file
    const timestampPath = path.join(dir, 'sonar-digest-last-update.json');
    fs.writeFileSync(timestampPath, JSON.stringify({ lastUpdated: new Date().toISOString() }));
    console.log(`✅ Updated timestamp file at ${timestampPath}`);

    // Create a copy for Twitter-enhanced digest
    const twitterEnhancedPath = path.join(dir, 'sonar-digest-twitter-enhanced.json');
    fs.writeFileSync(twitterEnhancedPath, JSON.stringify(digest, null, 2));
    console.log(`✅ Created Twitter-enhanced digest at ${twitterEnhancedPath}`);

    console.log('\n=== NEXT STEPS ===');
    console.log('1. Clear your browser cache or visit the cache clearing page:');
    console.log('   http://localhost:3003/clear-sonar-cache.html');
    console.log('2. Visit the Sonar digest page:');
    console.log('   http://localhost:3003/news/sonar-digest');
    console.log('=======================================');
  } catch (error) {
    console.error('❌ Error fetching latest news:', error);
  }
}

function parseContent(htmlContent) {
  // Extract the summary from the HTML
  let summary = '';
  const summaryMatch = htmlContent.match(/<h1>.*?<\/h1>\s*<p>(.*?)<\/p>/s);
  if (summaryMatch && summaryMatch[1]) {
    summary = summaryMatch[1].trim();
  }

  // Extract topics from the HTML
  const topics = [];
  const topicRegex = /<div class="topic">\s*<h3>(.*?)<\/h3>\s*<p><strong>Summary:<\/strong>\s*(.*?)<\/p>\s*<p><strong>Why Viral:<\/strong>\s*(.*?)<\/p>\s*<p><strong>Why Valuable:<\/strong>\s*(.*?)<\/p>\s*<p><strong>Insights:<\/strong>\s*(.*?)<\/p>\s*<p><strong>Citations:<\/strong>\s*(.*?)<\/p>\s*<\/div>/gs;
  
  let match;
  while ((match = topicRegex.exec(htmlContent)) !== null) {
    const title = match[1].trim();
    const topicSummary = match[2].trim();
    const viralReason = match[3].trim();
    const valueReason = match[4].trim();
    const insights = match[5].trim();
    const citationsHtml = match[6].trim();
    
    // Parse citations
    const citations = [];
    
    // Split the citations HTML by links
    const links = citationsHtml.match(/<a[^>]*>.*?<\/a>/g) || [];
    
    for (const link of links) {
      const urlMatch = link.match(/href="([^"]+)"/);
      const titleMatch = link.match(/>([^<]+)</);
      
      if (urlMatch && titleMatch) {
        const url = urlMatch[1];
        const title = titleMatch[1].trim();
        // Determine if it's an X post or an article based on the URL
        const type = url.includes('x.com') || url.includes('twitter.com') ? 'x-post' : 'article';
        
        citations.push({ title, url, type });
      }
    }
    
    topics.push({
      title,
      summary: topicSummary,
      viralReason,
      valueReason,
      insights,
      citations,
      relatedTweets: [], // Empty related tweets, will be populated elsewhere if needed
      relatedHashtags: [], // Empty related hashtags, will be populated elsewhere if needed
      twitterImpactScore: 0 // Default impact score
    });
  }

  return { topics, summary };
}

// Run the fetch function
fetchLatestNews().then(() => {
  console.log('✅ Successfully fetched latest news');
}).catch(error => {
  console.error('❌ Error running script:', error);
}); 