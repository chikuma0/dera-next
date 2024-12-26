import axios from 'axios';
import * as cheerio from 'cheerio';
import type { NewsItem } from '@/types';
import { NewsScraper } from '../base-scraper';

export class TechmemeScraper extends NewsScraper {
  private baseUrl = 'https://www.techmeme.com';

  async fetchNews(): Promise<NewsItem[]> {
    try {
      const response = await axios.get(this.baseUrl);
      const $ = cheerio.load(response.data);
      const newsItems: NewsItem[] = [];

      $('.item').slice(0, this.options.limit).each((_, element) => {
        const $item = $(element);
        const title = $item.find('.itemtitle').text().trim();
        const url = $item.find('a').first().attr('href') || '';
        const timestamp = $item.find('.timestamp').text().trim();
        const source = $item.find('.source').text().trim();
        const summary = $item.find('.itemtext').text().trim();

        if (title && url) {
          newsItems.push(this.createNewsItem({
            title,
            url,
            timestamp,
            source,
            summary
          }));
        }
      });

      return newsItems;
    } catch (error) {
      console.error('Error fetching from Techmeme:', error);
      return [];
    }
  }

  private createNewsItem(data: {
    title: string;
    url: string;
    timestamp: string;
    source: string;
    summary: string;
  }): NewsItem {
    const id = `tm-${Buffer.from(data.url).toString('base64').slice(0, 10)}`;
    const text = `${data.title} ${data.summary}`;
    
    return {
      id,
      title: data.title,
      url: data.url,
      source: 'Techmeme',
      publishedAt: data.timestamp 
        ? new Date(data.timestamp).toISOString()
        : new Date().toISOString(),
      summary: data.summary,
      priority: this.determinePriority(text),
      contentCategory: this.categorizeContent(text)
    };
  }
} 