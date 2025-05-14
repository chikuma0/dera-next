'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/contexts/LanguageContext';

interface BusinessIntelligenceHubProps {
  trendData: any;
  impactData: any;
  trendError?: {message: string, code: string, details?: string | null} | null;
  impactError?: {message: string, code: string, details?: string | null} | null;
}

export function BusinessIntelligenceHub({ 
  trendData, 
  impactData, 
  trendError, 
  impactError 
}: BusinessIntelligenceHubProps) {
  const { translate } = useTranslation();
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    industry: string;
    businessGoal: string;
  }>({
    industry: 'all',
    businessGoal: 'all'
  });
  
  // Effect to update data when user profile changes
  useEffect(() => {
    console.log('User profile updated:', userProfile);
    // This will trigger a re-render with the filtered data
  }, [userProfile]);
  
  // Initialize selected technology from trend data
  useEffect(() => {
    if (trendData?.technologies?.length > 0 && !selectedTech) {
      setSelectedTech(trendData.technologies[0].id.toString());
    }
  }, [trendData, selectedTech]);
  
  // Initialize selected industry from impact data
  useEffect(() => {
    if (impactData?.impactHeatmap) {
      const industries = Array.from(new Set(impactData.impactHeatmap.map((item: any) => item.industryName))) as string[];
      if (industries.length > 0 && !selectedIndustry) {
        setSelectedIndustry(industries[0]);
      }
    }
  }, [impactData, selectedIndustry]);
  
  // Handle errors
  if (trendError || impactError) {
    return (
      <div className="p-8 text-center text-green-400 bg-black/40 border-4 border-green-400 rounded-lg">
        <div className="text-xl font-bold mb-4">Database Setup Required</div>
        <div className="mb-6">
          {trendError ? 'The trend data tables have not been set up in the database.' : ''}
          {impactError ? 'The impact analysis tables have not been set up in the database.' : ''}
          Please run the migration script to create the necessary tables.
        </div>
        <div className="text-sm bg-black/60 p-4 rounded text-left">
          <div className="font-bold mb-2">Steps to fix:</div>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to the Supabase dashboard</li>
            <li>Navigate to the SQL Editor</li>
            <li>Run the migration scripts from: 
              {trendError ? <code className="bg-green-900/30 px-2 py-1 rounded ml-2">supabase/migrations/004_dera_pulse_enhancements.sql</code> : ''}
              {impactError ? <code className="bg-green-900/30 px-2 py-1 rounded ml-2">supabase/migrations/005_impact_analysis.sql</code> : ''}
            </li>
            <li>Restart the application</li>
          </ol>
        </div>
      </div>
    );
  }
  
  if (!trendData || !impactData) {
    return (
      <div className="p-8 text-center text-green-400">
        <div className="animate-pulse">Loading business intelligence data...</div>
      </div>
    );
  }
  
  // Prepare data for the components
  const selectedTechnology = trendData.technologies.find(
    (tech: any) => tech.id.toString() === selectedTech
  );
  
  // Prepare chart data for trend visualization
  const trendChartData = selectedTechnology?.technology_trend_points?.map((point: any) => ({
    date: new Date(point.date).toLocaleDateString(),
    mentions: point.mention_count,
    importance: point.importance_score,
    growth: point.growth_rate ? point.growth_rate * 100 : 0 // Convert to percentage
  })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Prepare industry data
  const industries = Array.from(new Set(impactData.impactHeatmap.map((item: any) => item.industryName))) as string[];
  const technologies = Array.from(new Set(impactData.impactHeatmap.map((item: any) => item.technologyName))) as string[];
  
  // Get impact level for heatmap
  const getImpactLevel = (tech: string, industry: string) => {
    const item = impactData.impactHeatmap.find(
      (i: any) => i.technologyName === tech && i.industryName === industry
    );
    return item ? item.impactLevel : 0;
  };
  
  // Get impact color based on level
  const getImpactColor = (level: number) => {
    if (level >= 9) return 'bg-red-500/80';
    if (level >= 7) return 'bg-orange-500/80';
    if (level >= 5) return 'bg-yellow-500/80';
    if (level >= 3) return 'bg-green-500/80';
    return 'bg-blue-500/80';
  };
  
  // Filter data based on user profile
  const filterDataByUserProfile = () => {
    // Filter technologies by industry if applicable
    let filteredTechs = [...trendData.technologies];
    let filteredImpactTechs = [...impactData.topTechnologies];
    let filteredInsights = [...impactData.latestInsights];
    
    if (userProfile.industry !== 'all') {
      // Filter technologies that have impact on the selected industry
      const techsWithIndustryImpact = impactData.impactHeatmap
        .filter((item: any) => item.industryName.toLowerCase() === userProfile.industry.toLowerCase())
        .map((item: any) => item.technologyName);
      
      // Filter trend technologies
      filteredTechs = filteredTechs.filter((tech: any) =>
        techsWithIndustryImpact.includes(tech.name));
      
      // Filter impact technologies
      filteredImpactTechs = filteredImpactTechs.filter((tech: any) =>
        techsWithIndustryImpact.includes(tech.name));
      
      // Filter insights
      filteredInsights = filteredInsights.filter((insight: any) =>
        insight.title.toLowerCase().includes(userProfile.industry.toLowerCase()) ||
        techsWithIndustryImpact.some((tech: string) =>
          insight.title.toLowerCase().includes(tech.toLowerCase())));
    }
    
    // Filter by business goal if applicable
    if (userProfile.businessGoal !== 'all') {
      // Further filter insights
      filteredInsights = filteredInsights.filter((insight: any) =>
        insight.summary.toLowerCase().includes(userProfile.businessGoal.toLowerCase()));
    }
    
    return {
      filteredTechs,
      filteredImpactTechs,
      filteredInsights
    };
  };
  
  const { filteredTechs, filteredImpactTechs, filteredInsights } = filterDataByUserProfile();
  
  // Generate strategic recommendations based on trends and impacts
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Get top technologies by impact
    const topTechsByImpact = [...filteredImpactTechs].sort((a, b) => b.maxImpact - a.maxImpact).slice(0, 3);
    
    // Get emerging technologies with high growth
    const emergingTechs = trendData.emergingTechnologies || [];
    
    // Add recommendations based on top impact technologies
    for (const tech of topTechsByImpact) {
      recommendations.push({
        title: `Implement ${tech.name} Solutions`,
        description: `${tech.name} shows high impact potential (${tech.maxImpact}/10) across multiple industries. Organizations should prioritize implementation to gain competitive advantage.`,
        timeframe: 'Short-term (3-6 months)',
        difficulty: 'Medium',
        roi: 'High',
        type: 'implementation'
      });
    }
    
    // Add recommendations based on emerging technologies
    for (const tech of emergingTechs.slice(0, 2)) {
      recommendations.push({
        title: `Research ${tech.ai_technologies.name} Applications`,
        description: `${tech.ai_technologies.name} is showing rapid growth (${(tech.avg_growth * 100).toFixed(0)}%). Begin research and pilot projects to prepare for future adoption.`,
        timeframe: 'Medium-term (6-12 months)',
        difficulty: 'High',
        roi: 'Medium',
        type: 'research'
      });
    }
    
    // Add general strategic recommendations
    recommendations.push({
      title: 'Develop AI Governance Framework',
      description: 'As AI adoption accelerates, organizations need robust governance frameworks to ensure ethical use, compliance, and risk management.',
      timeframe: 'Short-term (1-3 months)',
      difficulty: 'Medium',
      roi: 'Medium',
      type: 'governance'
    });
    
    recommendations.push({
      title: 'Build Cross-functional AI Team',
      description: 'Create a dedicated team combining technical expertise with domain knowledge to drive AI initiatives across the organization.',
      timeframe: 'Short-term (1-3 months)',
      difficulty: 'Medium',
      roi: 'High',
      type: 'organizational'
    });
    
    // Filter by business goal if applicable
    if (userProfile.businessGoal !== 'all') {
      return recommendations.filter(rec => 
        rec.description.toLowerCase().includes(userProfile.businessGoal.toLowerCase()));
    }
    
    return recommendations;
  };
  
  const strategicRecommendations = generateRecommendations();
  
  // Get implementation roadmap steps based on recommendation type
  const getImplementationSteps = (type: string) => {
    switch (type) {
      case 'implementation':
        return [
          'Assess current capabilities and gaps',
          'Identify specific use cases and success metrics',
          'Select technology partners and solutions',
          'Develop proof of concept',
          'Scale successful pilots to production'
        ];
      case 'research':
        return [
          'Form research team with domain experts',
          'Conduct technology assessment and benchmarking',
          'Identify potential use cases',
          'Develop small-scale prototype',
          'Create business case for further investment'
        ];
      case 'governance':
        return [
          'Establish AI ethics committee',
          'Develop AI principles and guidelines',
          'Create risk assessment framework',
          'Implement monitoring and compliance processes',
          'Regular review and refinement'
        ];
      case 'organizational':
        return [
          'Define team structure and roles',
          'Identify internal talent and skill gaps',
          'Develop recruitment and training plan',
          'Establish cross-functional workflows',
          'Create knowledge sharing mechanisms'
        ];
      default:
        return [
          'Assess current state',
          'Define target outcomes',
          'Develop implementation plan',
          'Execute and monitor progress',
          'Evaluate results and iterate'
        ];
    }
  };
  
  return (
    <div className="bg-black/40 border-4 border-green-400 rounded-lg p-6 font-mono relative overflow-hidden retro-shadow">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <h2 className="text-green-400 text-3xl font-bold pixel-font relative z-10">
              AI BUSINESS INTELLIGENCE HUB
            </h2>
            <div className="absolute -inset-1 bg-green-400/10 blur-sm" />
          </div>
          <div className="text-yellow-400 text-sm mt-3 pixel-font">
            TRANSFORM YOUR BUSINESS WITH AI INSIGHTS
          </div>
        </div>
        
        {/* User Profile Selection */}
        <div className="mb-8 bg-black/60 border-2 border-green-400 rounded p-4">
          <h3 className="text-green-400 font-bold mb-4 pixel-font">PERSONALIZE YOUR INSIGHTS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-green-400 text-sm mb-2">Industry Focus</label>
              <select 
                className="w-full bg-black border-2 border-green-400 rounded p-2 text-green-300"
                value={userProfile.industry}
                onChange={(e) => setUserProfile({...userProfile, industry: e.target.value})}
              >
                <option value="all">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Business Goal</label>
              <select 
                className="w-full bg-black border-2 border-green-400 rounded p-2 text-green-300"
                value={userProfile.businessGoal}
                onChange={(e) => setUserProfile({...userProfile, businessGoal: e.target.value})}
              >
                <option value="all">All Business Goals</option>
                <option value="efficiency">Operational Efficiency</option>
                <option value="innovation">Product Innovation</option>
                <option value="customer">Customer Experience</option>
                <option value="cost">Cost Reduction</option>
                <option value="revenue">Revenue Growth</option>
              </select>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="opportunities" className="text-green-400 data-[state=active]:bg-green-400/20">
              AI OPPORTUNITY RADAR
            </TabsTrigger>
            <TabsTrigger value="impact" className="text-green-400 data-[state=active]:bg-green-400/20">
              INDUSTRY IMPACT NAVIGATOR
            </TabsTrigger>
            <TabsTrigger value="action" className="text-green-400 data-[state=active]:bg-green-400/20">
              STRATEGIC ACTION CENTER
            </TabsTrigger>
          </TabsList>
          
          {/* AI OPPORTUNITY RADAR */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 bg-black/60 border-2 border-green-400 rounded p-4">
                <h3 className="text-green-400 font-bold mb-4 pixel-font">TECHNOLOGIES</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {filteredTechs.length > 0 ? (
                    filteredTechs.map((tech: any) => (
                      <div
                        key={tech.id}
                        className={`p-2 cursor-pointer rounded transition-colors ${
                          selectedTech === tech.id.toString()
                            ? 'bg-green-400/20 border-l-4 border-green-400'
                            : 'hover:bg-green-400/10'
                        }`}
                        onClick={() => setSelectedTech(tech.id.toString())}
                      >
                        <div className="font-bold text-green-300">{tech.name}</div>
                        <div className="text-xs text-green-400/70 flex justify-between">
                          <span>
                            {tech.maturity_level === 'emerging' && '🔥 EMERGING'}
                            {tech.maturity_level === 'growing' && '📈 GROWING'}
                            {tech.maturity_level === 'established' && '⭐ ESTABLISHED'}
                          </span>
                          
                          {/* Business value indicator */}
                          {impactData.topTechnologies.find((t: any) => t.name === tech.name) && (
                            <span className="text-yellow-400">
                              💼 HIGH VALUE
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-green-400/50 p-4">
                      No technologies match your filter criteria
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-3 bg-black/60 border-2 border-green-400 rounded p-4">
                <h3 className="text-green-400 font-bold mb-4 pixel-font">
                  {selectedTechnology?.name?.toUpperCase()} BUSINESS OPPORTUNITY
                </h3>
                
                {/* Business opportunity metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-black/40 border border-green-400/50 rounded p-3">
                    <div className="text-xs text-green-400/70 mb-1">Market Momentum</div>
                    <div className="text-2xl text-green-300 font-bold">
                      {trendChartData && trendChartData.length > 0 
                        ? `${(trendChartData[trendChartData.length-1]?.growth || 0).toFixed(0)}%`
                        : 'N/A'}
                    </div>
                    <div className="text-xs text-green-400/70 mt-1">
                      Growth trend over time
                    </div>
                  </div>
                  
                  <div className="bg-black/40 border border-green-400/50 rounded p-3">
                    <div className="text-xs text-green-400/70 mb-1">Business Impact</div>
                    <div className="text-2xl text-green-300 font-bold">
                      {filteredImpactTechs.find((t: any) => t.name === selectedTechnology?.name)?.maxImpact || 'N/A'}/10
                    </div>
                    <div className="text-xs text-green-400/70 mt-1">
                      Potential to transform business
                    </div>
                  </div>
                  
                  <div className="bg-black/40 border border-green-400/50 rounded p-3">
                    <div className="text-xs text-green-400/70 mb-1">Adoption Timeline</div>
                    <div className="text-2xl text-green-300 font-bold">
                      {selectedTechnology?.maturity_level === 'emerging' ? 'Long-term' : 
                       selectedTechnology?.maturity_level === 'growing' ? 'Mid-term' : 'Short-term'}
                    </div>
                    <div className="text-xs text-green-400/70 mt-1">
                      Estimated time to mainstream adoption
                    </div>
                  </div>
                </div>
                
                {trendChartData && trendChartData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f4d33" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#4ade80" 
                          tick={{ fill: '#4ade80' }}
                        />
                        <YAxis stroke="#4ade80" tick={{ fill: '#4ade80' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            border: '1px solid #4ade80',
                            color: '#4ade80'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="mentions" 
                          stroke="#4ade80" 
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                          name="Market Mentions"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="importance" 
                          stroke="#fbbf24" 
                          strokeWidth={2}
                          name="Strategic Importance"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="growth" 
                          stroke="#ec4899" 
                          strokeWidth={2}
                          name="Growth Rate (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-green-400/50">
                    No trend data available for this technology
                  </div>
                )}
                
                {/* Key business applications */}
                <div className="mt-6">
                  <h4 className="text-green-400 font-bold mb-3">KEY BUSINESS APPLICATIONS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredImpactTechs.find((t: any) => t.name === selectedTechnology?.name) ? (
                      <>
                        <div className="bg-green-400/10 p-3 rounded">
                          <div className="font-bold text-green-300">Process Automation</div>
                          <div className="text-sm text-green-300/70">
                            Streamline operations and reduce manual tasks
                          </div>
                        </div>
                        <div className="bg-green-400/10 p-3 rounded">
                          <div className="font-bold text-green-300">Customer Experience</div>
                          <div className="text-sm text-green-300/70">
                            Enhance interactions and personalization
                          </div>
                        </div>
                        <div className="bg-green-400/10 p-3 rounded">
                          <div className="font-bold text-green-300">Decision Support</div>
                          <div className="text-sm text-green-300/70">
                            Improve decision-making with data-driven insights
                          </div>
                        </div>
                        <div className="bg-green-400/10 p-3 rounded">
                          <div className="font-bold text-green-300">Product Innovation</div>
                          <div className="text-sm text-green-300/70">
                            Create new offerings and enhance existing products
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 text-center text-green-400/50 p-4">
                        No business applications data available for this technology
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* INDUSTRY IMPACT NAVIGATOR */}
          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 bg-black/60 border-2 border-green-400 rounded p-4">
                <h3 className="text-green-400 font-bold mb-4 pixel-font">INDUSTRIES</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {industries.map((industry: string) => (
                    <div
                      key={industry}
                      className={`p-2 cursor-pointer rounded transition-colors ${
                        selectedIndustry === industry
                          ? 'bg-green-400/20 border-l-4 border-green-400'
                          : 'hover:bg-green-400/10'
                      }`}
                      onClick={() => setSelectedIndustry(industry)}
                    >
                      <div className="font-bold text-green-300">{industry}</div>
                      <div className="text-xs text-green-400/70">
                        {technologies.filter(tech => getImpactLevel(tech, industry) >= 7).length} high-impact technologies
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-3 bg-black/60 border-2 border-green-400 rounded p-4">
                <h3 className="text-green-400 font-bold mb-4 pixel-font">
                  {selectedIndustry?.toUpperCase()} TRANSFORMATION OUTLOOK
                </h3>
                
                {/* Top technologies for selected industry */}
                <div className="mb-6">
                  <h4 className="text-green-400 font-bold mb-3">TOP IMPACT TECHNOLOGIES</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {technologies
                      .filter(tech => getImpactLevel(tech, selectedIndustry || '') > 0)
                      .sort((a, b) => 
                        getImpactLevel(b, selectedIndustry || '') - 
                        getImpactLevel(a, selectedIndustry || '')
                      )
                      .slice(0, 3)
                      .map((tech, index) => (
                        <div key={tech} className="bg-black/40 border border-green-400/50 rounded p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getImpactColor(getImpactLevel(tech, selectedIndustry || ''))}`}>
                              <span className="text-black font-bold">{index + 1}</span>
                            </div>
                            <div className="font-bold text-green-300">{tech}</div>
                          </div>
                          <div className="text-xs text-green-400/70 mb-1">Impact Level</div>
                          <div className="w-full bg-green-900/30 rounded-full h-2.5">
                            <div 
                              className={`${getImpactColor(getImpactLevel(tech, selectedIndustry || ''))} h-2.5 rounded-full`} 
                              style={{ width: `${(getImpactLevel(tech, selectedIndustry || '') / 10) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-right text-xs text-green-400/70 mt-1">
                            {getImpactLevel(tech, selectedIndustry || '')}/10
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                {/* Case studies */}
                <div className="mb-6">
                  <h4 className="text-green-400 font-bold mb-3">CASE STUDIES & SUCCESS STORIES</h4>
                  <div className="bg-green-400/10 p-4 rounded">
                    <div className="font-bold text-green-300 mb-2">
                      {selectedIndustry} Leader Achieves 40% Efficiency Gain with AI
                    </div>
                    <div className="text-sm text-green-300/70 mb-3">
                      A leading {selectedIndustry} organization implemented advanced AI solutions to streamline operations, 
                      resulting in 40% efficiency improvements and 25% cost reduction within 6 months.
                    </div>
                    <div className="text-xs text-green-400/70">
                      Key technologies: {technologies
                        .filter(tech => getImpactLevel(tech, selectedIndustry || '') >= 7)
                        .slice(0, 2)
                        .join(', ')}
                    </div>
                  </div>
                </div>
                
                {/* Competitive advantage metrics */}
                <div>
                  <h4 className="text-green-400 font-bold mb-3">COMPETITIVE ADVANTAGE METRICS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/40 border border-green-400/50 rounded p-3">
                      <div className="text-xs text-green-400/70 mb-1">Early Adopter Advantage</div>
                      <div className="text-2xl text-green-300 font-bold">
                        12-18 months
                      </div>
                      <div className="text-xs text-green-400/70 mt-1">
                        Competitive lead time for early technology adopters
                      </div>
                    </div>
                    
                    <div className="bg-black/40 border border-green-400/50 rounded p-3">
                      <div className="text-xs text-green-400/70 mb-1">ROI Potential</div>
                      <div className="text-2xl text-green-300 font-bold">
                        3.5x
                      </div>
                      <div className="text-xs text-green-400/70 mt-1">
                        Average return on AI investments in {selectedIndustry}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* STRATEGIC ACTION CENTER */}
          <TabsContent value="action" className="space-y-6">
            <div className="bg-black/60 border-2 border-green-400 rounded p-4">
              <h3 className="text-green-400 font-bold mb-4 pixel-font">STRATEGIC RECOMMENDATIONS</h3>
              
              <div className="space-y-6">
                {strategicRecommendations.length > 0 ? (
                  strategicRecommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-green-400/10 p-4 rounded-lg border-l-4 border-green-400"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 bg-green-500/80 rounded-full flex items-center justify-center">
                            <span className="text-black text-lg font-bold">{index + 1}</span>
                          </div>
                        </div>
                        
                        <div className="flex-grow">
                          <h4 className="text-green-300 font-bold mb-2">{recommendation.title}</h4>
                          <p className="text-green-300/80 text-sm mb-4">{recommendation.description}</p>
                          
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-black/40 rounded p-2">
                              <div className="text-xs text-green-400/70">Timeframe</div>
                              <div className="text-sm text-green-300">{recommendation.timeframe}</div>
                            </div>
                            <div className="bg-black/40 rounded p-2">
                              <div className="text-xs text-green-400/70">Difficulty</div>
                              <div className="text-sm text-green-300">{recommendation.difficulty}</div>
                            </div>
                            <div className="bg-black/40 rounded p-2">
                              <div className="text-xs text-green-400/70">ROI Potential</div>
                              <div className="text-sm text-green-300">{recommendation.roi}</div>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="text-xs text-green-400/70 mb-2">Implementation Roadmap</div>
                            <div className="space-y-2">
                              {getImplementationSteps(recommendation.type).map((step, stepIndex) => (
                                <div key={stepIndex} className="flex items-center gap-2">
                                  <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center text-green-400 text-xs">
                                    {stepIndex + 1}
                                  </div>
                                  <div className="text-sm text-green-300">{step}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-green-400/50 p-8">
                    No recommendations match your filter criteria
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/60 border-2 border-green-400 rounded p-4">
                <h3 className="text-green-400 font-bold mb-4 pixel-font">RESOURCE REQUIREMENTS</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-green-300 font-bold mb-2">Team Composition</div>
                    <div className="bg-black/40 p-3 rounded">
                      <ul className="space-y-2 text-sm text-green-300/80">
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          <span>AI/ML Engineers (2-3)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          <span>Data Scientists (1-2)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          <span>Business Analysts (1-2)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          <span>Project Manager (1)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          <span>Domain Experts (as needed)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-green-300 font-bold mb-2">Technology Stack</div>
                    <div className="bg-black/40 p-3 rounded">
                      <ul className="space-y-2 text-sm text-green-300/80">
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          <span>Cloud Infrastructure (AWS/Azure/GCP)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          <span>Data Processing Pipeline</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          <span>AI/ML Development Frameworks</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          <span>Integration APIs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">•</span>
                          <span>Monitoring & Analytics Tools</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/60 border-2 border-green-400 rounded p-4">
                <h3 className="text-green-400 font-bold mb-4 pixel-font">ROI CALCULATOR</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-3 rounded">
                      <div className="text-xs text-green-400/70 mb-1">Implementation Cost</div>
                      <div className="text-xl text-green-300 font-bold">$250K - $500K</div>
                      <div className="text-xs text-green-400/70 mt-1">Initial investment</div>
                    </div>
                    
                    <div className="bg-black/40 p-3 rounded">
                      <div className="text-xs text-green-400/70 mb-1">Annual Return</div>
                      <div className="text-xl text-green-300 font-bold">$750K - $1.5M</div>
                      <div className="text-xs text-green-400/70 mt-1">Estimated value</div>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 p-3 rounded">
                    <div className="text-xs text-green-400/70 mb-1">Payback Period</div>
                    <div className="text-xl text-green-300 font-bold">4-8 months</div>
                    <div className="text-xs text-green-400/70 mt-1">Time to recoup investment</div>
                  </div>
                  
                  <div className="bg-black/40 p-3 rounded">
                    <div className="text-xs text-green-400/70 mb-1">5-Year ROI</div>
                    <div className="text-xl text-green-300 font-bold">650% - 1200%</div>
                    <div className="text-xs text-green-400/70 mt-1">Long-term return potential</div>
                  </div>
                  
                  <div className="text-xs text-green-400/70 text-center mt-2">
                    * Estimates based on industry averages. Actual results may vary.
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}