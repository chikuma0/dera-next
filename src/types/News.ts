export interface NewsItem {
  id: string;
  title: {
    en: string;
    ja?: string;
  };
  summary: {
    en: string;
    ja?: string;
  };
  url: string;
  sourceType: 'research' | 'industry' | 'product' | 'business' | 'startup';
  applicationCategory: {
    primary: AIApplication;
    secondary?: AIApplication[];
  };
  source: NewsSource;
  publishedAt: Date;
  importance: number;  // 1-5, 5 being most important
  language: 'en' | 'ja' | 'both';
}

export enum AIApplication {
  // Core AI Applications
  AUTOMATION = 'automation',
  DECISION_MAKING = 'decision-making',
  NATURAL_LANGUAGE = 'natural-language',
  COMPUTER_VISION = 'computer-vision',
  GENERATIVE_AI = 'generative-ai',
  
  // Business Applications
  CUSTOMER_SERVICE = 'customer-service',
  PROCESS_OPTIMIZATION = 'process-optimization',
  PREDICTIVE_ANALYTICS = 'predictive-analytics',
  
  // Emerging Applications
  AUTONOMOUS_SYSTEMS = 'autonomous-systems',
  AI_INFRASTRUCTURE = 'ai-infrastructure',
  AI_SECURITY = 'ai-security'
}

export enum NewsSource {
  // English Sources
  HACKER_NEWS = 'hacker-news',
  TECHCRUNCH = 'techcrunch',
  THE_VERGE = 'the-verge',
  ARXIV = 'arxiv',
  DEEPMIND = 'deepmind',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  HUGGINGFACE = 'huggingface',
  
  // Japanese Sources
  AIER = 'aier',
  AINOW = 'ainow',
  JAPAN_AI = 'japan-ai',
  AI_MEDIA = 'ai-media'
}
