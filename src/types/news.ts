// src/types/news.ts
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published_date: Date;
  language: 'en' | 'ja';
  summary?: string;
  created_at?: Date;
  updated_at?: Date;
  importance_score?: number;
  categories?: string[];
}

export interface RSSSource {
  name: string;
  url: string;
  language: 'en' | 'ja';
}

export const NEWS_SOURCES: RSSSource[] = [
  // English Sources
  {
    name: 'Google News - AI Tech',
    url: 'https://news.google.com/rss/search?q="artificial+intelligence"+technology+when:7d+-stock+-market+-investor&hl=en-US&gl=US&ceid=US:en',
    language: 'en'
  },
  {
    name: 'Google News - AI Development',
    url: 'https://news.google.com/rss/search?q="ai+development"+OR+"ai+research"+OR+"ai+breakthrough"+when:7d+-stock+-market+-investor&hl=en-US&gl=US&ceid=US:en',
    language: 'en'
  },
  {
    name: 'Google News - AI Applications',
    url: 'https://news.google.com/rss/search?q="ai+software"+OR+"ai+tool"+OR+"ai+system"+when:7d+-stock+-market+-investor&hl=en-US&gl=US&ceid=US:en',
    language: 'en'
  },
  {
    name: 'Google News - Tech Innovation',
    url: 'https://news.google.com/rss/search?q="machine+learning"+OR+"deep+learning"+OR+"neural+network"+when:7d+-stock+-market+-investor&hl=en-US&gl=US&ceid=US:en',
    language: 'en'
  },
  // Japanese Sources
  {
    name: 'Google News - AI Tech (Japanese)',
    url: 'https://news.google.com/rss/search?q=AI+技術+when:7d+-株価+-投資&hl=ja&gl=JP&ceid=JP:ja',
    language: 'ja'
  },
  {
    name: 'Google News - AI Development (Japanese)',
    url: 'https://news.google.com/rss/search?q=AI+開発+OR+研究+when:7d+-株価+-投資&hl=ja&gl=JP&ceid=JP:ja',
    language: 'ja'
  },
  {
    name: 'Google News - AI Applications (Japanese)',
    url: 'https://news.google.com/rss/search?q=AI+システム+OR+ツール+when:7d+-株価+-投資&hl=ja&gl=JP&ceid=JP:ja',
    language: 'ja'
  },
  {
    name: 'Google News - Tech Innovation (Japanese)',
    url: 'https://news.google.com/rss/search?q=機械学習+OR+深層学習+when:7d+-株価+-投資&hl=ja&gl=JP&ceid=JP:ja',
    language: 'ja'
  }
];
