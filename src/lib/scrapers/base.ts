import { NewsItem } from '../../types/News';

export abstract class NewsScraper {
  abstract name: string;
  abstract fetchNews(): Promise<NewsItem[]>;
  abstract parseContent(raw: any): NewsItem[];
  
  protected async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  protected isAIRelated(text: string): boolean {
    const aiKeywords = [
      'artificial intelligence',
      'machine learning',
      'deep learning',
      'neural network',
      'AI',
      'ML',
      'LLM',
      'GPT',
      'autonomous',
      'automation',
      'robot',
      'chatbot',
      '人工知能',
      'AI技術',
      '機械学習'
    ];
    
    return aiKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  protected generateSummary(text: string, maxLength = 200): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).split(' ').slice(0, -1).join(' ') + '...';
  }
}
