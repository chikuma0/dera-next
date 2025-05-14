import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Keyword weights for scoring
const keywordWeights: Record<string, number> = {
  // Headline-Worthy Business Impact Terms (150-170 points)
  'exclusive': 170,
  'breaking': 170,
  'just announced': 170,
  'just in': 165,
  'first look': 165,
  'world first': 165,
  'global launch': 160,
  'major announcement': 160,
  'industry first': 160,
  'official announcement': 155,
  'officially launches': 155,
  'officially announces': 155,
  'officially revealed': 155,
  'officially unveiled': 155,
  'just launched': 155,
  'just released': 155,
  'just unveiled': 155,
  'just revealed': 150,
  
  // High-Impact Business Terms (140-155 points)
  'partnership': 155,
  'acquisition': 155,
  'merger': 155,
  'deal': 150,
  'billion dollar': 155,
  'million dollar': 150,
  'funding': 150,
  'investment': 150,
  'revenue': 145,
  'profit': 145,
  'growth': 145,
  'market share': 145,
  'ceo': 145,
  'executive': 140,
  'leadership': 140,
  'strategy': 140,
  
  // High-Impact Breakthrough Terms (140-150 points)
  'breakthrough': 150,
  'revolutionary': 150,
  'game-changing': 150,
  'paradigm shift': 150,
  'historic': 145,
  'unprecedented': 145,
  'transformative': 145,
  'disrupting': 145,
  'major leap': 140,
  'quantum leap': 140,
  
  // Strong Innovation Terms (130-140 points)
  'innovation': 140,
  'groundbreaking': 140,
  'pioneering': 140,
  'milestone': 135,
  'cutting-edge': 135,
  'state-of-the-art': 135,
  'next-generation': 130,
  'advanced': 130,
  'novel': 130,
  'innovative': 130,
  'emerging': 130,
  
  // AI-Specific High Impact Terms (135-150 points)
  'new ai': 150,
  'ai breakthrough': 150,
  'ai revolution': 150,
  'ai transformation': 145,
  'claude 3': 160,
  'gpt-5': 160,
  'gpt-4o': 160,
  'gemini': 155,
  'llama 3': 155,
  'mistral': 150,
  'anthropic': 150,
  'openai': 150,
  'google ai': 150,
  'meta ai': 150,
  'microsoft ai': 150,
  'nvidia ai': 155,
  'ai chip': 145,
  'ai hardware': 145,
  'ai startup': 145,
  'ai research': 140,
  'ai safety': 140,
  'ai alignment': 140,
  'ai policy': 140,
};

// Breaking news indicators - higher impact
const breakingNewsKeywords = [
  'breaking',
  'just in',
  'exclusive',
  'urgent',
  'alert',
  'developing',
  'announcement',
  'launches',
  'releases',
  'unveils',
  'introduces',
  'reveals',
  'debuts',
  'just announced',
  'breaking news',
  'first look',
  'first to market',
  'world premiere',
  'global launch',
  'major announcement',
  'official announcement',
  'officially launches',
  'officially announces',
  'officially revealed',
  'officially unveiled',
];

// Impact and dynamics indicators
const impactKeywords = [
  'impact',
  'transform',
  'disrupt',
  'revolutionize',
  'change',
  'improve',
  'enhance',
  'accelerate',
  'boost',
  'advance',
  'progress',
  'growth',
  'expansion',
  'scale',
  'adoption',
  'implementation',
  'deployment',
  'integration',
  'market share',
  'market growth',
  'market dominance',
  'market leader',
  'industry leader',
  'competitive advantage',
  'business impact',
  'economic impact',
  'industry impact',
  'global impact',
  'commercial success',
  'commercial potential',
  'commercial viability',
  'commercial application',
];

function calculateTimeDecay(publishedDate: Date): number {
  const now = new Date();
  const diffDays = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // Enhanced time decay to prioritize fresh news even more
  if (diffDays < 0.125) return 1.5;   // Very breaking news (last 3 hours)
  if (diffDays < 0.25) return 1.4;    // Breaking news (last 6 hours)
  if (diffDays < 0.5) return 1.35;    // Very fresh (last 12 hours)
  if (diffDays < 1) return 1.3;       // Fresh (last 24 hours)
  if (diffDays < 2) return 1.2;       // Recent (48 hours)
  if (diffDays < 3) return 1.1;       // Very recent (72 hours)
  if (diffDays < 4) return 1.0;       // This week
  if (diffDays < 7) return 0.8;       // Last week
  if (diffDays < 10) return 0.6;      // More than a week
  if (diffDays < 14) return 0.4;      // Two weeks
  if (diffDays < 21) return 0.2;      // Three weeks
  return 0.1;                         // Older
}

