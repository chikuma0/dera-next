# Twitter-Enhanced Sonar Digest Setup

This document explains how to set up and use the Twitter-enhanced Sonar digest feature, which combines Perplexity's Sonar API with Twitter data to create a more comprehensive AI news digest.

## Overview

The Twitter-enhanced Sonar digest adds social media context to the regular Sonar digest by:

1. Finding tweets related to each topic in the digest
2. Identifying trending hashtags related to each topic
3. Calculating a Twitter impact score for each topic based on engagement metrics

This provides additional context about how AI topics are being discussed on social media, which can help identify truly viral and impactful developments.

## Prerequisites

- Node.js 18+ installed
- A Perplexity API key (for the regular Sonar digest)
- Twitter data (either real data from the Twitter API or mock data)

## Setup Instructions

### 1. Generate the Regular Sonar Digest

First, you need to generate the regular Sonar digest:

```bash
node scripts/generate-sonar-digest.mjs
```

This will create a file at `public/data/sonar-digest.json`.

### 2. Prepare Twitter Data

You have two options for Twitter data:

#### Option A: Use Mock Twitter Data

For testing or development, you can use mock Twitter data:

```bash
node scripts/mock-twitter-data.js
```

This will create a file at `public/data/twitter-data.json` with sample tweets and hashtags.

#### Option B: Use Real Twitter Data

For production, you can fetch real Twitter data:

```bash
node scripts/fetch-real-twitter-data.js
```

Note: This requires setting up Twitter API credentials in your `.env.local` file:

```
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
```

### 3. Generate the Twitter-Enhanced Sonar Digest

Once you have both the Sonar digest and Twitter data, you can generate the Twitter-enhanced digest:

```bash
node scripts/generate-twitter-enhanced-sonar-digest.mjs
```

This will create a file at `public/data/twitter-enhanced-sonar-digest.json`.

### 4. View the Twitter-Enhanced Sonar Digest

You can view the Twitter-enhanced Sonar digest by visiting:

```
http://localhost:3000/news/sonar-digest?source=twitter-enhanced
```

The `source=twitter-enhanced` parameter tells the application to use the Twitter-enhanced version of the digest.

## Scheduling Weekly Updates

To automatically generate the Twitter-enhanced Sonar digest on a weekly basis, you can use the scheduling script:

```bash
node scripts/schedule-twitter-enhanced-sonar-digest.mjs
```

This will:

1. Calculate the time until next Monday at 9:00 AM
2. Schedule the generation process to run at that time
3. After running, schedule the next run for the following week

You can also run the generation process immediately by adding the `--run-now` flag:

```bash
node scripts/schedule-twitter-enhanced-sonar-digest.mjs --run-now
```

## How It Works

The Twitter integration works by:

1. Extracting keywords from each topic's title and summary
2. Finding tweets that contain those keywords
3. Finding hashtags that match those keywords
4. Calculating an impact score based on engagement metrics (likes, retweets, follower counts)
5. Adding the related tweets, hashtags, and impact score to each topic in the digest

## Customization

You can customize the Twitter integration by modifying the following files:

- `scripts/generate-twitter-enhanced-sonar-digest.mjs`: The main script for generating the Twitter-enhanced digest
- `scripts/schedule-twitter-enhanced-sonar-digest.mjs`: The scheduling script for weekly updates
- `src/components/news/SonarDigest.tsx`: The React component that displays the digest
- `src/app/api/news/sonar-digest/route.ts`: The API route that serves the digest

## Troubleshooting

If you encounter issues with the Twitter-enhanced Sonar digest:

1. Check that both `public/data/sonar-digest.json` and `public/data/twitter-data.json` exist
2. Verify that the Twitter data contains tweets and hashtags
3. Check the console logs for any error messages
4. Try clearing the browser cache or adding `?nocache=true` to the URL

## Future Improvements

Potential improvements to the Twitter integration include:

1. More sophisticated keyword extraction using NLP techniques
2. Sentiment analysis of related tweets
3. Tracking changes in Twitter engagement over time
4. Integration with other social media platforms
5. Customizable filtering of tweets and hashtags