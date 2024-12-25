export interface BilingualText {
  en: string;
  ja?: string;
}

export enum NewsSource {
  HACKER_NEWS = 'hackernews',
  ARXIV = 'arxiv',
  TECH_CRUNCH = 'techcrunch',
  AIER = 'aier',
  AI_NOW = 'ainow',
}

export enum AICategory {
  GENERATIVE_AI = 'generative-ai',
  COMPUTER_VISION = 'computer-vision',
  NATURAL_LANGUAGE = 'natural-language',
  AUTOMATION = 'automation',
  AI_SECURITY = 'ai-security',
  AI_INFRASTRUCTURE = 'ai-infrastructure',
  INDUSTRY_SPECIFIC = 'industry-specific',
  AI_ETHICS = 'ai-ethics',
  AI_RESEARCH = 'ai-research',
  BUSINESS_AI = 'business-ai'
}

export interface NewsItem {
  id: string;
  title: BilingualText;
  summary: BilingualText;
  url: string;
  source: NewsSource;
  primaryCategory: AICategory;
  secondaryCategories?: AICategory[];
  publishedAt: Date;
  importance: number;
  engagement?: {
    points?: number;
    comments?: number;
  };
}
