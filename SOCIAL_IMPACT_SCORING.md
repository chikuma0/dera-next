# Social Impact Scoring and Citation Fixing System

This document provides an overview of the Social Impact Scoring and Citation Fixing system implemented in the Dera Next project. The system enhances article scoring with social media impact data and ensures that citations in the Sonar digest are relevant to their topics.

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Key Components](#key-components)
4. [Algorithms](#algorithms)
5. [Usage](#usage)
6. [Future Enhancements](#future-enhancements)

## Overview

The Social Impact Scoring and Citation Fixing system addresses two key issues in the news system:

1. **Article Scoring Enhancement**: The system incorporates social media impact data into the article scoring algorithm, boosting the scores of articles that are trending on social media.

2. **Citation Relevance**: The system ensures that citations in the Sonar digest are contextually relevant to the topics they reference, rather than being randomly assigned.

## System Architecture

The system consists of three main components:

1. **Data Collection**: Fetches social media data (tweets, hashtags) from the Grok API.

2. **Data Processing**: Analyzes the social media data to extract keywords, calculate impact scores, and establish relationships between topics, articles, and social media content.

3. **Data Integration**: Updates article scores in the database and enhances the Sonar digest with relevant citations.

## Key Components

### 1. Social Impact Article Scoring

The `social-impact-article-scoring.js` script analyzes articles against trending social media topics and shows how social media impact would affect article rankings. It provides a comparison between current and social-enhanced rankings.

Key features:
- Extracts keywords from social media content
- Matches articles with social media keywords
- Calculates a social boost factor (0-50%) based on matches
- Applies the boost to the base article score

### 2. Update Scores with Social Impact

The `update-scores-with-social-impact.js` script updates article scores in the database with social impact factored in. It requires confirmation before making changes and provides detailed output of score changes.

Key features:
- Displays before/after comparison of article scores
- Shows position changes in the article rankings
- Updates the database with new scores
- Logs all changes for transparency

### 3. Schedule Social Impact Scoring

The `schedule-social-impact-scoring.js` script runs hourly to keep article scores aligned with social trends. It logs all activities and maintains a last-update record for transparency.

Key features:
- Schedules the scoring to run at regular intervals
- Logs all activities to a log file
- Updates a timestamp file after each run
- Can be run manually with the `--run` flag

### 4. Fix Sonar Citations

The `fix-sonar-citations.js` script analyzes each topic in the Sonar digest, finds tweets and articles that are genuinely relevant to each topic, and replaces random citations with contextually appropriate ones.

Key features:
- Extracts keywords from topics
- Finds relevant tweets and articles
- Creates new citations based on relevance
- Updates the HTML content to match the new citations

### 5. Integrated Solution

The `integrated-social-impact-scoring.js` script combines citation fixing with social impact scoring. It creates bidirectional relationships between topics and content, mapping topics to relevant articles and tweets, and boosting article scores based on social media engagement.

Key features:
- Creates bidirectional relationships between topics and content
- Maps topics to relevant articles and tweets
- Boosts article scores based on social media engagement
- Updates the Sonar digest with relevant citations

## Algorithms

### Keyword Extraction

```javascript
function extractKeywords(text) {
  // Convert to lowercase
  const lowercaseText = text.toLowerCase();
  
  // Split into words
  const words = lowercaseText.split(/\W+/);
  
  // Filter out common stop words and short words
  const stopWords = [
    'the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about',
    // ... more stop words ...
  ];
  
  const keywords = words.filter(word => word.length > 3 && !stopWords.includes(word));
  
  // Return unique keywords
  return [...new Set(keywords)];
}
```

### Relevance Matching

```javascript
function findRelevantItems(items, keywords, textExtractor) {
  // Score each item based on keyword matches
  const scoredItems = items.map(item => {
    const itemText = textExtractor(item).toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      if (itemText.includes(keyword)) {
        score++;
      }
    });
    
    // Use impact score as a secondary sorting criterion if available
    if (item.impactScore) {
      score = score * 100 + (item.impactScore / 1000);
    }
    
    return { item, score };
  });
  
  // Sort items by relevance score
  scoredItems.sort((a, b) => b.score - a.score);
  
  // Return the most relevant items
  return scoredItems.filter(item => item.score > 0).map(item => item.item);
}
```

### Social Boost Calculation

```javascript
// Calculate social boost factor (0-50%)
const socialBoostPercentage = Math.min(matchCount * 5, 50);
const socialBoostFactor = socialBoostPercentage / 100;

// Get the base score from the article
const baseScore = article.importance_score || 100;

// Calculate new score with social boost
const newScore = Math.round(baseScore * (1 + socialBoostFactor));
```

### HTML Content Updating

```javascript
function updateHtmlContent(htmlContent, newCitations) {
  if (!htmlContent) return htmlContent;
  
  // Find the citations section
  const citationsSectionRegex = /<p><strong>Citations:<\/strong>.*?<\/p>/s;
  const citationsMatch = htmlContent.match(citationsSectionRegex);
  
  if (!citationsMatch) return htmlContent;
  
  // Create new citations HTML
  const newCitationsHtml = `<p><strong>Citations:</strong> ${newCitations.map(citation => 
    `<a href="${citation.url}" target="_blank">${citation.title}</a>`
  ).join(', ')}</p>`;
  
  // Replace the old citations section with the new one
  return htmlContent.replace(citationsSectionRegex, newCitationsHtml);
}
```

## Usage

### Running the Social Impact Scoring

To run the social impact scoring system:

```bash
# Show how social media impact would affect article rankings
node scripts/social-impact-article-scoring.js

# Update article scores in the database with social impact factored in
node scripts/update-scores-with-social-impact.js

# Schedule the social impact scoring to run hourly
node scripts/schedule-social-impact-scoring.js

# Fix citations in the Sonar digest
node scripts/fix-sonar-citations.js

# Run the integrated solution
node scripts/integrated-social-impact-scoring.js

# Demonstrate the integrated solution
node scripts/demo-integrated-solution.js
```

### Testing the System

To test the social impact scoring system:

```bash
# Run the test script
node scripts/test-social-impact.js
```

## Future Enhancements

1. **Advanced Relevance Algorithms**: Implement more sophisticated algorithms for matching articles and topics, such as TF-IDF or word embeddings.

2. **Real-time Updates**: Integrate with a real-time social media API to update scores as new content is published.

3. **User Feedback Loop**: Incorporate user feedback on article relevance to improve the scoring algorithm.

4. **Multi-platform Social Data**: Expand beyond Twitter to include data from other social media platforms.

5. **Sentiment Analysis**: Incorporate sentiment analysis to distinguish between positive and negative social media attention.

6. **Personalized Scoring**: Develop personalized scoring based on user interests and reading history.

7. **Visualization Tools**: Create dashboards to visualize the impact of social media on article rankings.