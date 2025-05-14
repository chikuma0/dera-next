#!/usr/bin/env node

/**
 * This script fetches real news from the Perplexity Sonar API and updates the Sonar digest.
 * It focuses solely on getting real news content without Twitter integration.
 * 
 * Run with: node scripts/fetch-real-sonar-news.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create a temporary file that will be executed by Next.js
const rootDir = path.join(__dirname, '..');
const tempFile = path.join(rootDir, 'src/pages/api/temp-fetch-sonar.ts');

console.log('=== FETCHING REAL NEWS FOR SONAR DIGEST ===');
console.log('This script will:');
console.log('1. Use Perplexity\'s Sonar API to fetch real AI news articles');
console.log('2. Update the Sonar digest with real news content');
console.log('=======================================\n');

// Write the temporary file for fetching Sonar news
fs.writeFileSync(
  tempFile,
  `
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Fetching real news for Sonar digest...');
  
  try {
    // Get API key from environment variable
    const apiKey = process.env.PERPLEXITY_API_KEY || '';
    
    if (!apiKey) {
      console.error('No Perplexity API key found in environment variables');
      res.status(500).json({ error: 'No Perplexity API key found' });
      return;
    }

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
    
    // Create the prompt for Sonar
    const prompt = \`Generate a comprehensive WEEKLY digest of the most impactful AI news from \${formattedWeekStart} to \${formattedToday}, focusing on topics that are both viral (trending on social media) and valuable (significant impact in the AI field). This should be the definitive summary of the week's most important AI developments.

For each topic, include:
- A brief summary of the news or development.
- Why it's considered viral (e.g., high engagement on social media, trending hashtags, viral discussions).
- Why it's valuable (e.g., potential impact on AI technology, research, industry, or society).
- Insights or analysis from experts or relevant sources.
- Citations from reliable sources, including both news articles and social media posts.

Format the digest as HTML, with clear headings and links to sources. The HTML should be well-structured with the following format:

<h1>Weekly AI News Digest: \${formattedWeekStart} - \${formattedToday}</h1>
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

Today's date is \${formattedToday}.\`;

    // Call the Sonar API
    console.log('Calling Perplexity Sonar API to fetch real news...');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`
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
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(\`Sonar API error: \${errorData.error?.message || response.statusText}\`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from Sonar API');
    }
    
    // Parse the HTML content
    const topics = [];
    let summary = '';
    
    // Extract the summary (assuming it's in a paragraph after the h1)
    const summaryMatch = content.match(/<h1>.*?<\\/h1>\\s*<p>(.*?)<\\/p>/s);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    }
    
    // Extract topics from the full HTML document
    const topicRegex = /<div class="topic">\\s*<h3>(.*?)<\\/h3>\\s*<p><strong>Summary:<\\/strong>\\s*(.*?)<\\/p>\\s*<p><strong>Why Viral:<\\/strong>\\s*(.*?)<\\/p>\\s*<p><strong>Why Valuable:<\\/strong>\\s*(.*?)<\\/p>\\s*<p><strong>Insights:<\\/strong>\\s*(.*?)<\\/p>\\s*<p><strong>Citations:<\\/strong>\\s*(.*?)<\\/p>\\s*<\\/div>/gs;
    
    let match;
    while ((match = topicRegex.exec(content)) !== null) {
      const title = match[1].trim();
      const topicSummary = match[2].trim();
      const viralReason = match[3].trim();
      const valueReason = match[4].trim();
      const insights = match[5].trim();
      const citationsHtml = match[6].trim();
      
      // Parse citations
      const citations = [];
      
      // Split the citations HTML by links
      const links = citationsHtml.match(/<a[^>]*>.*?<\\/a>/g) || [];
      
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
        citations
      });
    }
    
    // Create the digest object
    const digest = {
      title: \`Weekly AI News Digest: \${formattedWeekStart} - \${formattedToday}\`,
      date: today.toISOString(),
      summary: summary || 'Weekly digest of viral and valuable AI news topics.',
      topics,
      rawHtml: content,
      publishedAt: new Date().toISOString()
    };
    
    console.log(\`Successfully generated Sonar digest with \${digest.topics.length} topics:\`);
    digest.topics.forEach((topic, index) => {
      console.log(\`  \${index + 1}. \${topic.title}\`);
      
      if (topic.citations && topic.citations.length > 0) {
        console.log(\`     Citations: \${topic.citations.length}\`);
      }
    });
    
    // Save the digest to the file
    const dir = path.join(process.cwd(), 'public/data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filePath = path.join(dir, 'sonar-digest.json');
    fs.writeFileSync(filePath, JSON.stringify(digest, null, 2));
    
    console.log('Sonar digest with real news saved to:', filePath);
    
    res.status(200).json({ 
      success: true, 
      topicsCount: digest.topics.length,
      hasCitations: digest.topics.some(t => t.citations && t.citations.length > 0)
    });
  } catch (error) {
    console.error('Error fetching real news for Sonar digest:', error);
    res.status(500).json({ error: String(error) });
  }
}
`
);

try {
  let port = 3003; // Default to 3003
  
  // Check if we can find the port in the environment
  const nextPort = process.env.PORT;
  if (nextPort) {
    try {
      port = parseInt(nextPort, 10);
    } catch (portError) {
      console.warn('Could not parse port from environment, using default:', port);
    }
  }
  
  console.log(`Using port ${port} for API request`);
  
  execSync(`curl -s http://localhost:${port}/api/temp-fetch-sonar`, { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('✅ Sonar Digest updated with real news\n');
} catch (error) {
  console.error('❌ Error updating Sonar Digest:', error);
} finally {
  // Clean up the temporary file
  try {
    fs.unlinkSync(tempFile);
    console.log('Temporary file cleaned up');
  } catch (cleanupError) {
    console.error('Error cleaning up temporary file:', cleanupError);
  }
}

// Create a shell script to run this flow
console.log('Creating shell script to run this flow...');

const shellScriptPath = path.join(rootDir, 'run-with-real-sonar-news.sh');
fs.writeFileSync(
  shellScriptPath,
  `#!/bin/bash

# This script fetches real news for the Sonar digest and starts the development server.

# Set the terminal title
echo -e "\\033]0;Sonar Digest with Real News\\007"

# Print banner
echo "====================================================="
echo "  SONAR DIGEST WITH REAL NEWS"
echo "====================================================="
echo "This script will:"
echo "1. Fetch real news from Perplexity's Sonar API"
echo "2. Update the Sonar digest with real news content"
echo "3. Start the development server"
echo "====================================================="
echo ""

# Make the script executable if it's not already
chmod +x scripts/fetch-real-sonar-news.js

# Run the fetch real news script
echo "Step 1: Fetching real news for Sonar digest..."
node scripts/fetch-real-sonar-news.js

# Check if the script was successful
if [ $? -eq 0 ]; then
  echo "✅ Real news fetched successfully for Sonar digest"
else
  echo "⚠️ There were issues fetching real news for Sonar digest"
fi

echo ""
echo "Step 2: Starting development server..."
echo "The server will be available at http://localhost:3004"
echo "To view the Sonar Digest with real news, go to:"
echo "http://localhost:3004/news/sonar-digest"
echo ""
echo "Press Ctrl+C to stop the server"
echo "====================================================="

# Start the development server
npm run dev
`
);

// Make the shell script executable
fs.chmodSync(shellScriptPath, '755');

console.log('✅ Shell script created successfully\n');

console.log('=== SETUP COMPLETE ===');
console.log('You can now run the script to fetch real news for Sonar digest with:');
console.log('./run-with-real-sonar-news.sh');
console.log('=======================================');