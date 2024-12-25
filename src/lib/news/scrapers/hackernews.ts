'use client';

import axios from 'axios';
import type { NewsItem } from '@/types';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score?: number;
  descendants?: number;
  time: number;
  by: string;
}

export class HackerNewsScraper {
  private baseUrl = 'https://hacker-news.firebaseio.com/v0';
  
  async fetchNews(limit = 30): Promise<NewsItem[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/topstories.json`);
      const storyIds = response.data.slice(0, limit);
      
      const items = await Promise.all(
        storyIds.map(async (id: number) => {
          const itemResponse = await axios.get(`${this.baseUrl}/item/${id}.json`);
          return itemResponse.data;
        })
      );

      return this.parseContent(items);
    } catch (error) {
      console.error('Error fetching from HackerNews:', error);
      return [];
    }
  }

  private parseContent(items: HNItem[]): NewsItem[] {
    return items.map(item => ({
      id: `hn-${item.id}`,
      title: item.title,
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      source: 'Hacker News',
      publishedAt: new Date(item.time * 1000).toISOString(),
      score: item.score,
      comments: item.descendants,
      by: item.by
    }));
  }
}