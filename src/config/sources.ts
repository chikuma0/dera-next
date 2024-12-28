// src/config/sources.ts
export const NEWS_SOURCES = [
    {
      name: 'Google News - AI',
      url: 'https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en',
      language: 'en'
    },
    {
      name: 'Google News - AI (Japanese)',
      url: 'https://news.google.com/rss/search?q=人工知能&hl=ja&gl=JP&ceid=JP:ja',
      language: 'ja'
    }
  ];
  
  // src/lib/news-fetcher.ts
  import Parser from 'rss-parser';
  import { NewsItem } from '@/types/news';
  
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'mediaContent'],
        ['source', 'source']
      ]
    }
  });
  
  export async function fetchGoogleNews(language: 'en' | 'ja' = 'en'): Promise<NewsItem[]> {
    const source = NEWS_SOURCES.find(s => s.language === language);
    if (!source) return [];
  
    try {
      const feed = await parser.parseURL(source.url);
      
      return feed.items.map(item => ({
        id: item.guid || item.link || '',
        title: item.title || '',
        url: item.link || '',
        source: item.source || 'Google News',
        publishedDate: new Date(item.pubDate || ''),
        language: source.language
      }));
    } catch (error) {
      console.error('Error fetching Google News:', error);
      return [];
    }
  }