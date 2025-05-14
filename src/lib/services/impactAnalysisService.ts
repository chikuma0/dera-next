// src/lib/services/impactAnalysisService.ts

import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../config/env';
import { NewsItem } from '@/types/news';
import { ArticleService } from './articleService';

export interface IndustryMention {
  industry: string;
  count: number;
  articles: string[]; // Article IDs
  confidence: number;
}

export interface UseCaseMention {
  useCase: string;
  count: number;
  articles: string[]; // Article IDs
  confidence: number;
}

export interface TechnologyImpact {
  technologyId: number;
  technologyName: string;
  industries: {
    id: number;
    name: string;
    impactLevel: number;
    timeHorizon: string;
    description: string;
    potentialOutcomes: string[];
  }[];
  useCases: {
    id: number;
    name: string;
    relevanceScore: number;
    maturityLevel: string;
    description: string;
  }[];
  insights: {
    id: number;
    title: string;
    summary: string;
    insightType: string;
  }[];
}

// Define types for Supabase responses
interface Technology {
  id: number;
  name: string;
  slug: string;
  maturity_level?: string;
}

interface Industry {
  id: number;
  name: string;
  slug: string;
}

interface BusinessUseCase {
  id: number;
  name: string;
  slug?: string;
}

interface TechnologyIndustryImpact {
  id: number;
  technology_id: number;
  industry_id: number;
  impact_level: number;
  time_horizon: string;
  description?: string;
  potential_outcomes?: string[];
  ai_technologies?: Technology;
  industries?: Industry;
}

interface TechnologyUseCase {
  id: number;
  technology_id: number;
  use_case_id: number;
  relevance_score: number;
  maturity_level?: string;
  description?: string;
  business_use_cases?: BusinessUseCase;
}

interface ImpactInsight {
  id: number;
  technology_id: number;
  title: string;
  summary: string;
  detailed_analysis?: string;
  source_articles?: string[];
  related_industries?: number[];
  related_use_cases?: number[];
  insight_type?: string;
  created_at?: string;
  ai_technologies?: Technology;
}

export class ImpactAnalysisService {
  private supabase;
  private articleService: ArticleService;
  
  // Industry keywords to track
  private industryKeywords = {
    'healthcare': ['healthcare', 'medical', 'hospital', 'patient', 'doctor', 'clinical', 'pharma', 'health'],
    'finance': ['finance', 'banking', 'investment', 'insurance', 'financial', 'bank', 'fintech', 'payment'],
    'manufacturing': ['manufacturing', 'factory', 'production', 'industrial', 'supply chain', 'assembly', 'fabrication'],
    'retail': ['retail', 'e-commerce', 'store', 'shopping', 'consumer', 'merchant', 'commerce'],
    'education': ['education', 'learning', 'school', 'university', 'student', 'academic', 'teaching'],
    'transportation': ['transportation', 'logistics', 'shipping', 'transit', 'mobility', 'vehicle', 'transport'],
    'energy': ['energy', 'power', 'utility', 'electricity', 'renewable', 'grid', 'solar', 'wind'],
    'technology': ['technology', 'software', 'hardware', 'IT', 'tech', 'digital', 'computing'],
    'media-entertainment': ['media', 'entertainment', 'content', 'streaming', 'publishing', 'gaming', 'broadcast'],
    'government': ['government', 'public sector', 'policy', 'regulation', 'compliance', 'civic', 'federal', 'state']
  };
  
