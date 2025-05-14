# Enhanced Sonar Digest

This document explains how the Enhanced Sonar Digest system works and how to use it.

## Overview

The Enhanced Sonar Digest is an improved version of the Sonar Weekly Digest that:

1. Uses Sonar deep research as the primary source
2. Synthesizes with Grok deep research for additional context and verification
3. Implements advanced scoring to select the 5 most important AI news stories
4. Verifies all citations to ensure they're real and accessible
5. Uses Grok API for Twitter insights
6. Ensures all content is real, verified, and properly cited

## How It Works

The Enhanced Sonar Digest follows a comprehensive process:

1. **Generate Sonar Digest**: Uses Perplexity's Sonar deep research to generate a digest of AI news
2. **Generate Grok Digest**: Uses xAI's Grok API to generate additional context and verification
3. **Extract Twitter Data**: Uses Grok API to extract Twitter data for social media context
4. **Verify Citations**: Checks all URLs to ensure they're real and accessible
5. **Score and Select Topics**: Implements advanced scoring to select the 5 most important stories
6. **Create Final Digest**: Combines all the data into a comprehensive digest

## Key Improvements

Compared to the previous implementation, the Enhanced Sonar Digest offers:

1. **Better Source Verification**: All citations are verified to ensure they're real and accessible
2. **Advanced Scoring**: Topics are scored based on multiple factors including citation count, content quality, and Twitter impact
3. **Dual-Source Approach**: Uses both Sonar and Grok for a more comprehensive and accurate digest
4. **Real Twitter Insights**: Uses Grok API to provide real Twitter data and insights
5. **Focused Content**: Ensures only the 5 most important and impactful stories are included

## Usage

To generate an Enhanced Sonar Digest:

```bash
./run-with-enhanced-sonar-digest.sh
```

This script will:
1. Make the enhanced-sonar-digest.js script executable
2. Run the script to generate an Enhanced Sonar Digest
3. Start the development server

## Requirements

To use the Enhanced Sonar Digest, you need:

1. A Perplexity API key (set as `PERPLEXITY_API_KEY` in your `.env.local` file)
2. An xAI API key for Grok (set as `XAI_API_KEY` in your `.env.local` file)
3. Node.js 18+ installed

## Implementation Details

### 1. Sonar Deep Research

The Enhanced Sonar Digest uses Perplexity's "sonar-deep-research" model to generate the initial digest. This model has access to the latest information from the web and can provide comprehensive research on AI news topics.

### 2. Grok Deep Research

The system also uses xAI's "grok-2-latest" model to generate additional context and verification. Grok has access to X (formerly Twitter) data and can provide social media context for each topic.

### 3. Citation Verification

All citations are verified to ensure they're real and accessible. The system checks each URL and filters out any inaccessible citations, ensuring that only real sources are included in the digest.

### 4. Advanced Scoring

Topics are scored based on multiple factors:
- Citation count: More citations indicate a more significant topic
- Content quality: Longer, more detailed content receives a higher score
- Twitter impact: Topics with more Twitter engagement receive a higher score

### 5. Twitter Integration

The system uses Grok API to extract Twitter data, including:
- Related tweets for each topic
- Related hashtags for each topic
- Twitter impact scores based on engagement metrics

## Customization

You can customize the Enhanced Sonar Digest by modifying the following:

### 1. Number of Topics

To change the number of topics included in the digest, modify the `topStoriesCount` value in the `CONFIG` object in `scripts/enhanced-sonar-digest.js`.

### 2. Scoring Algorithm

To adjust how topics are scored, modify the `calculateOverallScore` function in `scripts/enhanced-sonar-digest.js`.

### 3. Prompts

To change the prompts used for Sonar and Grok, modify the respective sections in `scripts/enhanced-sonar-digest.js`.

## Troubleshooting

### Missing API Keys

If you see errors about missing API keys, make sure you've added them to your `.env.local` file:

```
PERPLEXITY_API_KEY=your_perplexity_api_key
XAI_API_KEY=your_xai_api_key
```

### API Errors

If you encounter errors with the Perplexity or Grok APIs:

1. Check that your API keys are valid
2. Verify that you have sufficient credits in your accounts
3. Try running the script again after a few minutes

### No Digest Generated

If no digest is generated:

1. Check the console output for error messages
2. Verify that your API keys are valid
3. Check that you have internet connectivity
4. Try running the script with the `--debug` flag for more detailed output

## Future Improvements

Potential improvements for the Enhanced Sonar Digest include:

1. **More News Sources**: Incorporate more news sources for a more comprehensive digest
2. **Better Keyword Matching**: Improve the keyword matching algorithm for finding related tweets
3. **Real-time Updates**: Update the digest in real-time as new news and tweets become available
4. **User Customization**: Allow users to customize the topics and sources they're interested in
5. **Sentiment Analysis**: Add sentiment analysis for tweets and news articles
6. **Topic Clustering**: Improve topic clustering to better group related news items
7. **Historical Comparison**: Compare current topics with historical data to identify trends