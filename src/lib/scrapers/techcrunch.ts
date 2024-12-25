import { NewsItem, NewsSource, AIApplication } from '@/types/news';
import { NewsScraper } from './base';
import Parser from 'rss-parser';

interface TechCrunchItem {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  content: string;
  contentSnippet: string;
  categories: string[];
}

export class TechCrunchScraper extends NewsScraper {
  name = 'TechCrunch';
  private parser = new Parser<TechCrunchItem>();
  private feedUrl = 'https://techcrunch.com/feed/';
  private aiKeywords = [
    'artificial intelligence',
    'machine learning',
    'AI',
    'LLM',
    'GPT',
    'deep learning',
    'neural network',
    'openai',
    'anthropic',
    'claude',
    'gemini'
  ];

  async fetchNews(): Promise<NewsItem[]> {
    try {
      const feed = await this.parser.parseURL(this.feedUrl);
      const aiArticles = feed.items.filter(item => 
        this.isAIRelated(item.title) || 
        this.isAIRelated(item.contentSnippet) ||
        item.categories.some(cat => this.isAIRelated(cat))
      );

      return this.parseContent(aiArticles);
    } catch (error) {
      console.error('Error fetching from TechCrunch:', error);
      return [];
    }
  }

  protected parseContent(items: TechCrunchItem[]): NewsItem[] {
    return items.map(item => ({
      id: `tc-${Buffer.from(item.link).toString('base64')}`,
      title: {
        en: item.title,
      },
      summary: {
        en: this.truncateSummary(item.contentSnippet),
      },
      url: item.link,
      source: NewsSource.TECH_CRUNCH,
      applicationCategory: {
        primary: this.categorizeNews(item),
        secondary: this.getSecondaryCategories(item)
      },
      publishedAt: new Date(item.pubDate),
      importance: this.calculateImportance({
        publishedAt: new Date(item.pubDate),
      })
    }));
  }

  protected categorizeNews(item: TechCrunchItem): AIApplication {
    const title = item.title.toLowerCase();
    const content = item.contentSnippet.toLowerCase();
    const categories = item.categories.map(c => c.toLowerCase());
    
    if (this.containsAny([title, content, ...categories], ['generat', 'llm', 'gpt', 'claude', 'language model'])) {
      return AIApplication.GENERATIVE_AI;
    } else if (this.containsAny([title, content, ...categories], ['vision', 'image', 'diffusion', 'visual'])) {
      return AIApplication.COMPUTER_VISION;
    } else if (this.containsAny([title, content, ...categories], ['nlp', 'language', 'chat'])) {
      return AIApplication.NATURAL_LANGUAGE;
    } else if (this.containsAny([title, content, ...categories], ['automat', 'robot'])) {
      return AIApplication.AUTOMATION;
    } else if (this.containsAny([title, content, ...categories], ['security', 'privacy', 'protect'])) {
      return AIApplication.AI_SECURITY;
    }
    return AIApplication.AI_INFRASTRUCTURE;
  }

  private getSecondaryCategories(item: TechCrunchItem): AIApplication[] {
    const categories: AIApplication[] = [];
    const searchTexts = [
      item.title.toLowerCase(),
      item.contentSnippet.toLowerCase(),
      ...item.categories.map(c => c.toLowerCase())
    ];

    if (this.containsAny(searchTexts, ['predict', 'forecast'])) {
      categories.push(AIApplication.PREDICTIVE_ANALYTICS);
    }
    if (this.containsAny(searchTexts, ['optim', 'improv', 'enhanc'])) {
      categories.push(AIApplication.PROCESS_OPTIMIZATION);
    }
    if (this.containsAny(searchTexts, ['customer service', 'support', 'assistant'])) {
      categories.push(AIApplication.CUSTOMER_SERVICE);
    }

    return categories;
  }

  private isAIRelated(text: string): boolean {
    return this.aiKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private containsAny(texts: string[], keywords: string[]): boolean {
    return texts.some(text =>
      keywords.some(keyword => text.includes(keyword))
    );
  }

  private truncateSummary(summary: string): string {
    const maxLength = 250;
    if (summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength).trim() + '...';
  }

  protected async translateToJapanese(text: string): Promise<string> {
    // Translation will be implemented later
    return text;
  }
}