  // Business use case keywords to track
  private useCaseKeywords = {
    'process-automation': ['automation', 'workflow', 'efficiency', 'streamline', 'process', 'automate'],
    'customer-experience': ['customer experience', 'cx', 'customer service', 'satisfaction', 'engagement', 'loyalty'],
    'decision-support': ['decision', 'insight', 'analytics', 'intelligence', 'recommendation', 'prediction'],
    'product-innovation': ['innovation', 'product development', 'r&d', 'design', 'prototype', 'invention'],
    'risk-management': ['risk', 'compliance', 'security', 'fraud', 'threat', 'protection', 'safety'],
    'cost-reduction': ['cost reduction', 'savings', 'efficiency', 'optimization', 'expense', 'budget'],
    'revenue-growth': ['revenue', 'growth', 'sales', 'market share', 'profit', 'monetization', 'upsell'],
    'talent-management': ['talent', 'hr', 'recruitment', 'hiring', 'workforce', 'employee', 'skill'],
    'supply-chain-optimization': ['supply chain', 'logistics', 'inventory', 'procurement', 'distribution', 'warehouse'],
    'sustainability': ['sustainability', 'esg', 'green', 'carbon', 'environmental', 'renewable', 'sustainable']
  };
  
  constructor() {
    const env = validateEnv();
    this.supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    this.articleService = new ArticleService();
  }
  
  // Detect industries mentioned in an article
  public detectIndustries(article: NewsItem): Map<string, number> {
    const text = `${article.title} ${article.summary || ''}`.toLowerCase();
    const industries = new Map<string, number>();
    
    for (const [industry, keywords] of Object.entries(this.industryKeywords)) {
      let score = 0;
      
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          // Higher score for mentions in title
          if (article.title.toLowerCase().includes(keyword.toLowerCase())) {
            score += 2;
          } else {
            score += 1;
          }
        }
      }
      
