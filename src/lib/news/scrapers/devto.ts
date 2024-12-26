import axios from 'axios';
import type { NewsItem } from '@/types';
import { NewsScraper, type ScraperOptions } from '../base-scraper';

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  positive_reactions_count: number;
  comments_count: number;
  user: {
    name: string;
  };
  tags: string[];
}

export class DevToScraper extends NewsScraper {
  private baseUrl = 'https://dev.to/api/articles';
  
  constructor(options?: ScraperOptions) {
    super({ limit: 10, ...options });
  }

  async fetchNews(): Promise<NewsItem[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          tag: 'ai',
          top: 1,
          per_page: this.options.limit
        }
      });

      return this.parseContent(response.data);
    } catch (error) {
      console.error('Error fetching from Dev.to:', error);
      return [];
    }
  }

  protected parseContent(items: DevToArticle[]): NewsItem[] {
    return items.map(article => {
      const text = `${article.title} ${article.description} ${article.tags.join(' ')}`;
      
      return {
        id: `devto-${article.id}`,
        title: article.title,
        url: article.url,
        source: 'Dev.to',
        publishedAt: article.published_at,
        score: article.positive_reactions_count,
        comments: article.comments_count,
        by: article.user.name,
        summary: article.description,
        priority: this.determinePriority(text),
        contentCategory: this.categorizeContent(text)
      };
    });
  }

  private determinePriority(article: DevToArticle): ContentPriority {
    const text = `${article.title} ${article.description} ${article.tags.join(' ')}`.toLowerCase();
    
    if (text.includes('business') || text.includes('enterprise')) return 'business';
    if (article.positive_reactions_count > 50) return 'industry';
    if (text.includes('tutorial') || text.includes('guide')) return 'implementation';
    return 'general';
  }

  private categorizeContent(article: DevToArticle): string[] {
    const text = `${article.title} ${article.description} ${article.tags.join(' ')}`.toLowerCase();
    const categories: string[] = [];

    const categoryMap = {
      'ai-tools': ['ai', 'tool', 'library', 'framework'],
      'business-ops': ['business', 'production', 'enterprise'],
      'implementation': ['tutorial', 'guide', 'how-to', 'example'],
      'industry-news': ['news', 'release', 'announcement', 'update']
    };

    Object.entries(categoryMap).forEach(([category, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        categories.push(category);
      }
    });

    return categories;
  }
} 