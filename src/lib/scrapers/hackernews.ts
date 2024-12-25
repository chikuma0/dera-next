import { NewsItem, NewsSource, AIApplication } from '../../types/News';
import { NewsScraper } from './base';

export class HackerNewsScraper extends NewsScraper {
  name = 'HackerNews';
  private baseUrl = 'https://hacker-news.firebaseio.com/v0';
  
  async fetchNews(): Promise<NewsItem[]> {
    try {
      // Fetch top stories
      const response = await this.fetchWithTimeout(`${this.baseUrl}/topstories.json`);
      const storyIds = await response.json();
      
      // Get details for top 100 stories
      const stories = await Promise.all(
        storyIds.slice(0, 100).map(id =>
          this.fetchWithTimeout(`${this.baseUrl}/item/${id}.json`)
            .then(r => r.json())
        )
      );
      
      // Filter and parse AI-related stories
      return this.parseContent(stories);
    } catch (error) {
      console.error('Error fetching from HackerNews:', error);
      return [];
    }
  }
  
  parseContent(stories: any[]): NewsItem[] {
    return stories
      .filter(story => 
        story && 
        story.title && 
        this.isAIRelated(story.title + (story.text || ''))
      )
      .map(story => ({
        id: `hn-${story.id}`,
        title: {
          en: story.title,
        },
        summary: {
          en: this.generateSummary(story.text || story.title),
        },
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        sourceType: this.determineSourceType(story),
        applicationCategory: {
          primary: this.determineCategory(story),
        },
        source: NewsSource.HACKER_NEWS,
        publishedAt: new Date(story.time * 1000),
        importance: this.calculateImportance(story),
        language: 'en'
      }));
  }
  
  private determineSourceType(story: any): NewsItem['sourceType'] {
    const title = story.title.toLowerCase();
    if (title.includes('research') || title.includes('paper')) return 'research';
    if (title.includes('startup') || title.includes('raises')) return 'startup';
    if (title.includes('launch') || title.includes('released')) return 'product';
    return 'industry';
  }
  
  private determineCategory(story: any): AIApplication {
    const text = (story.title + ' ' + (story.text || '')).toLowerCase();
    
    if (text.includes('vision') || text.includes('image')) return AIApplication.COMPUTER_VISION;
    if (text.includes('nlp') || text.includes('language')) return AIApplication.NATURAL_LANGUAGE;
    if (text.includes('autonomous') || text.includes('self-driving')) return AIApplication.AUTONOMOUS_SYSTEMS;
    if (text.includes('security') || text.includes('privacy')) return AIApplication.AI_SECURITY;
    
    return AIApplication.AI_INFRASTRUCTURE;
  }
  
  private calculateImportance(story: any): number {
    const score = story.score || 0;
    const commentCount = story.descendants || 0;
    
    // Simple scoring based on points and comments
    const normalizedScore = Math.min(score / 200, 1); // Normalize to max 200 points
    const normalizedComments = Math.min(commentCount / 100, 1); // Normalize to max 100 comments
    
    const importance = Math.ceil((normalizedScore * 0.7 + normalizedComments * 0.3) * 5);
    return Math.max(1, Math.min(5, importance)); // Ensure between 1-5
  }
}
