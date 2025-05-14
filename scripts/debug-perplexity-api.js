#!/usr/bin/env node

/**
 * This script debugs the Perplexity API call to understand why it's returning placeholder content.
 * 
 * Run with: node scripts/debug-perplexity-api.js
 */

const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function debugPerplexityApi() {
  try {
    // Get API key from environment variable
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.error('No Perplexity API key found in environment variables');
      return;
    }

    console.log('API Key found:', apiKey.substring(0, 10) + '...');

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    
    // Format dates for display
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
    
    // Create a simple prompt for testing
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
    console.log('Prompt:', prompt.substring(0, 200) + '...');

    // Call the Perplexity API using native fetch (available in Node.js v18+)
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

    // Log the response status
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);

    // Parse the response
    const data = await response.json();
    
    // Log the response data
    console.log('Response data:', JSON.stringify(data, null, 2).substring(0, 500) + '...');

    // Check if the response contains content
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const content = data.choices[0].message.content;
      
      // Log the content
      console.log('Content:', content.substring(0, 500) + '...');
      
      // Save the content to a file for further analysis
      const filePath = path.join(__dirname, '..', 'perplexity-response.html');
      fs.writeFileSync(filePath, content);
      console.log('Content saved to:', filePath);
      
      // Parse the content to extract topics
      const topics = parseContent(content);
      console.log('Parsed topics:', topics.map(t => t.title));
    } else {
      console.error('No content found in the response');
    }
  } catch (error) {
    console.error('Error debugging Perplexity API:', error);
  }
}

function parseContent(htmlContent) {
  // This is a simple parser - in a real implementation, you might want to use a proper HTML parser
  const topics = [];

  // Extract topics from the full HTML document
  const topicRegex = /<div class="topic">[\s\S]*?<h3>(.*?)<\/h3>[\s\S]*?<p><strong>Summary:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Why Viral:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Why Valuable:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Insights:<\/strong>\s*(.*?)<\/p>[\s\S]*?<p><strong>Citations:<\/strong>\s*([\s\S]*?)<\/p>[\s\S]*?<\/div>/g;
  
  let match;
  while ((match = topicRegex.exec(htmlContent)) !== null) {
    const title = match[1].trim();
    const summary = match[2].trim();
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
      summary,
      viralReason,
      valueReason,
      insights,
      citations
    });
  }

  return topics;
}

// Run the debug function
debugPerplexityApi().then(() => {
  console.log('Debug complete');
}).catch(error => {
  console.error('Error:', error);
});