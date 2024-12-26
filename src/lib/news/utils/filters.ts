export interface FilterOptions {
  smbFocus?: boolean;
  aiOnly?: boolean;
  minRelevanceScore?: number;
}

const SMB_KEYWORDS = [
  'small business',
  'smb',
  'startup',
  'entrepreneur',
  'freelancer',
  'self-employed',
  'small team',
  'small company',
  'local business',
  'independent business'
];

const AI_KEYWORDS = [
  'ai',
  'artificial intelligence',
  'machine learning',
  'ml',
  'llm',
  'gpt',
  'neural',
  'deep learning',
  'generative ai',
  'ai tool'
];

export function filterNewsItems(items: NewsItem[], options: FilterOptions = {}): NewsItem[] {
  return items.filter(item => {
    const text = `${item.title} ${item.summary || ''}`.toLowerCase();
    
    // Apply SMB filter
    if (options.smbFocus) {
      const hasSmbKeywords = SMB_KEYWORDS.some(keyword => text.includes(keyword));
      const isBusinessCategory = item.contentCategory?.includes('business-ops');
      if (!hasSmbKeywords && !isBusinessCategory) return false;
    }

    // Apply AI filter
    if (options.aiOnly) {
      const hasAiKeywords = AI_KEYWORDS.some(keyword => text.includes(keyword));
      const isAiToolCategory = item.contentCategory?.includes('ai-tools');
      if (!hasAiKeywords && !isAiToolCategory) return false;
    }

    // Apply relevance score filter
    if (options.minRelevanceScore !== undefined) {
      if (!item.relevanceScore || item.relevanceScore < options.minRelevanceScore) {
        return false;
      }
    }

    return true;
  });
}

export function calculateSMBRelevance(text: string): number {
  let score = 0;
  const lowerText = text.toLowerCase();

  // Check for SMB-specific keywords (up to 0.6)
  const smbMatches = SMB_KEYWORDS.filter(keyword => lowerText.includes(keyword));
  score += (smbMatches.length / SMB_KEYWORDS.length) * 0.6;

  // Check for business value indicators (up to 0.4)
  const valueKeywords = [
    'cost-effective',
    'affordable',
    'efficient',
    'easy to use',
    'simple',
    'quick',
    'save time',
    'save money',
    'productivity'
  ];
  
  const valueMatches = valueKeywords.filter(keyword => lowerText.includes(keyword));
  score += (valueMatches.length / valueKeywords.length) * 0.4;

  return Math.min(score, 1);
} 