import { NewsItem, AIApplication } from '@/types/news';

export abstract class NewsScraper {
  abstract name: string;
  abstract fetchNews(): Promise<NewsItem[]>;
  
  protected abstract parseContent(raw: any): NewsItem[];
  protected abstract categorizeNews(item: Partial<NewsItem>): AIApplication;
  protected abstract translateToJapanese?(text: string): Promise<string>;
  
  protected calculateImportance(item: Partial<NewsItem>): number {
    let score = 0;
    
    const hoursAgo = (Date.now() - new Date(item.publishedAt!).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 24 - hoursAgo) / 24 * 30;
    
    if (item.points) score += Math.min(item.points / 100 * 30, 30);
    if (item.comments) score += Math.min(item.comments / 50 * 20, 20);
    
    if (item.applicationCategory?.primary === AIApplication.GENERATIVE_AI) score += 10;
    
    return Math.min(100, score);
  }
}
