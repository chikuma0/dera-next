export enum NewsSource {
  HACKER_NEWS = 'hackernews',
  ARXIV = 'arxiv',
  TECH_CRUNCH = 'techcrunch',
  AIER = 'aier',
  AI_NOW = 'ainow',
  CUSTOM = 'custom'
}

export enum AIApplication {
  AUTOMATION = 'automation',
  DECISION_MAKING = 'decision-making',
  NATURAL_LANGUAGE = 'natural-language',
  COMPUTER_VISION = 'computer-vision',
  GENERATIVE_AI = 'generative-ai',
  CUSTOMER_SERVICE = 'customer-service',
  PROCESS_OPTIMIZATION = 'process-optimization',
  PREDICTIVE_ANALYTICS = 'predictive-analytics',
  AUTONOMOUS_SYSTEMS = 'autonomous-systems',
  AI_INFRASTRUCTURE = 'ai-infrastructure',
  AI_SECURITY = 'ai-security'
}

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
  source: NewsSource;
  applicationCategory: {
    primary: AIApplication;
    secondary?: AIApplication[];
  };
  publishedAt: Date;
  importance: number;
  points?: number;
  comments?: number;
}
