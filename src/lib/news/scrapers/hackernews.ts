'use client';

import { NewsItem, NewsSource, AICategory } from '../../../types/news';
import { NewsScraper, type ScraperOptions } from '../base-scraper';
import axios from 'axios';

interface HNItem {
  id: number;
  title: string;
  url: string;
  score: number;
  descendants: number;
  time: number;
}

export class HackerNewsScraper extends NewsScraper {
  name = 'HackerNews';
  private baseUrl = 'https://hacker-news.firebaseio.com/v0';
  private aiKeywords = [
    'artificial intelligence',
    'machine learning',
    'AI',
    'LLM',
    'GPT',
    'deep learning',
    'neural network',
    'openai',
    'anthropic',
    'claude',
    'gemini'
  ];

  constructor(options: ScraperOptions = {}) {
    super({
      maxResults: 50,
      ...options,
    });
  }

  async fetchNews(): Promise<NewsItem[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/topstories.json`);
      const storyIds = response.data.slice(0, this.options.maxResults || 50);

      const stories = await Promise.all(
        storyIds.map(id =>
          axios.get(`${this.baseUrl}/item/${id}.json`)
            .then(response => response.data)
        )
      );

      const aiStories = stories.filter(story =>
        story?.title && this.isAIRelated(story.title)
      );

      return this.parseContent(aiStories);
    } catch (error) {
      console.error('Error fetching from HackerNews:', error);
      return [];
    }
  }

  protected parseContent(items: HNItem[]): NewsItem[] {
    return items.map(item => {
      const categorization = this.categorizeNews(item);
      return {
        id: `hn-${item.id}`,
        title: {
          en: item.title,
        },
        summary: {
          en: `A discussion on HackerNews with ${item.descendants || 0} comments and ${item.score || 0} points.`,
        },
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        source: NewsSource.HACKER_NEWS,
        primaryCategory: categorization.primary,
        secondaryCategories: categorization.secondary,
        publishedAt: new Date(item.time * 1000),
        importance: this.calculateImportance({
          publishedAt: new Date(item.time * 1000),
          engagement: {
            points: item.score,
            comments: item.descendants,
          },
          primaryCategory: categorization.primary
        }),
        engagement: {
          points: item.score,
          comments: item.descendants,
        },
      };
    });
  }

  protected categorizeNews(item: HNItem): {
    primary: AICategory;
    secondary?: AICategory[];
  } {
    const title = item.title.toLowerCase();
    const categories: AICategory[] = [];
    let primary = AICategory.AI_INFRASTRUCTURE;

    if (title.includes('gpt') || title.includes('llm') || 
        title.includes('language model') || title.includes('claude')) {
      primary = AICategory.GENERATIVE_AI;
      categories.push(AICategory.NATURAL_LANGUAGE);
    } 
    else if (title.includes('vision') || title.includes('image') || 
             title.includes('diffusion')) {
      primary = AICategory.COMPUTER_VISION;
    }
    else if (title.includes('research') || title.includes('paper')) {
      primary = AICategory.AI_RESEARCH;
    }

    // Add secondary categories
    if (title.includes('business') || title.includes('startup') || 
        title.includes('company')) {
      categories.push(AICategory.BUSINESS_AI);
    }
    if (title.includes('security') || title.includes('privacy')) {
      categories.push(AICategory.AI_SECURITY);
    }
    if (title.includes('ethics') || title.includes('bias')) {
      categories.push(AICategory.AI_ETHICS);
    }

    return {
      primary,
      secondary: categories.filter(c => c !== primary)
    };
  }

  private isAIRelated(title: string): boolean {
    return this.aiKeywords.some(keyword =>
      title.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}
