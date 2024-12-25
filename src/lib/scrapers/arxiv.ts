import { NewsItem, NewsSource, AIApplication } from '@/types/news';
import { NewsScraper } from './base';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ArxivItem {
  title: string;
  summary: string;
  link: string;
  published: string;
  authors: string[];
  categories: string[];
}

export class ArxivScraper extends NewsScraper {
  name = 'ArXiv';
  private baseUrl = 'http://export.arxiv.org/api/query';
  private categories = [
    'cs.AI',   // Artificial Intelligence
    'cs.LG',   // Machine Learning
    'cs.CL',   // Computation and Language
    'cs.CV',   // Computer Vision
    'cs.RO',   // Robotics
    'stat.ML'  // Machine Learning (Stats)
  ];

  async fetchNews(): Promise<NewsItem[]> {
    try {
      const searchQuery = 'cat:' + this.categories.join(' OR cat:');
      const response = await axios.get(this.baseUrl, {
        params: {
          search_query: searchQuery,
          sortBy: 'submittedDate',
          sortOrder: 'descending',
          max_results: 30
        }
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const entries: ArxivItem[] = [];

      $('entry').each((_, entry) => {
        entries.push({
          title: $(entry).find('title').text().trim(),
          summary: $(entry).find('summary').text().trim(),
          link: $(entry).find('id').text(),
          published: $(entry).find('published').text(),
          authors: $(entry).find('author name').map((_, author) => $(author).text()).get(),
          categories: $(entry).find('category').map((_, category) => $(category).attr('term')).get()
        });
      });

      return this.parseContent(entries);
    } catch (error) {
      console.error('Error fetching from ArXiv:', error);
      return [];
    }
  }

  protected parseContent(items: ArxivItem[]): NewsItem[] {
    return items.map(item => ({
      id: `arxiv-${item.link.split('/').pop()}`,
      title: {
        en: item.title,
      },
      summary: {
        en: this.truncateSummary(item.summary),
      },
      url: item.link,
      source: NewsSource.ARXIV,
      applicationCategory: {
        primary: this.categorizeNews(item),
        secondary: this.getSecondaryCategories(item)
      },
      publishedAt: new Date(item.published),
      importance: this.calculateImportance({
        publishedAt: new Date(item.published),
      })
    }));
  }

  protected categorizeNews(item: ArxivItem): AIApplication {
    const categories = item.categories;
    const title = item.title.toLowerCase();
    const summary = item.summary.toLowerCase();
    
    if (categories.includes('cs.CL') || title.includes('language') || title.includes('nlp')) {
      return AIApplication.NATURAL_LANGUAGE;
    } else if (categories.includes('cs.CV') || title.includes('vision') || title.includes('image')) {
      return AIApplication.COMPUTER_VISION;
    } else if (categories.includes('cs.RO') || title.includes('robot')) {
      return AIApplication.AUTONOMOUS_SYSTEMS;
    } else if (title.includes('generat') || title.includes('llm') || summary.includes('language model')) {
      return AIApplication.GENERATIVE_AI;
    } else if (title.includes('decision') || summary.includes('decision')) {
      return AIApplication.DECISION_MAKING;
    } else if (title.includes('security') || summary.includes('security') || title.includes('privacy')) {
      return AIApplication.AI_SECURITY;
    }
    return AIApplication.AI_INFRASTRUCTURE;
  }

  private getSecondaryCategories(item: ArxivItem): AIApplication[] {
    const categories: AIApplication[] = [];
    const title = item.title.toLowerCase();
    const summary = item.summary.toLowerCase();

    if (title.includes('predict') || summary.includes('predict')) {
      categories.push(AIApplication.PREDICTIVE_ANALYTICS);
    }
    if (title.includes('optim') || summary.includes('optim')) {
      categories.push(AIApplication.PROCESS_OPTIMIZATION);
    }
    if (title.includes('automat') || summary.includes('automat')) {
      categories.push(AIApplication.AUTOMATION);
    }
    if ((title.includes('custom') || summary.includes('custom')) && 
        (title.includes('service') || summary.includes('service'))) {
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
    // TODO: Implement translation service
    return text;
  }
}