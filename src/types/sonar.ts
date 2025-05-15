export interface SonarDigestTopic {
  title: string;
  summary: string;
  viralReason: string;
  valueReason: string;
  insights: string;
  details: string;
  citations: Array<{
    title: string;
    url: string;
    type: 'article' | 'x-post';
  }>;
} 