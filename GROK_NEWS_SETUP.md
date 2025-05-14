# Using Grok API for Real News in Sonar Digest

This document explains how to use the Grok API to fetch real news data for the Sonar Digest feature, avoiding Twitter API rate limits.

## Overview

The Grok-powered Sonar Digest uses xAI's Grok API to:

1. Fetch real news data using Grok's DeepSearch capabilities
2. Extract Twitter/X data from Grok's search results
3. Generate a comprehensive AI news digest with real data
4. Create a Twitter-enhanced version with social media context

This approach provides several advantages:
- Avoids Twitter API rate limits
- Provides more comprehensive and up-to-date news data
- Includes social media context without requiring direct Twitter API access
- Generates higher quality digests with real information

## Prerequisites

To use Grok for real news data, you need:

1. An xAI API key for Grok (set as `XAI_API_KEY` in your `.env.local` file)
2. A Perplexity API key (set as `PERPLEXITY_API_KEY` in your `.env.local` file)
3. Node.js 18+ installed

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```
# Required for Grok API
XAI_API_KEY=your_xai_api_key

# Required for Sonar API
PERPLEXITY_API_KEY=your_perplexity_api_key
```

### 2. Schedule Weekly Updates

For production use, set up the weekly scheduler to automatically refresh the data:

```bash
# Start the scheduler (runs every Monday at 9:00 AM)
node scripts/schedule-weekly-sonar-grok-update.js

# Run in the background (keeps running after terminal is closed)
nohup node scripts/schedule-weekly-sonar-grok-update.js &

# Run an update immediately and then schedule weekly updates
node scripts/schedule-weekly-sonar-grok-update.js --run-now
```

This ensures that:
- The Sonar Digest is refreshed with real news once a week
- The data is stored for quick page loads
- API calls are minimized to reduce costs and improve performance

### 3. Run the Grok-powered Refresh Script (Development)

For development or manual updates, run the provided shell script:

```bash
./run-with-grok-news.sh
```

This script will:
1. Use Grok API to fetch real news and Twitter data
2. Generate a new Sonar Digest with real news
3. Start the development server with real data

Alternatively, you can run just the refresh script:

```bash
node scripts/refresh-sonar-with-grok-data.js
```

### 3. View the Grok-powered Sonar Digest

After running the script, you can view the Sonar Digest with real news at:

```
http://localhost:3004/news/sonar-digest
```

The Sonar Digest component now defaults to using the Twitter-enhanced version, which includes real news data from Grok.

## How It Works

### Data Flow

```
Grok API (DeepSearch) → Grok Digest
       ↓
Extract Twitter data from Grok results
       ↓
Generate Sonar Digest with Grok data
       ↓
Create Twitter-enhanced Sonar Digest
       ↓
Sonar Digest Component
```

### Step-by-Step Process

1. **Grok Digest Generation**:
   - The script calls the Grok API to generate a digest with real news data
   - Grok uses its DeepSearch capabilities to find the latest AI news
   - The results are stored in `public/data/grok-digest.json`

2. **Twitter Data Extraction**:
   - The script extracts Twitter/X data from the Grok digest
   - It identifies X-post citations and converts them to tweet format
   - It extracts hashtags and calculates engagement metrics
   - The results are stored in `public/data/twitter-data.json`

3. **Sonar Digest Generation**:
   - The script uses the Perplexity Sonar API to generate a digest
   - It incorporates the real news data from Grok
   - The results are stored in `public/data/sonar-digest.json`

4. **Twitter-enhanced Sonar Digest**:
   - The script combines the Sonar digest with the extracted Twitter data
   - It adds related tweets, hashtags, and impact scores to each topic
   - The results are stored in `public/data/twitter-enhanced-sonar-digest.json`

## Troubleshooting

### Missing API Keys

If you see errors about missing API keys, make sure you've added them to your `.env.local` file:

```
XAI_API_KEY=your_xai_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```

### Grok API Errors

If you encounter errors with the Grok API:

1. Check that your API key is valid
2. Verify that you have sufficient credits in your xAI account
3. Try running the script again after a few minutes

### No Real News Data

If the Sonar Digest isn't showing real news:

1. Check that the Grok digest was generated successfully
2. Verify that your API keys are valid
3. Try running the refresh script with the `nocache=true` parameter:
   ```
   http://localhost:3004/news/sonar-digest?nocache=true
   ```

## Customization

### Modifying the Grok Prompt

To change how the Grok digest is generated, edit the `createGrokPrompt` method in `src/lib/services/grokDigestService.ts`.

### Adjusting Twitter Data Extraction

To modify how Twitter data is extracted from Grok results, edit the Twitter data extraction section in `scripts/refresh-sonar-with-grok-data.js`.

### Changing the Sonar Prompt

To adjust how the Sonar digest is generated with Grok data, edit the `createSonarPrompt` method in `src/lib/services/sonarDigestService.ts`.