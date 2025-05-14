# Real News Data Setup

This document explains how to set up and use real news data in the Sonar and Grok digests.

## Overview

The Sonar and Grok digests are designed to show real news content from the Perplexity and xAI APIs, respectively. However, sometimes the digests may show placeholder content instead of real news. This document explains how to fix this issue and ensure that the digests always show real news content.

## Issue

The issue was that the Sonar digest was showing placeholder content instead of real news. This was because the Perplexity API response includes a `<think>` section at the beginning, which is the AI's internal reasoning process, followed by the actual HTML content. The parser in the `SonarDigestService` wasn't handling this correctly.

Additionally, the browser was caching the old content, so even after fixing the parser, the browser would still show the old content.

## Solution

We've implemented the following solutions:

1. Fixed the `SonarDigestService` to properly handle the Perplexity API response by removing the `<think>` section before parsing the HTML content.
2. Created a script to update the Twitter-enhanced Sonar digest with the real news content from the Perplexity API.
3. Created a cache clearing page to clear the browser cache and ensure that the latest content is displayed.
4. Created a script to automate the process of refreshing the real news digests.

## How to Use

### Running with Real News

To run the application with real news data, simply execute the `run-with-real-news.sh` script:

```bash
./run-with-real-news.sh
```

This script will:
1. Refresh the real news digests
2. Start the development server
3. Open the cache clearing page

### Clearing the Cache

If you're seeing outdated content in the digests, you can clear the cache by:

1. Opening the cache clearing page: http://localhost:3004/clear-sonar-cache.html
2. Using the tabs to clear the cache for Sonar, Grok, or both
3. Clicking the button to reload the digest page with the latest real news content

### Manually Refreshing the Real News Digests

If you want to manually refresh the real news digests, you can run the `refresh-real-news.js` script:

```bash
node scripts/refresh-real-news.js
```

This script will:
1. Generate a new Sonar digest with real news from the Perplexity API
2. Update the Twitter-enhanced Sonar digest with the real news content
3. Generate a new Grok digest with real news from the xAI API
4. Create a cache clearing page to clear the browser cache

## Technical Details

### SonarDigestService

The `SonarDigestService` has been updated to properly handle the Perplexity API response. The key change is in the `parseSonarResponse` method, which now removes the `<think>` section before parsing the HTML content:

```typescript
private async parseSonarResponse(htmlContent: string): Promise<{ topics: SonarDigestTopic[], summary: string }> {
  // Remove the <think> section if present
  let cleanedHtml = htmlContent;
  const thinkRegex = /<think>[\s\S]*?<\/think>/;
  if (thinkRegex.test(cleanedHtml)) {
    console.log('Found <think> section in Perplexity response, removing it...');
    cleanedHtml = cleanedHtml.replace(thinkRegex, '').trim();
  }

  // Rest of the method...
}
```

### Twitter-Enhanced Sonar Digest

The Twitter-enhanced Sonar digest is a version of the Sonar digest that includes Twitter-related data, such as related tweets and hashtags. The `update-twitter-enhanced-sonar-digest.js` script updates this file with the real news content from the Perplexity API, while preserving the Twitter-related data.

### Cache Clearing Page

The cache clearing page is a simple HTML page that clears the cached digest data from the browser's localStorage. It provides tabs to clear the cache for Sonar, Grok, or both digests.

## Troubleshooting

If you're still seeing outdated content after clearing the cache, try the following:

1. Make sure the development server is running
2. Check the browser console for any errors
3. Try clearing the browser cache manually (Ctrl+Shift+Delete in most browsers)
4. Restart the development server
5. Try a different browser

If none of these solutions work, please open an issue on the GitHub repository.