function calculateImpactBonus(text: string): number {
  const normalizedText = text.toLowerCase();
  let impactCount = 0;
  
  // Count impact keywords
  for (const keyword of impactKeywords) {
    if (normalizedText.includes(keyword)) {
      impactCount++;
    }
  }
  
  // Count breaking news indicators
  let breakingCount = 0;
  for (const keyword of breakingNewsKeywords) {
    if (normalizedText.includes(keyword)) {
      breakingCount++;
    }
  }
  
  // Calculate bonus (up to 35%)
  const impactBonus = Math.min(impactCount * 2.5, 20);
  const breakingBonus = Math.min(breakingCount * 7.5, 35);
  
  return (impactBonus + breakingBonus) / 100;
}

function calculateHeadlineWorthiness(title: string, summary: string): number {
  const normalizedTitle = title.toLowerCase();
  const normalizedSummary = summary.toLowerCase();
  const fullText = `${normalizedTitle} ${normalizedSummary}`;
  
  // Check for headline-worthy patterns
  const headlinePatterns = [
    // Major company announcements
    /\b(google|microsoft|apple|amazon|meta|openai|anthropic|nvidia|tesla|ibm)\b.{0,30}\b(announce|launch|unveil|reveal|introduce|release)\b/i,
    // Major partnerships
    /\b(partner|partnership|collaboration|alliance)\b.{0,30}\b(with|between)\b/i,
    // Major acquisitions
    /\b(acquire|acquisition|buy|purchase|takeover)\b.{0,30}\b(for|worth|valued at)\b.{0,15}\b(\$|usd|million|billion)\b/i,
    // Major funding
    /\b(raise|secure|close)\b.{0,30}\b(funding|investment|capital|round)\b.{0,15}\b(\$|usd|million|billion)\b/i,
    // Major product launches
    /\b(launch|unveil|introduce|debut)\b.{0,30}\b(new|next-gen|revolutionary|groundbreaking)\b/i,
    // Major industry shifts
    /\b(transform|revolutionize|disrupt|change)\b.{0,30}\b(industry|market|sector|landscape)\b/i,
    // Exclusive or breaking news
    /\b(exclusive|breaking|first look|just in)\b/i,
  ];
  
  let headlineScore = 0;
  for (const pattern of headlinePatterns) {
    if (pattern.test(fullText)) {
      headlineScore += 25;
    }
  }
  
  // Cap at 50%
  return Math.min(headlineScore, 50) / 100;
}

function calculateKeywordScore(text: string): number {
  const normalizeText = (text: string) => {
    let normalized = text.toLowerCase();
    normalized = normalized.replace(/([^\x01-\x7E])\s+([^\x01-\x7E])/g, '$1$2');
    normalized = normalized.replace(/[-\s]+/g, ' ');
    normalized = normalized
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      .replace(/ー/g, '')
      .replace(/[・]/g, '')
      .replace(/AI/gi, 'ai')
      .replace(/[〜～]/g, '')
      .replace(/[\(\)（）「」]/g, '');
    return normalized;
  };

  const normalizedText = normalizeText(text);
  const matchedWeights: number[] = [];
  let matchedPhrases = new Set<string>();

  // Match phrases first
  for (const [phrase, weight] of Object.entries(keywordWeights)) {
    const normalizedPhrase = normalizeText(phrase);
    
    if (phrase.includes(' ')) {
      const matches =
        normalizedText.includes(normalizedPhrase) ||
        normalizedText.includes(normalizedPhrase.replace(/s$/, '')) ||
        normalizedText.includes(normalizedPhrase + 's');
      
      if (matches) {
        matchedWeights.push(weight);
        phrase.split(' ').forEach(word => matchedPhrases.add(normalizeText(word)));
      }
    }
  }

  // Then match single words
  for (const [word, weight] of Object.entries(keywordWeights)) {
    if (!word.includes(' ')) {
      const normalizedWord = normalizeText(word);
      if (!matchedPhrases.has(normalizedWord) && normalizedText.includes(normalizedWord)) {
        matchedWeights.push(weight);
      }
    }
  }

  // Calculate score
  if (matchedWeights.length === 0) {
    return 0;
  } else if (matchedWeights.length === 1) {
    return Math.max(matchedWeights[0], 70); // Increased base score
  } else {
    // Sort weights in descending order
    matchedWeights.sort((a, b) => b - a);
    
    // Calculate weighted average with enhanced weighting for top matches
    const topScore = matchedWeights[0];
    const secondScore = matchedWeights[1];
    const remainingScores = matchedWeights.slice(2);
    
    // Increased weight for top score (75% instead of 70%)
    let totalScore = topScore * 0.75 + secondScore * 0.15;
    
    // Add bonus for additional matches with diminishing returns
    if (remainingScores.length > 0) {
      const bonusScore = remainingScores.reduce((acc, score, index) => {
        return acc + (score * (0.1 / Math.pow(1.8, index))); // Less diminishing returns
      }, 0);
      totalScore += bonusScore;
    }
    
    // Increased cap for exceptional articles
    return Math.min(Math.max(totalScore, 80), 150);
  }
}

