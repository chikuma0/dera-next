import type { NewsItem, ContentPriority } from '@/types';

interface SourceWeight {
  baseWeight: number;
  priorities: Record<ContentPriority, number>;
}

const SOURCE_WEIGHTS: Record<string, SourceWeight> = {
  'Hacker News': {
    baseWeight: 0.9,
    priorities: {
      business: 1.0,
      industry: 0.9,
      implementation: 0.8,
      general: 0.7
    }
  },
  'TechCrunch': {
    baseWeight: 0.8,
    priorities: {
      business: 1.0,
      industry: 0.9,
      implementation: 0.7,
      general: 0.6
    }
  },
  'Techmeme': {
    baseWeight: 0.85,
    priorities: {
      business: 1.0,
      industry: 0.9,
      implementation: 0.7,
      general: 0.6
    }
  },
  'GitHub': {
    baseWeight: 0.75,
    priorities: {
      business: 0.9,
      industry: 1.0,
      implementation: 0.9,
      general: 0.7
    }
  },
  'The Verge': {
    baseWeight: 0.7,
    priorities: {
      business: 0.8,
      industry: 0.9,
      implementation: 0.7,
      general: 0.6
    }
  },
  'Product Hunt': {
    baseWeight: 0.75,
    priorities: {
      business: 0.9,
      industry: 1.0,
      implementation: 0.8,
      general: 0.7
    }
  },
  'Dev.to': {
    baseWeight: 0.7,
    priorities: {
      business: 0.8,
      industry: 0.8,
      implementation: 1.0,
      general: 0.7
    }
  }
};

export function calculateWeightedScore(item: NewsItem): number {
  const sourceWeight = SOURCE_WEIGHTS[item.source] || { baseWeight: 0.5, priorities: {} };
  const priorityWeight = sourceWeight.priorities[item.priority as ContentPriority] || 0.5;
  
  // Calculate base relevance score
  const text = `${item.title} ${item.summary || ''}`.toLowerCase();
  
  const aiScore = calculateKeywordScore(text, [
    'ai', 'artificial intelligence', 'machine learning', 
    'deep learning', 'neural', 'gpt', 'llm'
  ], 0.4);
  
  const businessScore = calculateKeywordScore(text, [
    'business', 'enterprise', 'startup', 'company',
    'industry', 'market', 'corporate'
  ], 0.3);
  
  const implementationScore = calculateKeywordScore(text, [
    'implementation', 'tutorial', 'guide', 'how to',
    'deploy', 'integrate', 'example'
  ], 0.3);
  
  // Apply source and priority weights
  const baseScore = Math.min(aiScore + businessScore + implementationScore, 1);
  return Math.min(baseScore * sourceWeight.baseWeight * priorityWeight, 1);
}

function calculateKeywordScore(text: string, keywords: string[], maxScore: number): number {
  return keywords.reduce((score, keyword) => 
    score + (text.includes(keyword) ? maxScore / keywords.length : 0), 0);
} 