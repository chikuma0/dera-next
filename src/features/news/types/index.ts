export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
}

export interface NewsService {
  fetchNews(): Promise<NewsItem[]>;
} 