import axios from 'axios';
import type { NewsItem } from '@/types';
import { NewsScraper, type ScraperOptions } from '../base-scraper';

interface GitHubRepo {
  name: string;
  owner: {
    login: string;
  };
  html_url: string;
  description: string;
  stargazers_count: number;
  created_at: string;
  topics: string[];
}

export class GitHubScraper extends NewsScraper {
  private baseUrl = 'https://api.github.com';
  private aiKeywords = ['ai', 'artificial-intelligence', 'machine-learning', 'deep-learning', 'llm', 'gpt'];
  
  constructor(options?: ScraperOptions) {
    super({ limit: 10, ...options });
  }

  async fetchNews(): Promise<NewsItem[]> {
    try {
      // Search for AI-related repositories created in the last week
      const query = this.aiKeywords.map(k => `topic:${k}`).join(' OR ');
      const response = await axios.get(
        `${this.baseUrl}/search/repositories`, {
          params: {
            q: `${query} created:>=${this.getLastWeekDate()}`,
            sort: 'stars',
            order: 'desc',
            per_page: this.options.limit
          },
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            ...(process.env.GITHUB_TOKEN && {
              'Authorization': `token ${process.env.GITHUB_TOKEN}`
            })
          }
        }
      );

      return this.parseContent(response.data.items);
    } catch (error) {
      console.error('Error fetching from GitHub:', error);
      return [];
    }
  }

  protected parseContent(items: GitHubRepo[]): NewsItem[] {
    return items.map(repo => {
      const text = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`;
      return {
        id: `gh-${repo.owner.login}-${repo.name}`,
        title: `${repo.name} - ${repo.description || 'New AI Repository'}`,
        url: repo.html_url,
        source: 'GitHub',
        publishedAt: repo.created_at,
        score: repo.stargazers_count,
        by: repo.owner.login,
        summary: this.generateSummary(repo),
        priority: this.determinePriority(text),
        contentCategory: this.categorizeContent(text)
      };
    });
  }

  private generateSummary(repo: GitHubRepo): string {
    return `${repo.description || ''} | ${repo.stargazers_count} stars | Topics: ${repo.topics.join(', ')}`;
  }

  private determinePriority(repo: GitHubRepo): ContentPriority {
    const text = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();
    
    if (text.includes('business') || text.includes('enterprise')) {
      return 'business';
    }
    if (repo.topics.some(t => t.includes('framework') || t.includes('platform'))) {
      return 'industry';
    }
    if (text.includes('tutorial') || text.includes('example')) {
      return 'implementation';
    }
    return 'general';
  }

  private categorizeContent(repo: GitHubRepo): string[] {
    const categories: string[] = [];
    const text = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();

    const categoryMap = {
      'ai-tools': ['model', 'framework', 'library', 'sdk'],
      'business-ops': ['business', 'enterprise', 'production'],
      'implementation': ['example', 'tutorial', 'demo', 'template'],
      'industry-news': ['release', 'launch', 'new']
    };

    Object.entries(categoryMap).forEach(([category, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword) || 
          repo.topics.some(t => t.includes(keyword)))) {
        categories.push(category);
      }
    });

    return categories;
  }

  private getLastWeekDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  }
} 