import { NewsItem, NewsSource, AIApplication } from '@/types/news';
import { NewsScraper } from './base';
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
    'deep learning',
    'neural network',
    'GPT',
    'stable diffusion',
    'openai',
    'anthropic',
    'claude',
    'gemini'
  ];

  async fetchNews(): Promise<NewsItem[]> {
    try {
      // Fetch top 100 stories
      const response = await axios.get(`${this.baseUrl}/topstories.json`);
      const storyIds = response.data.slice(0, 100);

      // Fetch details for each story
      const stories = await Promise.all(
        storyIds.map(id =>
          axios.get(`${this.baseUrl}/item/${id}.json`)
            .then(response => response.data)
        )
      );

      // Filter AI-related stories and parse them
      const aiStories = stories.filter(story =>
        story.title && this.isAIRelated(story.title)
      );

      return this.parseContent(aiStories);
    } catch (error) {
      console.error('Error fetching from HackerNews:', error);
      return [];
    }
  }

  protected parseContent(items: HNItem[]): NewsItem[] {
    return items.map(item => ({
      id: `hn-${item.id}`,
      title: {
        en: item.title,
      },
      summary: {
        en: `A discussion on HackerNews with ${item.descendants} comments and ${item.score} points.`,
      },
      url: item.url,
      source: NewsSource.HACKER_NEWS,
      applicationCategory: {
        primary: this.categorizeNews({ title: { en: item.title } }),
      },
      publishedAt: new Date(item.time * 1000),
      importance: this.calculateImportance({
        points: item.score,
        comments: item.descendants,
        publishedAt: new Date(item.time * 1000),
      }),
      points: item.score,
      comments: item.descendants,
    }));
  }

  protected categorizeNews(item: Partial<NewsItem>): AIApplication {
    const title = item.title?.en.toLowerCase() || '';
    
    if (title.includes('generat') || title.includes('llm') || title.includes('gpt') || title.includes('claude')) {
      return AIApplication.GENERATIVE_AI;
    } else if (title.includes('vision') || title.includes('image') || title.includes('diffusion')) {
      return AIApplication.COMPUTER_VISION;
    } else if (title.includes('nlp') || title.includes('language') || title.includes('chat')) {
      return AIApplication.NATURAL_LANGUAGE;
    } else if (title.includes('automat') || title.includes('robot')) {
      return AIApplication.AUTOMATION;
    } else if (title.includes('security') || title.includes('privacy')) {
      return AIApplication.AI_SECURITY;
    }
    // Default category
    return AIApplication.AI_INFRASTRUCTURE;
  }

  private isAIRelated(title: string): boolean {
    return this.aiKeywords.some(keyword =>
      title.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}
