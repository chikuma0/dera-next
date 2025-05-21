// src/lib/news/alternativeSources.ts
import { NewsItem } from '@/types/news';

// Interface for alternative news sources
export interface AlternativeSource {
  name: string;
  fetchNews: () => Promise<NewsItem[]>;
  language: 'en' | 'ja';
}

// Function to fetch news from HackerNews API
async function fetchHackerNewsAI(): Promise<NewsItem[]> {
  try {
    // Fetch top stories from HackerNews
    const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!topStoriesResponse.ok) throw new Error('Failed to fetch top stories');
    const topStories = await topStoriesResponse.json();
    
    // Get the top 30 stories
    const storyIds = topStories.slice(0, 30);
    
    // Fetch details for each story
    const storyPromises = storyIds.map((id: number) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
    );
    
    const stories = await Promise.all(storyPromises);
    
    // Filter for AI-related stories
    const aiKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
      'neural network', 'llm', 'large language model', 'gpt', 'chatgpt', 'openai',
      'anthropic', 'claude', 'gemini', 'mistral', 'llama'
    ];
    
    const aiStories = stories.filter(story => {
      if (!story.title) return false;
      const title = story.title.toLowerCase();
      return aiKeywords.some(keyword => title.includes(keyword.toLowerCase()));
    });
    
    // Convert to NewsItem format
    return aiStories.map(story => ({
      id: `hn-${story.id}`,
      title: story.title,
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      source_id: 'hackernews',
      source: 'Hacker News',
      published_date: new Date(story.time * 1000),
      language: 'en',
      summary: story.text || `Points: ${story.score} | Comments: ${story.descendants || 0}`,
      importance_score: story.score * 1.5 // Use HN score as a base for importance
    }));
  } catch (error) {
    console.error('Error fetching from HackerNews:', error);
    return [];
  }
}

// Function to fetch news from Reddit API
async function fetchRedditAI(): Promise<NewsItem[]> {
  try {
    // Fetch top posts from r/artificial and r/MachineLearning
    const subreddits = ['artificial', 'MachineLearning', 'OpenAI', 'LocalLLaMA'];
    const posts: NewsItem[] = [];
    
    for (const subreddit of subreddits) {
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=10&t=week`);
      if (!response.ok) continue;
      
      const data = await response.json();
      const children = data.data.children;
      
      for (const child of children) {
        const post = child.data;
        if (post.stickied || post.is_self) continue; // Skip stickied and self posts
        
        posts.push({
          id: `reddit-${post.id}`,
          title: post.title,
          url: post.url,
          source_id: `reddit-${subreddit}`,
          source: `Reddit - r/${subreddit}`,
          published_date: new Date(post.created_utc * 1000),
          language: 'en',
          summary: post.selftext ? post.selftext.substring(0, 200) + '...' : `Upvotes: ${post.ups} | Comments: ${post.num_comments}`,
          importance_score: post.ups * 0.8 // Use upvotes as a base for importance
        });
      }
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching from Reddit:', error);
    return [];
  }
}

// Function to fetch news from ArXiv API
async function fetchArxivAI(): Promise<NewsItem[]> {
  try {
    const query = encodeURIComponent('cat:cs.AI OR cat:cs.LG OR cat:cs.CL');
    const response = await fetch(`https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=10`);
    
    if (!response.ok) throw new Error('Failed to fetch from ArXiv');
    
    const text = await response.text();
    
    // Use a different approach to parse XML in Node.js
    // This is a simplified approach that doesn't actually parse XML
    // but just extracts data using regex for demonstration purposes
    const papers: NewsItem[] = [];
    
    // Basic regex extraction of entries (this is a simplified approach)
    const entryMatches = text.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
    
    for (const entryText of entryMatches) {
      const titleMatch = entryText.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      const summaryMatch = entryText.match(/<summary[^>]*>([\s\S]*?)<\/summary>/);
      const publishedMatch = entryText.match(/<published>([\s\S]*?)<\/published>/);
      const idMatch = entryText.match(/<id>([\s\S]*?)<\/id>/);
      
      const title = titleMatch?.[1]?.trim() || '';
      const summary = summaryMatch?.[1]?.trim() || '';
      const published = publishedMatch?.[1] || '';
      const id = idMatch?.[1] || '';
      
      // Skip if not AI-related
      const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'neural network', 'deep learning'];
      const isAIRelated = aiKeywords.some(keyword => 
        title.toLowerCase().includes(keyword) || summary.toLowerCase().includes(keyword)
      );
      
      if (!isAIRelated) continue;
      
      papers.push({
        id: `arxiv-${id.split('/').pop()}`,
        title,
        url: id,
        source_id: 'arxiv',
        source: 'arXiv',
        published_date: new Date(published),
        language: 'en',
        summary: summary.substring(0, 200) + '...',
        importance_score: 100 // Base score for research papers
      });
    }
    
    return papers;
  } catch (error) {
    console.error('Error fetching from ArXiv:', error);
    return [];
  }
}

// List of alternative sources
export const ALTERNATIVE_SOURCES: AlternativeSource[] = [
  {
    name: 'Hacker News',
    fetchNews: fetchHackerNewsAI,
    language: 'en'
  },
  {
    name: 'Reddit',
    fetchNews: fetchRedditAI,
    language: 'en'
  },
  {
    name: 'ArXiv',
    fetchNews: fetchArxivAI,
    language: 'en'
  }
];