      if (score > 0) {
        industries.set(industry, score);
      }
    }
    
    return industries;
  }
  
  // Detect business use cases mentioned in an article
  public detectUseCases(article: NewsItem): Map<string, number> {
    const text = `${article.title} ${article.summary || ''}`.toLowerCase();
    const useCases = new Map<string, number>();
    
    for (const [useCase, keywords] of Object.entries(this.useCaseKeywords)) {
      let score = 0;
      
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          // Higher score for mentions in title
          if (article.title.toLowerCase().includes(keyword.toLowerCase())) {
            score += 2;
          } else {
            score += 1;
          }
        }
      }
      
      if (score > 0) {
        useCases.set(useCase, score);
      }
    }
    
    return useCases;
  }
  
  // Process articles to update industry and use case connections
  public async processArticlesForImpact(articles: NewsItem[]): Promise<void> {
    console.log(`Processing ${articles.length} articles for impact analysis`);
    
    for (const article of articles) {
      // Get technology mentions from the article
      const { data: techMentions, error: techError } = await this.supabase
        .from('news_item_technologies')
        .select('technology_id, relevance_score')
        .eq('news_item_id', article.id);
      
      if (techError || !techMentions || techMentions.length === 0) {
        continue; // No technology mentions, skip this article
      }
      
      // Detect industries and use cases
      const industries = this.detectIndustries(article);
      const useCases = this.detectUseCases(article);
      
      // Process industry mentions
      for (const [industrySlug, industryScore] of industries.entries()) {
        // Get industry ID
        const { data: industryData, error: industryError } = await this.supabase
          .from('industries')
          .select('id')
          .eq('slug', industrySlug)
          .single();
        
        if (industryError || !industryData) {
          console.error(`Error finding industry ${industrySlug}:`, industryError);
          continue;
        }
        
        const industryId = industryData.id;
        
        // Connect technologies to this industry
        for (const techMention of techMentions) {
          // Check if connection already exists
          const { data: existingImpact, error: impactError } = await this.supabase
            .from('technology_industry_impacts')
            .select('id, impact_level')
            .eq('technology_id', techMention.technology_id)
            .eq('industry_id', industryId)
            .single();
          
          if (impactError && impactError.code !== 'PGRST116') { // Not found is okay
            console.error(`Error checking technology-industry impact:`, impactError);
            continue;
          }
          
          // Calculate combined score
          const combinedScore = techMention.relevance_score * industryScore;
          
          if (!existingImpact) {
            // Create new impact record with default values
            const { error: createError } = await this.supabase
              .from('technology_industry_impacts')
              .insert({
                technology_id: techMention.technology_id,
                industry_id: industryId,
                impact_level: Math.min(10, Math.ceil(combinedScore * 2)), // Scale to 1-10
                time_horizon: 'medium-term', // Default
                description: `Impact detected through news analysis`,
                potential_outcomes: ['Potential outcome based on news analysis']
              });
            
            if (createError) {
              console.error(`Error creating technology-industry impact:`, createError);
            }
          } else {
            // Update existing impact record (only increase impact level if higher)
            const newImpactLevel = Math.min(10, Math.ceil(combinedScore * 2));
            if (newImpactLevel > existingImpact.impact_level) {
              const { error: updateError } = await this.supabase
                .from('technology_industry_impacts')
                .update({
                  impact_level: newImpactLevel
                })
                .eq('id', existingImpact.id);
              
              if (updateError) {
                console.error(`Error updating technology-industry impact:`, updateError);
              }
            }
          }
        }
      }
      
      // Process use case mentions
      for (const [useCaseSlug, useCaseScore] of useCases.entries()) {
        // Get use case ID
        const { data: useCaseData, error: useCaseError } = await this.supabase
          .from('business_use_cases')
          .select('id')
          .eq('slug', useCaseSlug)
          .single();
        
        if (useCaseError || !useCaseData) {
          console.error(`Error finding use case ${useCaseSlug}:`, useCaseError);
          continue;
        }
        
        const useCaseId = useCaseData.id;
        
        // Connect technologies to this use case
        for (const techMention of techMentions) {
          // Check if connection already exists
          const { data: existingUseCase, error: useCaseConnError } = await this.supabase
            .from('technology_use_cases')
            .select('id, relevance_score')
            .eq('technology_id', techMention.technology_id)
            .eq('use_case_id', useCaseId)
            .single();
          
          if (useCaseConnError && useCaseConnError.code !== 'PGRST116') { // Not found is okay
            console.error(`Error checking technology-use case connection:`, useCaseConnError);
            continue;
          }
          
          // Calculate combined score
          const combinedScore = techMention.relevance_score * useCaseScore / 10; // Scale to 0-1
          
          if (!existingUseCase) {
            // Create new use case connection
            const { error: createError } = await this.supabase
              .from('technology_use_cases')
              .insert({
                technology_id: techMention.technology_id,
                use_case_id: useCaseId,
                relevance_score: combinedScore,
                maturity_level: 'emerging', // Default
                description: `Use case detected through news analysis`
              });
            
            if (createError) {
              console.error(`Error creating technology-use case connection:`, createError);
            }
          } else {
            // Update existing use case connection (use exponential moving average)
            const newRelevanceScore = 0.7 * existingUseCase.relevance_score + 0.3 * combinedScore;
            const { error: updateError } = await this.supabase
              .from('technology_use_cases')
              .update({
                relevance_score: newRelevanceScore
              })
              .eq('id', existingUseCase.id);
            
            if (updateError) {
              console.error(`Error updating technology-use case connection:`, updateError);
            }
          }
        }
      }
    }
  }
  
  // Generate impact insights based on collected data
  public async generateImpactInsights(): Promise<void> {
    // Get technologies with significant industry impact
    const { data: significantImpacts, error: impactError } = await this.supabase
      .from('technology_industry_impacts')
      .select(`
        id,
        impact_level,
        technology_id,
        industry_id,
        ai_technologies(id, name, slug),
        industries(id, name, slug)
      `)
      .gte('impact_level', 8) // Only high impact
      .order('impact_level', { ascending: false });
    
    if (impactError || !significantImpacts) {
      console.error('Error fetching significant impacts:', impactError);
      return;
    }
    
    // Group by technology
    const techImpacts: Record<number, {
      techId: number,
      techName: string,
      impacts: TechnologyIndustryImpact[]
    }> = {};
    
    for (const impact of significantImpacts as unknown as TechnologyIndustryImpact[]) {
      const techId = impact.technology_id;
      if (!techImpacts[techId]) {
        techImpacts[techId] = {
          techId,
          techName: impact.ai_technologies ? impact.ai_technologies.name : 'Unknown Technology',
          impacts: []
        };
      }
      
      techImpacts[techId].impacts.push(impact);
    }
    
    // Generate insights for each technology with significant impact
    for (const [techId, techData] of Object.entries(techImpacts)) {
      // Skip if less than 2 significant impacts
      if (techData.impacts.length < 2) {
        continue;
      }
      
      // Get related articles for this technology
      const { data: techArticles, error: articlesError } = await this.supabase
        .from('news_item_technologies')
        .select(`
          news_item_id,
          relevance_score,
          news_items(id, title, url, published_date, importance_score)
        `)
        .eq('technology_id', techId)
        .order('relevance_score', { ascending: false })
        .limit(10);
      
      if (articlesError || !techArticles) {
        console.error(`Error fetching articles for technology ${techId}:`, articlesError);
        continue;
      }
      
      // Extract industry IDs and names
      const impactedIndustries = techData.impacts.map(impact => ({
        id: impact.industry_id,
        name: impact.industries ? impact.industries.name : 'Unknown Industry'
      }));
      
      // Get related use cases
      const { data: techUseCases, error: useCasesError } = await this.supabase
        .from('technology_use_cases')
        .select(`
          use_case_id,
          relevance_score,
          business_use_cases(id, name)
        `)
        .eq('technology_id', techId)
        .gte('relevance_score', 0.7) // Only highly relevant use cases
        .order('relevance_score', { ascending: false });
      
      if (useCasesError) {
        console.error(`Error fetching use cases for technology ${techId}:`, useCasesError);
        continue;
      }
      
      // Extract use case IDs
      const relatedUseCases = techUseCases ? (techUseCases as unknown as TechnologyUseCase[]).map(uc => ({
        id: uc.use_case_id,
        name: uc.business_use_cases ? uc.business_use_cases.name : 'Unknown Use Case'
      })) : [];
      
      // Generate insight title
      const insightTitle = `${techData.techName} Transforming ${impactedIndustries.slice(0, 3).map(i => i.name).join(', ')}`;
      
      // Generate insight summary
      const summary = `${techData.techName} is showing significant impact across ${impactedIndustries.length} industries, particularly in ${impactedIndustries.slice(0, 3).map(i => i.name).join(', ')}. This technology is enabling ${relatedUseCases.length > 0 ? relatedUseCases.slice(0, 3).map(uc => uc.name).join(', ') : 'various business applications'}.`;
      
      // Generate detailed analysis
      const detailedAnalysis = `
${techData.techName} is demonstrating transformative potential across multiple industries, with particularly strong impact in ${impactedIndustries.slice(0, 3).map(i => i.name).join(', ')}.

Key business applications include:
${relatedUseCases.slice(0, 5).map(uc => `- ${uc.name}`).join('\n')}

Organizations implementing ${techData.techName} are reporting significant improvements in operational efficiency, customer experience, and competitive advantage. The technology's ability to ${relatedUseCases[0]?.name.toLowerCase() || 'improve business processes'} is particularly valuable in today's rapidly evolving business landscape.

Based on current adoption trends, we expect ${techData.techName} to become a standard component of business technology stacks within the next 12-24 months, with early adopters already realizing substantial benefits.
      `.trim();
      
      // Determine insight type based on impact level and use cases
      let insightType = 'transformation';
      if (techData.impacts.some(i => i.impact_level >= 9)) {
        insightType = 'disruption';
      } else if (relatedUseCases.some(uc => uc.name.includes('Cost Reduction') || uc.name.includes('Efficiency'))) {
        insightType = 'efficiency';
      } else if (relatedUseCases.some(uc => uc.name.includes('Innovation') || uc.name.includes('Product'))) {
        insightType = 'opportunity';
      }
      
      // Create or update insight
      const { data: existingInsight, error: insightError } = await this.supabase
        .from('impact_insights')
        .select('id')
        .eq('technology_id', techId)
        .eq('title', insightTitle)
        .single();
      
      if (insightError && insightError.code !== 'PGRST116') { // Not found is okay
        console.error(`Error checking existing insight:`, insightError);
        continue;
      }
      
      const sourceArticles = techArticles.map(a => a.news_item_id);
      const industryIds = impactedIndustries.map(i => i.id);
      const useCaseIds = relatedUseCases.map(uc => uc.id);
      
      if (!existingInsight) {
        // Create new insight
        const { error: createError } = await this.supabase
          .from('impact_insights')
          .insert({
            technology_id: parseInt(techId),
            title: insightTitle,
            summary,
            detailed_analysis: detailedAnalysis,
            source_articles: sourceArticles,
            related_industries: industryIds,
            related_use_cases: useCaseIds,
            insight_type: insightType
          });
        
        if (createError) {
          console.error(`Error creating impact insight:`, createError);
        }
      } else {
        // Update existing insight
        const { error: updateError } = await this.supabase
          .from('impact_insights')
          .update({
            summary,
            detailed_analysis: detailedAnalysis,
            source_articles: sourceArticles,
            related_industries: industryIds,
            related_use_cases: useCaseIds,
            insight_type: insightType
          })
          .eq('id', existingInsight.id);
        
        if (updateError) {
          console.error(`Error updating impact insight:`, updateError);
        }
      }
    }
  }
  
  // Get impact data for a specific technology
  public async getTechnologyImpactData(technologyId: number): Promise<TechnologyImpact | null> {
    // Get technology details
    const { data: technology, error: techError } = await this.supabase
      .from('ai_technologies')
      .select('id, name, slug')
      .eq('id', technologyId)
      .single();
    
    if (techError) {
      console.error(`Error fetching technology ${technologyId}:`, techError);
      return null;
    }
    
    // Get industry impacts
    const { data: industryImpacts, error: impactsError } = await this.supabase
      .from('technology_industry_impacts')
      .select(`
        id,
        impact_level,
        time_horizon,
        description,
        potential_outcomes,
        industries(id, name, slug)
      `)
      .eq('technology_id', technologyId)
      .order('impact_level', { ascending: false });
    
    if (impactsError) {
      console.error(`Error fetching industry impacts for technology ${technologyId}:`, impactsError);
      return null;
    }
    
    // Get use cases
    const { data: useCases, error: useCasesError } = await this.supabase
      .from('technology_use_cases')
      .select(`
        id,
        relevance_score,
        maturity_level,
        description,
        business_use_cases(id, name, slug)
      `)
      .eq('technology_id', technologyId)
      .order('relevance_score', { ascending: false });
    
    if (useCasesError) {
      console.error(`Error fetching use cases for technology ${technologyId}:`, useCasesError);
      return null;
    }
    
    // Get insights
    const { data: insights, error: insightsError } = await this.supabase
      .from('impact_insights')
      .select(`
        id,
        title,
        summary,
        insight_type
      `)
      .eq('technology_id', technologyId);
    
    if (insightsError) {
      console.error(`Error fetching insights for technology ${technologyId}:`, insightsError);
      return null;
    }
    
    // Format the response
    return {
      technologyId: technology.id,
      technologyName: technology.name,
      industries: industryImpacts ? (industryImpacts as unknown as TechnologyIndustryImpact[]).map(impact => ({
        id: impact.industries ? impact.industries.id : 0,
        name: impact.industries ? impact.industries.name : 'Unknown',
        impactLevel: impact.impact_level,
        timeHorizon: impact.time_horizon,
        description: impact.description || '',
        potentialOutcomes: impact.potential_outcomes || []
      })) : [],
      useCases: useCases ? (useCases as unknown as TechnologyUseCase[]).map(useCase => ({
        id: useCase.business_use_cases ? useCase.business_use_cases.id : 0,
        name: useCase.business_use_cases ? useCase.business_use_cases.name : 'Unknown',
        relevanceScore: useCase.relevance_score,
        maturityLevel: useCase.maturity_level || 'emerging',
        description: useCase.description || ''
      })) : [],
      insights: insights ? (insights as ImpactInsight[]).map(insight => ({
        id: insight.id,
        title: insight.title,
        summary: insight.summary,
        insightType: insight.insight_type || 'transformation'
      })) : []
    };
  }
  
  // Get impact dashboard data
  public async getImpactDashboardData(): Promise<any> {
    // Get top technologies by impact
    const { data: topTechsByImpact, error: techError } = await this.supabase
      .from('technology_industry_impacts')
      .select(`
        technology_id,
        impact_level,
        ai_technologies!inner(id, name, slug, maturity_level)
      `)
      .order('impact_level', { ascending: false })
      .limit(50);
    
    if (techError) {
      console.error('Error fetching top technologies by impact:', techError);
      return null;
    }
    
    // Process to get unique technologies with highest impact
    const techImpacts: Record<number, {
      id: number,
      name: string,
      slug: string,
      maturityLevel: string,
      maxImpact: number
    }> = {};
    
    if (topTechsByImpact) {
      for (const impact of topTechsByImpact as unknown as TechnologyIndustryImpact[]) {
        const techId = impact.technology_id;
        if (!techImpacts[techId] || impact.impact_level > techImpacts[techId].maxImpact) {
          techImpacts[techId] = {
            id: techId,
            name: impact.ai_technologies ? impact.ai_technologies.name : 'Unknown',
            slug: impact.ai_technologies ? impact.ai_technologies.slug : '',
            maturityLevel: impact.ai_technologies ? impact.ai_technologies.maturity_level || 'emerging' : 'emerging',
            maxImpact: impact.impact_level
          };
        }
      }
    }
    
    // Convert to array and sort
    const topTechnologies = Object.values(techImpacts)
      .sort((a, b) => b.maxImpact - a.maxImpact)
      .slice(0, 10);
    
    // Get industry impact heatmap data
    const { data: heatmapData, error: heatmapError } = await this.supabase
      .from('technology_industry_impacts')
      .select(`
        technology_id,
        industry_id,
        impact_level,
        ai_technologies(name),
        industries(name)
      `)
      .in('technology_id', topTechnologies.map(t => t.id))
      .order('impact_level', { ascending: false });
    
    if (heatmapError) {
      console.error('Error fetching heatmap data:', heatmapError);
      return null;
    }
    
    // Get latest insights
    const { data: latestInsights, error: insightsError } = await this.supabase
      .from('impact_insights')
      .select(`
        id,
        technology_id,
        title,
        summary,
        insight_type,
        ai_technologies(name, slug),
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (insightsError) {
      console.error('Error fetching latest insights:', insightsError);
      return null;
    }
    
    // Format heatmap data
    const formattedHeatmap = heatmapData ? (heatmapData as unknown as TechnologyIndustryImpact[]).map(item => ({
      technologyId: item.technology_id,
      technologyName: item.ai_technologies ? item.ai_technologies.name : 'Unknown',
      industryId: item.industry_id,
      industryName: item.industries ? item.industries.name : 'Unknown',
      impactLevel: item.impact_level
    })) : [];
    
    // Format insights
    const formattedInsights = latestInsights ? (latestInsights as unknown as ImpactInsight[]).map(insight => ({
      id: insight.id,
      technologyId: insight.technology_id,
      technologyName: insight.ai_technologies ? insight.ai_technologies.name : 'Unknown',
      title: insight.title,
      summary: insight.summary,
      insightType: insight.insight_type,
      createdAt: insight.created_at
    })) : [];
    
    return {
      topTechnologies,
      impactHeatmap: formattedHeatmap,
      latestInsights: formattedInsights
    };
  }
}