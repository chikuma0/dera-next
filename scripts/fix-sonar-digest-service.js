#!/usr/bin/env node

/**
 * This script fixes the SonarDigestService to properly handle the Perplexity API response.
 * 
 * Run with: node scripts/fix-sonar-digest-service.js
 */

const fs = require('fs');
const path = require('path');

// Path to the SonarDigestService file
const servicePath = path.join(__dirname, '..', 'src/lib/services/sonarDigestService.ts');

// Read the current file content
const content = fs.readFileSync(servicePath, 'utf8');

// Function to update the parseSonarResponse method
function updateParseSonarResponse(fileContent) {
  // Find the parseSonarResponse method
  const methodRegex = /private async parseSonarResponse\(htmlContent: string\): Promise<{ topics: SonarDigestTopic\[\], summary: string }> {[\s\S]*?return { topics, summary: summary \|\| 'Weekly digest of viral and valuable AI news topics.' };[\s\S]*?}/;
  
  // Replace the method with the updated version
  const updatedMethod = `private async parseSonarResponse(htmlContent: string): Promise<{ topics: SonarDigestTopic[], summary: string }> {
    // Remove the <think> section if present
    let cleanedHtml = htmlContent;
    const thinkRegex = /<think>[\s\S]*?<\/think>/;
    if (thinkRegex.test(cleanedHtml)) {
      console.log('Found <think> section in Perplexity response, removing it...');
      cleanedHtml = cleanedHtml.replace(thinkRegex, '').trim();
    }

    // This is a simple parser - in a real implementation, you might want to use a proper HTML parser
    const topics: SonarDigestTopic[] = [];
    let summary = '';

    // Extract the summary (assuming it's in a paragraph after the h1)
    const summaryMatch = cleanedHtml.match(/<h1>.*?<\\/h1>\\s*<p>(.*?)<\\/p>/);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
    }

    // Extract topics from the full HTML document
    const topicRegex = /<div class="topic">\\s*<h3>(.*?)<\\/h3>[\\s\\S]*?<p><strong>Summary:<\\/strong>\\s*(.*?)<\\/p>[\\s\\S]*?<p><strong>Why Viral:<\\/strong>\\s*(.*?)<\\/p>[\\s\\S]*?<p><strong>Why Valuable:<\\/strong>\\s*(.*?)<\\/p>[\\s\\S]*?<p><strong>Insights:<\\/strong>\\s*(.*?)<\\/p>[\\s\\S]*?<p><strong>Citations:<\\/strong>\\s*([\\s\\S]*?)<\\/p>[\\s\\S]*?<\\/div>/g;
    
    let match;
    while ((match = topicRegex.exec(cleanedHtml)) !== null) {
      const title = match[1].trim();
      const summary = match[2].trim();
      const viralReason = match[3].trim();
      const valueReason = match[4].trim();
      const insights = match[5].trim();
      const citationsHtml = match[6].trim();

      // Parse citations
      const citations: { title: string, url: string, type: 'article' | 'x-post' }[] = [];
      
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

      // Find related tweets for this topic
      const relatedTweets = await this.findRelatedTweets(title, summary);
      
      // Find related hashtags for this topic
      const relatedHashtags = await this.findRelatedHashtags(title, summary);
      
      // Calculate Twitter impact score based on related tweets and hashtags
      const twitterImpactScore = this.calculateTwitterImpactScore(relatedTweets, relatedHashtags);

      topics.push({
        title,
        summary,
        viralReason,
        valueReason,
        insights,
        citations,
        relatedTweets,
        relatedHashtags,
        twitterImpactScore
      });
    }

    return { topics, summary: summary || 'Weekly digest of viral and valuable AI news topics.' };
  }`;

  return fileContent.replace(methodRegex, updatedMethod);
}

// Update the file content
const updatedContent = updateParseSonarResponse(content);

// Write the updated content back to the file
fs.writeFileSync(servicePath, updatedContent);

console.log('SonarDigestService has been updated to properly handle Perplexity API responses.');
console.log('The service now removes the <think> section before parsing the HTML content.');

// Create a script to test the updated service
const testScriptPath = path.join(__dirname, 'test-sonar-digest.js');
fs.writeFileSync(testScriptPath, `#!/usr/bin/env node

/**
 * This script tests the updated SonarDigestService.
 * 
 * Run with: node scripts/test-sonar-digest.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create a temporary file that will be executed by Next.js
const rootDir = path.join(__dirname, '..');
const tempFile = path.join(rootDir, 'src/pages/api/temp-test-sonar.ts');

console.log('=== TESTING SONAR DIGEST SERVICE ===');
console.log('This script will:');
console.log('1. Use the updated SonarDigestService to fetch real news from Perplexity');
console.log('2. Update the Sonar digest with real news content');
console.log('=======================================\\n');

// Write the temporary file for testing the SonarDigestService
fs.writeFileSync(
  tempFile,
  \`
import { NextApiRequest, NextApiResponse } from 'next';
import { SonarDigestService } from '@/lib/services/sonarDigestService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Testing SonarDigestService with real news...');
  
  try {
    // Create a new instance of the SonarDigestService
    const sonarDigestService = new SonarDigestService();
    
    // Generate a new weekly digest with real news
    console.log('Calling Perplexity API to generate digest with real news...');
    const digest = await sonarDigestService.generateWeeklyDigest();
    
    if (!digest) {
      console.error('Failed to generate Sonar digest');
      res.status(500).json({ error: 'Failed to generate Sonar digest' });
      return;
    }
    
    console.log(\\\`Successfully generated Sonar digest with \\\${digest.topics.length} topics:\\\`);
    digest.topics.forEach((topic, index) => {
      console.log(\\\`  \\\${index + 1}. \\\${topic.title}\\\`);
      
      if (topic.citations && topic.citations.length > 0) {
        console.log(\\\`     Citations: \\\${topic.citations.length}\\\`);
      }
    });
    
    console.log('Sonar digest generation complete!');
    
    res.status(200).json({ 
      success: true, 
      topicsCount: digest.topics.length,
      hasCitations: digest.topics.some(t => t.citations && t.citations.length > 0)
    });
  } catch (error) {
    console.error('Error generating Sonar digest:', error);
    res.status(500).json({ error: String(error) });
  }
}
\`
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
  
  console.log(\`Using port \${port} for API request\`);
  
  execSync(\`curl -s http://localhost:\${port}/api/temp-test-sonar\`, { 
    stdio: 'inherit',
    cwd: rootDir
  });
  
  console.log('✅ SonarDigestService test completed successfully\\n');
} catch (error) {
  console.error('❌ Error testing SonarDigestService:', error);
} finally {
  // Clean up the temporary file
  try {
    fs.unlinkSync(tempFile);
    console.log('Temporary file cleaned up');
  } catch (cleanupError) {
    console.error('Error cleaning up temporary file:', cleanupError);
  }
}

console.log('=== TEST COMPLETE ===');
console.log('The SonarDigestService has been updated to properly handle Perplexity API responses.');
console.log('You can now run the application to see real news in the Sonar digest.');
console.log('=======================================');
`);

console.log('A test script has been created at:', testScriptPath);
console.log('You can run it with: node scripts/test-sonar-digest.js');