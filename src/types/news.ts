export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: NewsSource;
  publishedAt: string;
  summary?: string;
  score?: number;
  comments?: number;
  by?: string;
  priority: ContentPriority;
  contentCategory: string[];
  relevanceScore?: number;
}

export type NewsSource = 
  | 'Hacker News'
  | 'TechCrunch'
  | 'Techmeme'
  | 'The Verge'
  | 'GitHub'
  | 'Product Hunt'
  | 'Dev.to';

export type ContentPriority = 
  | 'business'
  | 'industry'
  | 'implementation'
  | 'general';

export interface NewsResponse {
  items: NewsItem[];
  error?: string;
  errors?: Error[];
}

export interface NewsTickerProps {
  initialNews?: NewsItem[];
  interval?: number;
  maxItems?: number;
  onNewsClick?: (item: NewsItem) => void;
} 