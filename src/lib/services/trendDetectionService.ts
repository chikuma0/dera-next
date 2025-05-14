// src/lib/services/trendDetectionService.ts

import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '../config/env';
import { NewsItem } from '@/types/news';
import { ArticleService } from './articleService';

export interface TechnologyMention {
  technology: string;
  count: number;
  articles: string[]; // Article IDs
  averageImportance: number;
}

export interface TrendData {
  date: Date;
  technologies: TechnologyMention[];
  emergingTechnologies: string[];
  topTechnologies: string[];
}

export class TrendDetectionService {
  private supabase;
  private articleService: ArticleService;
  
  // Utility function to safely access nested properties
  private safeGet<T>(obj: any, path: string, defaultValue: T): T {
    try {
      const parts = path.split('.');
      let current = obj;
      
      for (const part of parts) {
        if (current === null || current === undefined) {
          return defaultValue;
        }
        current = current[part];
      }
      
      return (current === null || current === undefined) ? defaultValue : current as T;
    } catch (e) {
      return defaultValue;
    }
  }
  
  // Technology keywords to track
  private technologyKeywords = {
    'large language models': ['llm', 'gpt', 'large language model', 'language model'],
    'computer vision': ['computer vision', 'image recognition', 'object detection'],
    'reinforcement learning': ['reinforcement learning', 'rl', 'reinforcement learning from human feedback', 'rlhf'],
    'generative ai': ['generative ai', 'generative model', 'text-to-image', 'text to image', 'diffusion model'],
    'multimodal ai': ['multimodal', 'multi-modal', 'vision-language', 'audio-visual'],
    'ai agents': ['ai agent', 'autonomous agent', 'agentic ai', 'multi-agent'],
    'neural networks': ['neural network', 'deep learning', 'deep neural'],
    'transformer models': ['transformer', 'attention mechanism', 'self-attention'],
    'federated learning': ['federated learning', 'decentralized learning'],
    'explainable ai': ['explainable ai', 'xai', 'interpretable ai', 'ai transparency'],
    'edge ai': ['edge ai', 'on-device ai', 'edge computing', 'edge inference'],
    'ai ethics': ['ai ethics', 'responsible ai', 'ethical ai', 'ai bias', 'ai fairness'],
    'ai regulation': ['ai regulation', 'ai governance', 'ai policy', 'ai compliance'],
    'synthetic data': ['synthetic data', 'data generation', 'synthetic dataset'],
    'foundation models': ['foundation model', 'base model', 'pretrained model'],
    'prompt engineering': ['prompt engineering', 'prompt design', 'prompt tuning'],
    'fine-tuning': ['fine-tuning', 'fine tune', 'model adaptation'],
    'few-shot learning': ['few-shot', 'few shot', 'zero-shot', 'one-shot'],
    'ai hardware': ['ai chip', 'ai accelerator', 'neural processor', 'tpu', 'gpu'],
    'quantum ai': ['quantum ai', 'quantum machine learning', 'quantum neural'],
    'neuro-symbolic ai': ['neuro-symbolic', 'symbolic ai', 'hybrid ai'],
    'ai assistants': ['ai assistant', 'virtual assistant', 'conversational ai', 'chatbot'],
    'ai for science': ['ai for science', 'scientific ai', 'ai in research'],
    'ai for healthcare': ['healthcare ai', 'medical ai', 'clinical ai', 'biomedical ai'],
    'ai for climate': ['climate ai', 'environmental ai', 'sustainability ai'],
    'ai for code': ['code generation', 'code completion', 'programming assistant', 'copilot'],
    'ai security': ['ai security', 'model security', 'adversarial attack', 'model robustness'],
    'ai infrastructure': ['ai infrastructure', 'mlops', 'model deployment', 'model serving'],
    'ai optimization': ['model optimization', 'quantization', 'pruning', 'knowledge distillation'],
    'ai personalization': ['personalized ai', 'adaptive ai', 'user-specific ai']
  };
  
  // Getter for technology keywords
  public getTechnologyKeywords() {
    return this.technologyKeywords;
  }
  
