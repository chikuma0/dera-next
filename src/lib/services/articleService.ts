// src/lib/services/articleService.ts
export class ArticleService {
  private keywordWeights: Record<string, number> = {
    // Increase weights for innovation keywords
    'api': 12,
    'sdk': 12,
    'framework': 12,
    'library': 11,
    'tool': 11,
    'open source': 12,
    'developer': 11,
    'breakthrough': 12,
    'innovation': 12,
    'novel': 11,
    'new technique': 11,
    'implementation': 10,
    'solution': 10,
    'automation': 10,
    'no-code': 11,
    'low-code': 11,

    // Adjust technical impact weights
    'practical application': 9,
    'use case': 9,
    'real-world': 9,
    'deployment': 8,
    'production': 8,
    'scale': 8,
    'enterprise': 8,
    'integration': 8,

    // Keep core technology weights lower
    'artificial intelligence': 7,
    'machine learning': 7,
    'deep learning': 7,
    'neural network': 7,
    'large language model': 7,
    'llm': 7,
    'computer vision': 7,
    'robotics': 7,
    
    // Adjust Japanese keyword weights
    '革新': 12,
    '開発ツール': 12,
    'オープンソース': 12,
    '実装': 10,
    '活用事例': 9,
    '自動化': 10,
    '効率化': 9,
    '実用化': 10,
    '新技術': 11,
    'ツール': 11,
  };
  // ... rest of the class implementation
}