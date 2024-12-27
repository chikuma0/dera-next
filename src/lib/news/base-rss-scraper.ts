import Parser from 'rss-parser';
import type { NewsItem } from '@/types';
import { NewsScraper, type ScraperOptions } from './base-scraper';

export abstract class BaseRssScraper extends NewsScraper {
  private parser: Parser;
  private feedUrl: string;

  constructor(source: string, feedUrl: string, options?: ScraperOptions) {
    super(source, options);
    this.feedUrl = feedUrl;
    this.parser = new Parser({
      customFields: {
        item: ['description', 'content:encoded']
      }
    });
  }

  protected async fetchNewsInternal(): Promise<NewsItem[]> {
    try {
      const feed = await this.parser.parseURL(this.feedUrl);
      return feed.items
        .slice(0, this.options.limit)
        .map(item => this.mapToNewsItem(item));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  protected abstract mapToNewsItem(item: Parser.Item): NewsItem;
} 