  constructor() {
    const env = validateEnv();
    this.supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);
    this.articleService = new ArticleService();
  }
  
  // Detect technologies mentioned in an article
  public detectTechnologies(article: NewsItem): Map<string, number> {
    const text = `${article.title} ${article.summary || ''}`.toLowerCase();
    const technologies = new Map<string, number>();
    
    for (const [technology, keywords] of Object.entries(this.technologyKeywords)) {
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
        technologies.set(technology, score);
      }
    }
    
    return technologies;
  }
  
  // Process new articles to update technology trends
  public async processArticlesForTrends(articles: NewsItem[]): Promise<void> {
    console.log(`Processing ${articles.length} articles for trends`);
    
    for (const article of articles) {
      const technologies = this.detectTechnologies(article);
      
      for (const [technology, score] of technologies.entries()) {
        // Check if technology exists in database
        const { data: techData, error: techError } = await this.supabase
          .from('ai_technologies')
          .select('id')
          .eq('name', technology)
          .single();
        
        let technologyId: number;
        
        if (techError || !techData) {
          // Create new technology
          const { data: newTech, error: createError } = await this.supabase
            .from('ai_technologies')
            .insert({
              name: technology,
              slug: technology.toLowerCase().replace(/\s+/g, '-'),
              description: `Articles related to ${technology}`,
              maturity_level: 'emerging'
            })
            .select('id')
            .single();
          
          if (createError || !newTech) {
            console.error(`Error creating technology ${technology}:`, createError);
            continue;
          }
          
          technologyId = newTech.id;
        } else {
          technologyId = techData.id;
        }
        
        // Link article to technology
        const { error: linkError } = await this.supabase
          .from('news_item_technologies')
          .insert({
            news_item_id: article.id,
            technology_id: technologyId,
            relevance_score: score
          });
        
        if (linkError) {
          console.error(`Error linking article ${article.id} to technology ${technology}:`, linkError);
        }
        
        // Update trend data
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        
        // Check if we have a trend point for today
        const { data: trendPoint, error: trendError } = await this.supabase
          .from('technology_trend_points')
          .select('id, mention_count, importance_score')
          .eq('technology_id', technologyId)
          .gte('date', `${dateString}T00:00:00Z`)
          .lt('date', `${dateString}T23:59:59Z`)
          .single();
        
        if (trendError || !trendPoint) {
          // Create new trend point
          const { error: createTrendError } = await this.supabase
            .from('technology_trend_points')
            .insert({
              technology_id: technologyId,
              date: today,
              mention_count: 1,
              importance_score: article.importance_score || 0
            });
          
          if (createTrendError) {
            console.error(`Error creating trend point for ${technology}:`, createTrendError);
          }
        } else {
          // Update existing trend point
          const { error: updateTrendError } = await this.supabase
            .from('technology_trend_points')
            .update({
              mention_count: trendPoint.mention_count + 1,
              importance_score: (trendPoint.importance_score + (article.importance_score || 0)) / 2
            })
            .eq('id', trendPoint.id);
          
          if (updateTrendError) {
            console.error(`Error updating trend point for ${technology}:`, updateTrendError);
          }
        }
      }
    }
  }
  
  // Calculate growth rates for technologies
  public async calculateGrowthRates(): Promise<void> {
    // Get all technologies
    const { data: technologies, error: techError } = await this.supabase
      .from('ai_technologies')
      .select('id, name');
    
    if (techError || !technologies) {
      console.error('Error fetching technologies:', techError);
      return;
    }
    
    for (const tech of technologies) {
      // Get trend points for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: trendPoints, error: trendError } = await this.supabase
        .from('technology_trend_points')
        .select('id, date, mention_count')
        .eq('technology_id', tech.id)
        .gte('date', thirtyDaysAgo.toISOString())
        .order('date', { ascending: true });
      
      if (trendError || !trendPoints || trendPoints.length < 2) {
        continue; // Not enough data for growth calculation
      }
      
      // Calculate growth rate
      // Group by week for more stable calculations
      const weeklyData: Record<string, { count: number, points: typeof trendPoints }> = {};
      
      for (const point of trendPoints) {
        const date = new Date(point.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { count: 0, points: [] };
        }
        
        weeklyData[weekKey].count += point.mention_count;
        weeklyData[weekKey].points.push(point);
      }
      
      const weeks = Object.keys(weeklyData).sort();
      
      if (weeks.length < 2) {
        continue; // Not enough weekly data
      }
      
      // Calculate week-over-week growth
      const currentWeek = weeklyData[weeks[weeks.length - 1]];
      const previousWeek = weeklyData[weeks[weeks.length - 2]];
      
      if (previousWeek.count === 0) {
        continue; // Avoid division by zero
      }
      
      const growthRate = (currentWeek.count - previousWeek.count) / previousWeek.count;
      
      // Update growth rate for the most recent trend points
      for (const point of currentWeek.points) {
        const { error: updateError } = await this.supabase
          .from('technology_trend_points')
          .update({ growth_rate: growthRate })
          .eq('id', point.id);
        
        if (updateError) {
          console.error(`Error updating growth rate for trend point ${point.id}:`, updateError);
        }
      }
      
      // Update technology maturity level based on data
      let maturityLevel = 'emerging';
      
      if (weeks.length >= 4 && currentWeek.count > 10) {
        maturityLevel = 'growing';
      }
      
      if (weeks.length >= 8 && currentWeek.count > 20) {
        maturityLevel = 'established';
      }
      
      const { error: updateTechError } = await this.supabase
        .from('ai_technologies')
        .update({ maturity_level: maturityLevel })
        .eq('id', tech.id);
      
      if (updateTechError) {
        console.error(`Error updating maturity level for technology ${tech.id}:`, updateTechError);
      }
    }
  }
  
  // Generate weekly trend report
  public async generateWeeklyTrendReport(): Promise<void> {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // Get top technologies by mention count
    const { data: topTechs, error: topError } = await this.supabase
      .from('technology_trend_points')
      .select(`
        technology_id,
        mention_count,
        importance_score,
        ai_technologies!inner(id, name)
      `)
      .gte('date', weekStart.toISOString())
      .lte('date', weekEnd.toISOString())
      .order('mention_count', { ascending: false })
      .limit(50);
    
    // Process the data to get aggregated results
    const techMentions: Record<number, { id: number, name: string, mentions: number, importance: number, count: number }> = {};
    
    if (topTechs) {
      for (const point of topTechs) {
        const techId = point.technology_id;
        if (!techMentions[techId]) {
          techMentions[techId] = {
            id: techId,
            name: this.safeGet(point, 'ai_technologies.name', ''),
            mentions: 0,
            importance: 0,
            count: 0
          };
        }
        
        techMentions[techId].mentions += point.mention_count;
        techMentions[techId].importance += point.importance_score;
        techMentions[techId].count += 1;
      }
    }
    
    // Convert to array and sort
    const topTechnologies = Object.values(techMentions)
      .map(tech => ({
        technology_id: tech.id,
        total_mentions: tech.mentions,
        avg_importance: tech.importance / (tech.count || 1),
        ai_technologies: { name: tech.name }
      }))
      .sort((a, b) => b.total_mentions - a.total_mentions)
      .slice(0, 10);
    
    if (topError || !topTechs) {
      console.error('Error fetching top technologies:', topError);
      return;
    }
    
    // Get rising technologies by growth rate
    const { data: risingTechsRaw, error: risingError } = await this.supabase
      .from('technology_trend_points')
      .select(`
        technology_id,
        growth_rate,
        ai_technologies!inner(id, name)
      `)
      .gte('date', weekStart.toISOString())
      .lte('date', weekEnd.toISOString())
      .gt('growth_rate', 0)
      .order('growth_rate', { ascending: false })
      .limit(50);
    
    // Process the data to get aggregated results
    const techGrowth: Record<number, { id: number, name: string, growth: number, count: number }> = {};
    
    if (risingTechsRaw) {
      for (const point of risingTechsRaw) {
        const techId = point.technology_id;
        if (!techGrowth[techId]) {
          techGrowth[techId] = {
            id: techId,
            name: this.safeGet(point, 'ai_technologies.name', ''),
            growth: 0,
            count: 0
          };
        }
        
        techGrowth[techId].growth += point.growth_rate;
        techGrowth[techId].count += 1;
      }
    }
    
    // Convert to array and sort
    const risingTechs = Object.values(techGrowth)
      .map(tech => ({
        technology_id: tech.id,
        avg_growth: tech.growth / (tech.count || 1),
        ai_technologies: { name: tech.name }
      }))
      .sort((a, b) => b.avg_growth - a.avg_growth)
      .slice(0, 5);
    
    if (risingError || !risingTechs) {
      console.error('Error fetching rising technologies:', risingError);
      return;
    }
    
    // Get key developments (top articles by importance score)
    const { data: keyArticles, error: articlesError } = await this.supabase
      .from('news_items')
      .select('id, title, url, importance_score')
      .gte('published_date', weekStart.toISOString())
      .lte('published_date', weekEnd.toISOString())
      .order('importance_score', { ascending: false })
      .limit(5);
    
    if (articlesError || !keyArticles) {
      console.error('Error fetching key articles:', articlesError);
      return;
    }
    
    // Create trend report
    const topTechIds = topTechnologies.map(tech => tech.technology_id);
    const risingTechIds = risingTechs.map(tech => tech.technology_id);
    const keyDevelopments = keyArticles.map(article => article.title);
    
    const reportData = {
      topTechnologies: topTechnologies.map(tech => ({
        id: tech.technology_id,
        name: tech.ai_technologies.name,
        mentions: tech.total_mentions,
        importance: tech.avg_importance
      })),
      risingTechnologies: risingTechs.map(tech => ({
        id: tech.technology_id,
        name: tech.ai_technologies.name,
        growthRate: tech.avg_growth
      })),
      keyDevelopments: keyArticles.map(article => ({
        id: article.id,
        title: article.title,
        url: article.url,
        importance: article.importance_score
      }))
    };
    
    // Generate summary using key insights
    const summary = `
      This week in AI (${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}):
      
      Top technologies: ${topTechnologies.slice(0, 3).map(t => this.safeGet(t, 'ai_technologies.name', 'AI Technology')).join(', ')}
      
      Rising trends: ${risingTechs.slice(0, 3).map(t => this.safeGet(t, 'ai_technologies.name', 'AI Trend')).join(', ')}
      
      Key developments: ${keyDevelopments.slice(0, 3).join('; ')}
    `.trim();
    
    const { error: reportError } = await this.supabase
      .from('trend_reports')
      .insert({
        title: `AI Trend Report: Week of ${weekStart.toLocaleDateString()}`,
        summary,
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        top_technologies: topTechIds,
        rising_technologies: risingTechIds,
        key_developments: keyDevelopments,
        report_data: reportData,
        published: true
      });
    
    if (reportError) {
      console.error('Error creating trend report:', reportError);
    }
  }
  
  // Get trend data for a specific technology
  public async getTechnologyTrendData(technologyId: number): Promise<any> {
    const { data: technology, error: techError } = await this.supabase
      .from('ai_technologies')
      .select('*')
      .eq('id', technologyId)
      .single();
    
    if (techError) {
      console.error(`Error fetching technology ${technologyId}:`, techError);
      return null;
    }
    
    const { data: trendPoints, error: pointsError } = await this.supabase
      .from('technology_trend_points')
      .select('*')
      .eq('technology_id', technologyId)
      .order('date', { ascending: true });
    
    if (pointsError) {
      console.error(`Error fetching trend points for technology ${technologyId}:`, pointsError);
      return null;
    }
    
    const { data: relatedArticles, error: articlesError } = await this.supabase
      .from('news_item_technologies')
      .select(`
        relevance_score,
        news_items(id, title, url, published_date, importance_score)
      `)
      .eq('technology_id', technologyId)
      .order('relevance_score', { ascending: false })
      .limit(10);
    
    if (articlesError) {
      console.error(`Error fetching related articles for technology ${technologyId}:`, articlesError);
      return null;
    }
    
    return {
      technology,
      trendPoints,
      relatedArticles
    };
  }
  
  // Get overall trend dashboard data
  public async getTrendDashboardData(): Promise<any> {
    // Get top technologies
    const { data: topTechs, error: techError } = await this.supabase
      .from('ai_technologies')
      .select(`
        id,
        name,
        slug,
        maturity_level,
        technology_trend_points(
          date,
          mention_count,
          importance_score,
          growth_rate
        )
      `)
      .order('id', { ascending: true })
      .limit(10);
    
    if (techError) {
      console.error('Error fetching trend data:', techError);
      return null;
    }
    
    // Get latest trend report
    const { data: latestReport, error: reportError } = await this.supabase
      .from('trend_reports')
      .select('*')
      .eq('published', true)
      .order('week_end', { ascending: false })
      .limit(1)
      .single();
    
    if (reportError && reportError.code !== 'PGRST116') { // Not found is okay
      console.error('Error fetching latest report:', reportError);
    }
    
    // Get emerging technologies (highest growth rate)
    const { data: emergingTechsRaw, error: emergingError } = await this.supabase
      .from('technology_trend_points')
      .select(`
        technology_id,
        growth_rate,
        ai_technologies!inner(id, name, maturity_level)
      `)
      .eq('ai_technologies.maturity_level', 'emerging')
      .gt('growth_rate', 0)
      .order('growth_rate', { ascending: false })
      .limit(50);
    
    // Process the data to get aggregated results
    const emergingTechGrowth: Record<number, { id: number, name: string, maturityLevel: string, growth: number, count: number }> = {};
    
    if (emergingTechsRaw) {
      for (const point of emergingTechsRaw) {
        const techId = point.technology_id;
        if (!emergingTechGrowth[techId]) {
          emergingTechGrowth[techId] = {
            id: techId,
            name: this.safeGet(point, 'ai_technologies.name', ''),
            maturityLevel: this.safeGet(point, 'ai_technologies.maturity_level', 'emerging'),
            growth: 0,
            count: 0
          };
        }
        
        emergingTechGrowth[techId].growth += point.growth_rate;
        emergingTechGrowth[techId].count += 1;
      }
    }
    
    // Convert to array and sort
    const emergingTechs = Object.values(emergingTechGrowth)
      .map(tech => ({
        technology_id: tech.id,
        avg_growth: tech.growth / (tech.count || 1),
        ai_technologies: {
          name: tech.name,
          maturity_level: tech.maturityLevel
        }
      }))
      .sort((a, b) => b.avg_growth - a.avg_growth)
      .slice(0, 5);
    
    if (emergingError) {
      console.error('Error fetching emerging technologies:', emergingError);
    }
    
    return {
      technologies: topTechs || [],
      latestReport: latestReport || null,
      emergingTechnologies: emergingTechs || []
    };
  }
}