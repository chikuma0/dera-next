import { NewsItem, NewsCategory } from './newsService';
import { mockNews, mockCategories } from '../mock/mockNewsData';

export class MockNewsService {
  /**
   * Get published news items with pagination and optional category filtering
   */
  async getPublishedNews(page = 1, pageSize = 10, category?: string): Promise<{
    items: NewsItem[];
    totalCount: number;
  }> {
    try {
      // Filter by category if provided
      let filteredNews = [...mockNews];
      
      if (category) {
        filteredNews = filteredNews.filter(item => 
          item.categories && item.categories.includes(category)
        );
      }
      
      // Sort by published date (newest first)
      filteredNews.sort((a, b) => 
        new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
      );
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const paginatedNews = filteredNews.slice(startIndex, startIndex + pageSize);
      
      return {
        items: paginatedNews,
        totalCount: filteredNews.length
      };
    } catch (error) {
      console.error('Mock news service error:', error);
      return { items: [], totalCount: 0 };
    }
  }
  
  /**
   * Get all news categories
   */
  async getCategories(): Promise<NewsCategory[]> {
    return [...mockCategories];
  }
  
  /**
   * Get a single news item by ID
   */
  async getNewsItemById(id: string): Promise<NewsItem | null> {
    const item = mockNews.find(news => news.id === id);
    return item || null;
  }
  
  /**
   * Get trending news (highest relevance score)
   */
  async getTrendingNews(limit = 5): Promise<NewsItem[]> {
    const trendingNews = [...mockNews]
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);
    
    return trendingNews;
  }
  
  /**
   * Search news items
   */
  async searchNews(query: string, limit = 20): Promise<NewsItem[]> {
    const lowercaseQuery = query.toLowerCase();
    
    // Simple search implementation that checks title and content
    const searchResults = mockNews.filter(item => {
      return (
        item.title.toLowerCase().includes(lowercaseQuery) ||
        (item.content && item.content.toLowerCase().includes(lowercaseQuery)) ||
        (item.summary && item.summary.toLowerCase().includes(lowercaseQuery))
      );
    }).slice(0, limit);
    
    return searchResults;
  }
  
  /**
   * Get all news sources
   */
  async getAllNewsSources() {
    // Return a simple mock of news sources
    return [
      { id: '1', name: 'AI Insider', url: 'https://example.com/ai-insider', is_active: true, priority: 1, source_type: 'rss' },
      { id: '2', name: 'Science Daily', url: 'https://example.com/science-daily', is_active: true, priority: 2, source_type: 'rss' },
      { id: '3', name: 'Tech Crunch Japan', url: 'https://example.com/techcrunch-jp', is_active: true, priority: 3, source_type: 'rss' }
    ];
  }
} 