import type { NewsItem } from '@/types';

export interface ScraperOptions {
  translate?: boolean;
  limit?: number;
}

export abstract class NewsScraper {
  constructor(protected options: ScraperOptions = {}) {}

  abstract fetchNews(): Promise<NewsItem[]>;
  protected abstract parseContent(raw: unknown): NewsItem[];
}
