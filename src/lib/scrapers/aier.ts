import { NewsItem, NewsSource, AIApplication } from '@/types/news';
import { NewsScraper } from './base';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface AierItem {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
}

export class AierScraper extends NewsScraper {
  name = 'AIer';
  private baseUrl = 'https://www.aier.info';

  async fetchNews(): Promise<NewsItem[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/news`);
      const $ = cheerio.load(response.data);
      const articles: AierItem[] = [];

      $('.article-item').each((_, article) => {
        articles.push({
          title: $(article).find('.article-title').text().trim(),
          summary: $(article).find('.article-summary').text().trim(),
          url: this.baseUrl + $(article).find('a').attr('href'),
          publishedAt: $(article).find('.article-date').text().trim()
        });
      });

      return this.parseContent(articles);
    } catch (error) {
      console.error('Error fetching from AIer:', error);
      return [];
    }
  }

  protected parseContent(items: AierItem[]): NewsItem[] {
    return items.map(item => ({
      id: `aier-${Buffer.from(item.url).toString('base64')}`,
      title: {
        ja: item.title,
        en: '' // Will be translated
      },
      summary: {
        ja: this.truncateSummary(item.summary),
        en: '' // Will be translated
      },
      url: item.url,
      source: NewsSource.AIER,
      applicationCategory: {
        primary: this.categorizeNews(item),
        secondary: this.getSecondaryCategories(item)
      },
      publishedAt: new Date(item.publishedAt),
      importance: this.calculateImportance({
        publishedAt: new Date(item.publishedAt),
      })
    }));
  }

  protected categorizeNews(item: AierItem): AIApplication {
    const title = item.title.toLowerCase();
    const summary = item.summary.toLowerCase();
    
    // Japanese keywords for categorization
    if (title.includes('生成') || title.includes('LLM') || title.includes('GPT') || 
        title.includes('言語モデル') || summary.includes('生成AI')) {
      return AIApplication.GENERATIVE_AI;
    } else if (title.includes('視覚') || title.includes('画像') || 
               title.includes('認識') || summary.includes('コンピュータビジョン')) {
      return AIApplication.COMPUTER_VISION;
    } else if (title.includes('言語') || title.includes('対話') || 
               title.includes('チャット') || summary.includes('自然言語')) {
      return AIApplication.NATURAL_LANGUAGE;
    } else if (title.includes('自動化') || title.includes('ロボット') || 
               summary.includes('自動化')) {
      return AIApplication.AUTOMATION;
    } else if (title.includes('セキュリティ') || title.includes('プライバシー') || 
               summary.includes('セキュリティ')) {
      return AIApplication.AI_SECURITY;
    } else if (title.includes('予測') || summary.includes('予測')) {
      return AIApplication.PREDICTIVE_ANALYTICS;
    }
    return AIApplication.AI_INFRASTRUCTURE;
  }

  private getSecondaryCategories(item: AierItem): AIApplication[] {
    const categories: AIApplication[] = [];
    const title = item.title.toLowerCase();
    const summary = item.summary.toLowerCase();

    // Add secondary categories based on Japanese keywords
    if (title.includes('予測') || summary.includes('予測')) {
      categories.push(AIApplication.PREDICTIVE_ANALYTICS);
    }
    if (title.includes('最適化') || summary.includes('最適化')) {
      categories.push(AIApplication.PROCESS_OPTIMIZATION);
    }
    if (title.includes('自動') || summary.includes('自動')) {
      categories.push(AIApplication.AUTOMATION);
    }
    if ((title.includes('顧客') || summary.includes('顧客')) && 
        (title.includes('サービス') || summary.includes('サービス'))) {
      categories.push(AIApplication.CUSTOMER_SERVICE);
    }

    return categories;
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