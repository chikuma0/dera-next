import type { NewsItem, AICategory } from '../../types/news';

export interface ScraperOptions {
  translate?: boolean;
  maxResults?: number;
}

export abstract class NewsScraper {
  constructor(protected options: ScraperOptions = {}) {}

  abstract name: string;
  abstract fetchNews(): Promise<NewsItem[]>;

  protected abstract parseContent(raw: unknown): NewsItem[];
  protected abstract categorizeNews(content: unknown): {
    primary: AICategory;
    secondary?: AICategory[];
  };

  protected calculateImportance(item: Partial<NewsItem>): number {
    let score = 0;
    
    // Recency factor (30% weight)
    const hoursAgo = (Date.now() - new Date(item.publishedAt!).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 24 - hoursAgo) / 24 * 30;
    
    // Engagement factor (30% weight)
    if (item.engagement?.points) {
      score += Math.min(item.engagement.points / 100 * 15, 15);
    }
    if (item.engagement?.comments) {
      score += Math.min(item.engagement.comments / 50 * 15, 15);
    }
    
    // Category importance (40% weight)
    if (item.primaryCategory === AICategory.GENERATIVE_AI) score += 40;
    else if (item.primaryCategory === AICategory.AI_RESEARCH) score += 35;
    else if (item.primaryCategory === AICategory.BUSINESS_AI) score += 30;
    else score += 25;
    
    return Math.min(100, score);
  }

  protected async translateText(text: string): Promise<string> {
    if (!this.options.translate) return text;
    // TODO: Implement translation
    return text;
  }

  protected truncateText(text: string, maxLength: number = 250): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
}
