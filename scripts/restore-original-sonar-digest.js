#!/usr/bin/env node

/**
 * This script restores the Sonar digest to its original state without Twitter integration.
 * It generates a clean Sonar digest using only the Perplexity API, without any Twitter or Grok data.
 * 
 * Run with: node scripts/restore-original-sonar-digest.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a temporary file that will be executed by Next.js
const rootDir = path.join(__dirname, '..');
const tempFile = path.join(rootDir, 'src/pages/api/temp-restore-sonar.ts');

console.log('=== RESTORING ORIGINAL SONAR DIGEST ===');
console.log('This script will:');
console.log('1. Generate a new Sonar Digest using only the Perplexity API');
console.log('2. Remove any Twitter or Grok integration');
console.log('3. Restore the original functionality');
console.log('=======================================\n');

// Write the temporary file
fs.writeFileSync(
  tempFile,
  `
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '@/lib/config/env';
import fs from 'fs';
import path from 'path';

// Define the interfaces
interface SonarDigestTopic {
  title: string;
  summary: string;
  viralReason: string;
  valueReason: string;
  insights: string;
  citations: {
    title: string;
    url: string;
    type: 'article' | 'x-post';
  }[];
}

interface SonarWeeklyDigest {
  id?: string;
  title: string;
  date: Date;
  summary: string;
  topics: SonarDigestTopic[];
  rawHtml: string;
  publishedAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Restoring original Sonar digest...');
  
  try {
    // Get API key from environment variable
    const apiKey = process.env.PERPLEXITY_API_KEY || '';
    
    if (!apiKey) {
      console.warn('No Perplexity API key found in environment variables');
      res.status(500).json({ error: 'No Perplexity API key found' });
      return;
    }
    
    // Initialize Supabase client
    const env = validateEnv();
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    
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
    console.log('Calling Perplexity Sonar API...');
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
    const summaryMatch = content.match(/<h1>.*?<\/h1>\\s*<p>(.*?)<\/p>/);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    }
    
    // Extract topics from the full HTML document
    const topicRegex = /<div class="topic">\\s*<h3>(.*?)<\\/h3>\\s*<p><strong>Summary:<\\/strong>\\s*(.*?)<\\/p>\\s*<p><strong>Why Viral:<\\/strong>\\s*(.*?)<\\/p>\\s*<p><strong>Why Valuable:<\\/strong>\\s*(.*?)<\\/p>\\s*<p><strong>Insights:<\\/strong>\\s*(.*?)<\\/p>\\s*<p><strong>Citations:<\\/strong>\\s*(.*?)<\\/p>\\s*<\\/div>/g;
    
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
      date: today,
      summary: summary || 'Weekly digest of viral and valuable AI news topics.',
      topics,
      rawHtml: content,
      publishedAt: new Date()
    };
    
    console.log(\`Successfully generated digest with \${digest.topics.length} topics:\`);
    digest.topics.forEach((topic, index) => {
      console.log(\`  \${index + 1}. \${topic.title}\`);
    });
    
    // Store the digest in the database
    try {
      const { error: insertError } = await supabase
        .from('sonar_digests')
        .insert({
          title: digest.title,
          date: digest.date.toISOString(),
          summary: digest.summary,
          topics: digest.topics,
          raw_html: digest.rawHtml,
          published_at: digest.publishedAt.toISOString()
        });
      
      if (!insertError) {
        console.log('Digest stored in database successfully');
      } else {
        console.error('Error inserting digest into database:', insertError);
        
        // Store in file as fallback
        const dir = path.join(process.cwd(), 'public/data');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        const filePath = path.join(dir, 'sonar-digest.json');
        fs.writeFileSync(filePath, JSON.stringify(digest, null, 2));
        
        console.log('Digest stored in file successfully:', filePath);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Store in file as fallback
      const dir = path.join(process.cwd(), 'public/data');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const filePath = path.join(dir, 'sonar-digest.json');
      fs.writeFileSync(filePath, JSON.stringify(digest, null, 2));
      
      console.log('Digest stored in file successfully:', filePath);
    }
    
    console.log('Original Sonar digest restoration complete!');
    
    res.status(200).json({ 
      success: true, 
      topicsCount: digest.topics.length
    });
  } catch (error) {
    console.error('Error restoring original Sonar digest:', error);
    res.status(500).json({ error: String(error) });
  }
}
`
);

try {
  // Execute the Next.js API route using curl
  let port = 3004; // Default port
  
  try {
    // Check if we can find the port in the environment
    const nextPort = process.env.PORT || process.env.NEXT_PUBLIC_PORT;
    if (nextPort) {
      port = nextPort;
    }
  } catch (portError) {
    console.warn('Could not detect port from environment, using default:', port);
  }
  
  console.log(`Using port ${port} for API request`);
  
  execSync(`curl -s http://localhost:${port}/api/temp-restore-sonar`, { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('✅ Original Sonar Digest restored successfully\n');
} catch (error) {
  console.error('❌ Error restoring original Sonar Digest:', error);
  console.log('Continuing with the process...\n');
} finally {
  // Clean up the temporary file
  try {
    fs.unlinkSync(tempFile);
    console.log('Temporary file cleaned up');
  } catch (cleanupError) {
    console.error('Error cleaning up temporary file:', cleanupError);
  }
}

// Now create a simple script to generate a Twitter-enhanced version without Grok
console.log('Generating Twitter-enhanced version without Grok integration...');

// Create a temporary file for the Twitter-enhanced version
const tempTwitterFile = path.join(rootDir, 'src/pages/api/temp-twitter-enhanced.ts');

fs.writeFileSync(
  tempTwitterFile,
  `
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Generating Twitter-enhanced Sonar digest without Grok...');
  
  try {
    // Read the original Sonar digest
    const sonarDigestPath = path.join(process.cwd(), 'public/data/sonar-digest.json');
    
    if (!fs.existsSync(sonarDigestPath)) {
      throw new Error('Sonar Digest file not found');
    }
    
    const sonarDigestData = JSON.parse(fs.readFileSync(sonarDigestPath, 'utf8'));
    
    // Read the Twitter data
    const twitterDataPath = path.join(process.cwd(), 'public/data/twitter-data.json');
    
    if (!fs.existsSync(twitterDataPath)) {
      throw new Error('Twitter data file not found');
    }
    
    const twitterData = JSON.parse(fs.readFileSync(twitterDataPath, 'utf8'));
    
    // Enhance the Sonar digest with Twitter data
    const enhancedDigest = { ...sonarDigestData };
    
    // Add Twitter data to each topic
    enhancedDigest.topics = enhancedDigest.topics.map(topic => {
      // Find related tweets for this topic
      const keywords = [...new Set([
        ...topic.title.toLowerCase().split(/\\s+/).filter(word => word.length > 3),
        ...topic.summary.toLowerCase().split(/\\s+/).filter(word => word.length > 3)
      ])];
      
      // Filter tweets that contain any of the keywords
      const relatedTweets = twitterData.tweets.filter(tweet => {
        const tweetContent = tweet.content.toLowerCase();
        return keywords.some(keyword => tweetContent.includes(keyword));
      }).slice(0, 3); // Take top 3
      
      // Find related hashtags
      const relatedHashtags = twitterData.hashtags.filter(hashtag => {
        return keywords.some(keyword => hashtag.hashtag.toLowerCase().includes(keyword));
      }).slice(0, 3); // Take top 3
      
      // Calculate Twitter impact score
      let twitterImpactScore = 0;
      
      // Add scores from tweets
      for (const tweet of relatedTweets) {
        twitterImpactScore += tweet.impactScore;
      }
      
      // Add scores from hashtags
      for (const hashtag of relatedHashtags) {
        twitterImpactScore += hashtag.impactScore;
      }
      
      // Normalize the score
      if (relatedTweets.length > 0 || relatedHashtags.length > 0) {
        twitterImpactScore = twitterImpactScore / (relatedTweets.length + relatedHashtags.length);
      }
      
      // Round to 2 decimal places
      twitterImpactScore = Math.round(twitterImpactScore * 100) / 100;
      
      return {
        ...topic,
        relatedTweets,
        relatedHashtags,
        twitterImpactScore
      };
    });
    
    // Save the enhanced digest
    const enhancedDigestPath = path.join(process.cwd(), 'public/data/twitter-enhanced-sonar-digest.json');
    fs.writeFileSync(enhancedDigestPath, JSON.stringify(enhancedDigest, null, 2));
    
    console.log(\`Successfully generated Twitter-enhanced Sonar digest with \${enhancedDigest.topics.length} topics\`);
    enhancedDigest.topics.forEach((topic, index) => {
      console.log(\`  \${index + 1}. \${topic.title}\`);
      
      if (topic.relatedTweets && topic.relatedTweets.length > 0) {
        console.log(\`     Related tweets: \${topic.relatedTweets.length}\`);
      }
      
      if (topic.relatedHashtags && topic.relatedHashtags.length > 0) {
        console.log(\`     Related hashtags: \${topic.relatedHashtags.length}\`);
      }
      
      if (topic.twitterImpactScore) {
        console.log(\`     Twitter impact score: \${topic.twitterImpactScore}\`);
      }
    });
    
    res.status(200).json({ 
      success: true, 
      topicsCount: enhancedDigest.topics.length,
      hasTwitterData: enhancedDigest.topics.some(t => 
        (t.relatedTweets && t.relatedTweets.length > 0) || 
        (t.relatedHashtags && t.relatedHashtags.length > 0)
      )
    });
  } catch (error) {
    console.error('Error generating Twitter-enhanced Sonar digest:', error);
    res.status(500).json({ error: String(error) });
  }
}
`
);

try {
  // Execute the Next.js API route using curl
  let port = 3004; // Default port
  
  try {
    // Check if we can find the port in the environment
    const nextPort = process.env.PORT || process.env.NEXT_PUBLIC_PORT;
    if (nextPort) {
      port = nextPort;
    }
  } catch (portError) {
    console.warn('Could not detect port from environment, using default:', port);
  }
  
  console.log(`Using port ${port} for API request`);
  
  execSync(`curl -s http://localhost:${port}/api/temp-twitter-enhanced`, { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('✅ Twitter-enhanced Sonar Digest generated successfully\n');
} catch (error) {
  console.error('❌ Error generating Twitter-enhanced Sonar Digest:', error);
} finally {
  // Clean up the temporary file
  try {
    fs.unlinkSync(tempTwitterFile);
    console.log('Temporary file cleaned up');
  } catch (cleanupError) {
    console.error('Error cleaning up temporary file:', cleanupError);
  }
}

console.log('=== RESTORATION COMPLETE ===');
console.log('The Sonar Digest has been restored to its original state without Grok integration.');
console.log('You can now view the updated digest in the application.');
console.log('To view the Sonar Digest:');
console.log('1. Go to /news/sonar-digest in the application');
console.log('2. For Twitter-enhanced version, use /news/sonar-digest?source=twitter-enhanced');
console.log('=======================================');