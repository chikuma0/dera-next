# Grok Twitter Integration

This document explains how to use Grok API as a complete replacement for the Twitter API, avoiding rate limits while still providing real social media context for the AI news digest.

## Overview

The Grok-powered Twitter integration uses xAI's Grok API to:

1. Fetch real news data using Grok's DeepSearch capabilities
2. Extract Twitter/X data directly from Grok's search results
3. Generate a comprehensive AI news digest with real data
4. Create a Twitter-enhanced version with social media context

This approach provides several advantages:
- **No Twitter API Rate Limits**: Completely removes the Twitter API dependency
- **Real Social Data**: Provides real Twitter/X data through Grok's DeepSearch
- **Comprehensive Coverage**: Grok can search across the entire Twitter/X platform
- **Cost Effective**: Requires only the xAI API key, not a Twitter API subscription

## Prerequisites

To use Grok for Twitter data, you need:

1. An xAI API key for Grok (set as `XAI_API_KEY` in your `.env.local` file)
2. A Perplexity API key (set as `PERPLEXITY_API_KEY` in your `.env.local` file)
3. Node.js 18+ installed

## How It Works

### Data Flow

```
Grok API (DeepSearch) → Grok Digest with X Posts
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
   - The script calls the Grok API with an enhanced prompt that specifically requests X posts and hashtags
   - Grok uses its DeepSearch capabilities to find the latest AI news and social media discussions
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

## Implementation Details

### 1. GrokTwitterService

We've created a new `GrokTwitterService` class that replaces the original `TwitterService`. This new service:

- Uses the Twitter data extracted from Grok instead of making direct API calls
- Provides the same interface as the original service for compatibility
- Calculates impact scores and processes hashtags in the same way
- Stores data in the same database tables with a source field indicating it came from Grok

### 2. Enhanced Grok Prompt

We've enhanced the Grok prompt to specifically request:

- More X posts with engagement metrics
- Trending hashtags related to AI
- Social media context for each topic

### 3. Improved Twitter Data Extraction

The enhanced script includes improved logic for extracting Twitter data:

- Extracts tweets from X-post citations
- Extracts tweets from dedicated X Posts sections
- Extracts hashtags from topic titles and viral reasons
- Creates additional tweets based on topics if needed

## Usage

### Running the Enhanced Script

To use the Grok-powered Twitter integration:

```bash
./run-with-grok-twitter.sh
```

This script will:
1. Make the enhanced script executable
2. Run the enhanced script to generate the digest with Grok data
3. Start the development server

### Viewing the Results

After running the script, you can view the Sonar Digest with Twitter data at:

```
http://localhost:3004/news/sonar-digest
```

For the Twitter-enhanced version:

```
http://localhost:3004/news/sonar-digest?source=twitter-enhanced
```

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

### No Twitter Data

If the Sonar Digest isn't showing Twitter data:

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

To modify how Twitter data is extracted from Grok results, edit the Twitter data extraction section in `scripts/enhanced-refresh-sonar-with-grok-data.js`.

### Changing the Sonar Prompt

To adjust how the Sonar digest is generated with Grok data, edit the `createSonarPrompt` method in `src/lib/services/sonarDigestService.ts`.