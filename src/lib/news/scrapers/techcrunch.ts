import type { NewsItem } from '@/types';
import { BaseRssScraper } from './base-rss-scraper';
import type Parser from 'rss-parser';

export class TechCrunchScraper extends BaseRssScraper {
  constructor() {
    // Update to include source name
    super('TechCrunch', 'https://techcrunch.com/feed/');
  }

  protected mapToNewsItem(item: Parser.Item): NewsItem {
    return {
      id: `tc-${Buffer.from(item.guid || item.link || '').toString('base64').slice(0, 10)}`,
      title: item.title || 'Untitled',
      url: item.link || '',
      source: 'TechCrunch',
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      summary: item.contentSnippet || item.description || '',
      priority: this.determinePriority(item.title || ''),
      contentCategory: this.categorizeContent(item.title || '')
    };
  }

  private determinePriority(title: string, content: string): ContentPriority {
    const text = `${title} ${content}`.toLowerCase();
    if (text.includes('ai') && text.includes('business')) return 'business';
    if (text.includes('launch') || text.includes('startup')) return 'industry';
    if (text.includes('how') || text.includes('guide')) return 'implementation';
    return 'general';
  }

  private categorizeContent(title: string, content: string): string[] {
    const categories: string[] = [];
    const text = `${title} ${content}`.toLowerCase();

    const categoryMap = {
      'ai-tools': ['ai platform', 'ai tool', 'machine learning'],
      'business-ops': ['business', 'enterprise', 'operations'],
      'implementation': ['implementation', 'deploy', 'integrate'],
      'industry-news': ['launch', 'announce', 'release']
    };

    Object.entries(categoryMap).forEach(([category, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        categories.push(category);
      }
    });

    return categories;
  }
}