function calculateArticleScore(article: any): {
  total: number;
  breakdown: {
    keywordScore: number;
    timeDecay: number;
    impactBonus: number;
    headlineWorthiness?: number;
    titleScore?: number;
    summaryScore?: number;
    sourceBonus?: number;
  };
} {
  const title = article.title?.trim() || '';
  const summary = article.summary?.trim() || '';
  const source = article.source_name?.trim() || '';
  
  const titleScore = calculateKeywordScore(title);
  const summaryScore = calculateKeywordScore(summary);
  
  // Increased weight for title (80% instead of 75%)
  const keywordScore = Math.round((titleScore * 0.8) + (summaryScore * 0.2));
  const timeDecay = calculateTimeDecay(new Date(article.published_date));
  
  // Calculate impact bonus
  const titleImpactBonus = calculateImpactBonus(title);
  const summaryImpactBonus = calculateImpactBonus(summary);
  const impactBonus = Math.max(titleImpactBonus, summaryImpactBonus);
  
  // Calculate headline worthiness
  const headlineWorthiness = calculateHeadlineWorthiness(title, summary);
  
  // Calculate source bonus - prioritize certain sources
  let sourceBonus = 0;
  const highQualitySources = [
    'Hacker News', 'ArXiv', 'Reddit r/MachineLearning', 'Reddit r/artificial',
    'TechCrunch', 'VentureBeat', 'MIT Technology Review', 'Wired'
  ];
  
  if (highQualitySources.some(s => source.includes(s))) {
    sourceBonus = 0.15; // 15% bonus for high-quality sources
  }
  
  // Apply all bonuses to the final score
  // Formula: base score * time decay * (1 + impact bonus + headline worthiness + source bonus)
  const total = Math.round(keywordScore * timeDecay * (1 + impactBonus + headlineWorthiness + sourceBonus));
  
  // Boost very high scores even more to create clear headline separation
  let finalScore = total;
  if (total > 160) {
    finalScore = Math.round(total * 1.25); // 25% boost for exceptional articles
  } else if (total > 140) {
    finalScore = Math.round(total * 1.15); // 15% boost for very good articles
  }
  
  // Ensure minimum score for alternative sources to give them a chance
  if (source.includes('Hacker News') || source.includes('Reddit') || source.includes('ArXiv')) {
    finalScore = Math.max(finalScore, 120);
  }

  return {
    total: finalScore,
    breakdown: {
      keywordScore,
      timeDecay,
      impactBonus,
      headlineWorthiness,
      titleScore,
      summaryScore,
      sourceBonus
    }
  };
}

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all articles
    const { data: articles, error: fetchError } = await supabase
      .from('news_items')
      .select('*');

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch articles', details: fetchError },
        { status: 500 }
      );
    }

    // Update scores in batches
    const batchSize = 50;
    let updatedCount = 0;
    let errorCount = 0;
    let scoreDetails: any[] = [];

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      
      for (const article of batch) {
        const score = calculateArticleScore(article);
        scoreDetails.push({
          title: article.title,
          source: article.source_name,
          breakdown: score.breakdown,
          finalScore: score.total
        });
        
        // Update score using direct SQL query
        const { error: updateError } = await supabase
          .from('news_items')
          .update({ importance_score: Math.round(score.total) })
          .eq('id', article.id);

        if (updateError) {
          console.error('Error updating article:', updateError);
          errorCount++;
        } else {
          updatedCount++;
        }
      }
    }

    // Sort score details by final score
    scoreDetails.sort((a, b) => b.finalScore - a.finalScore);

    return NextResponse.json({
      message: 'Scores updated successfully',
      totalArticles: articles.length,
      updatedCount,
      errorCount,
      scoreDetails: scoreDetails.slice(0, 10)
    });
  } catch (error) {
    console.error('Error updating scores:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}