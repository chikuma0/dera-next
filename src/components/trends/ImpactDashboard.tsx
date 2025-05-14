'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/contexts/LanguageContext';

interface ImpactDashboardProps {
  impactData: any;
  impactError?: {message: string, code: string, details?: string | null} | null;
}

export function ImpactDashboard({ impactData, impactError }: ImpactDashboardProps) {
  const { translate } = useTranslation();
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  
  useEffect(() => {
    if (impactData?.topTechnologies?.length > 0 && !selectedTech) {
      setSelectedTech(impactData.topTechnologies[0].id.toString());
    }
  }, [impactData, selectedTech]);
  
  if (impactError) {
    return (
      <div className="p-8 text-center text-green-400 bg-black/40 border-4 border-green-400 rounded-lg">
        <div className="text-xl font-bold mb-4">Database Setup Required</div>
        <div className="mb-6">
          The impact analysis tables have not been set up in the database.
          Please run the migration script to create the necessary tables.
        </div>
        <div className="text-sm bg-black/60 p-4 rounded text-left">
          <div className="font-bold mb-2">Steps to fix:</div>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to the Supabase dashboard</li>
            <li>Navigate to the SQL Editor</li>
            <li>Run the migration script from: <code className="bg-green-900/30 px-2 py-1 rounded">supabase/migrations/005_impact_analysis.sql</code></li>
            <li>Restart the application</li>
          </ol>
        </div>
        <div className="mt-4 text-xs text-green-400/70 bg-black/60 p-2 rounded">
          <div>Error: {impactError.message}</div>
          <div className="mt-2 text-yellow-400/70 font-mono overflow-x-auto">
            The database tables for impact analysis need to be created. This is likely because the migration script
            <code className="bg-green-900/30 px-1 mx-1 rounded">005_impact_analysis.sql</code>
            has not been applied to the database.
          </div>
        </div>
      </div>
    );
  }
  
  if (!impactData) {
    return (
      <div className="p-8 text-center text-green-400">
        <div className="animate-pulse">Loading impact data...</div>
      </div>
    );
  }
  
  if (!impactData.topTechnologies || impactData.topTechnologies.length === 0) {
    return (
      <div className="p-8 text-center text-green-400 bg-black/40 border-4 border-green-400 rounded-lg">
        <div className="text-xl font-bold mb-4">No Impact Data Available</div>
        <div className="mb-6">
          No impact data was found in the database.
          Please run the impact analysis script to populate the data.
        </div>
        <div className="text-sm bg-black/60 p-4 rounded text-left">
          <div className="font-bold mb-2">Steps to fix:</div>
          <ol className="list-decimal list-inside space-y-2">
            <li>Make sure the database tables are created</li>
            <li>Run the impact analysis script: <code className="bg-green-900/30 px-2 py-1 rounded">npm run analyze-trends</code></li>
            <li>Refresh the page</li>
          </ol>
        </div>
      </div>
    );
  }
  
  // Prepare heatmap data
  const industries = Array.from(new Set(impactData.impactHeatmap.map((item: any) => item.industryName))) as string[];
  const technologies = Array.from(new Set(impactData.impactHeatmap.map((item: any) => item.technologyName))) as string[];
  
  const getImpactLevel = (tech: string, industry: string) => {
    const item = impactData.impactHeatmap.find(
      (i: any) => i.technologyName === tech && i.industryName === industry
    );
    return item ? item.impactLevel : 0;
  };
  
  const getImpactColor = (level: number) => {
    if (level >= 9) return 'bg-red-500/80';
    if (level >= 7) return 'bg-orange-500/80';
    if (level >= 5) return 'bg-yellow-500/80';
    if (level >= 3) return 'bg-green-500/80';
    return 'bg-blue-500/80';
  };
  
  return (
    <div className="bg-black/40 border-4 border-green-400 rounded-lg p-6 font-mono relative overflow-hidden retro-shadow">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <h2 className="text-green-400 text-3xl font-bold pixel-font relative z-10">
              AI IMPACT ANALYSIS
            </h2>
            <div className="absolute -inset-1 bg-green-400/10 blur-sm" />
          </div>
          <div className="text-yellow-400 text-sm mt-3 pixel-font">
            BUSINESS IMPACT OF EMERGING AI TECHNOLOGIES
          </div>
        </div>
        
        <Tabs defaultValue="heatmap" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="heatmap" className="text-green-400 data-[state=active]:bg-green-400/20">
              IMPACT HEATMAP
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-green-400 data-[state=active]:bg-green-400/20">
              KEY INSIGHTS
            </TabsTrigger>
            <TabsTrigger value="technologies" className="text-green-400 data-[state=active]:bg-green-400/20">
              TOP TECHNOLOGIES
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="heatmap" className="space-y-6">
            <div className="bg-black/60 border-2 border-green-400 rounded p-4">
              <h3 className="text-green-400 font-bold mb-4 pixel-font">INDUSTRY IMPACT HEATMAP</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="p-2 border-b border-green-400/30 text-left text-green-400">Industry / Technology</th>
                      {technologies.map((tech: string) => (
                        <th key={tech} className="p-2 border-b border-green-400/30 text-center text-green-400 text-xs">
                          {tech}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {industries.map((industry: string) => (
                      <tr key={industry}>
                        <td className="p-2 border-b border-green-400/30 text-green-300">{industry}</td>
                        {technologies.map((tech: string) => {
                          const impactLevel = getImpactLevel(tech, industry);
                          return (
                            <td key={`${industry}-${tech}`} className="p-2 border-b border-green-400/30 text-center">
                              {impactLevel > 0 ? (
                                <div 
                                  className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center ${getImpactColor(impactLevel)}`}
                                  title={`Impact Level: ${impactLevel}/10`}
                                >
                                  <span className="text-black font-bold text-xs">{impactLevel}</span>
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full mx-auto bg-gray-800/50"></div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500/80 mr-2"></div>
                  <span className="text-green-300 text-xs">High Impact (9-10)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500/80 mr-2"></div>
                  <span className="text-green-300 text-xs">Significant (7-8)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500/80 mr-2"></div>
                  <span className="text-green-300 text-xs">Moderate (5-6)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500/80 mr-2"></div>
                  <span className="text-green-300 text-xs">Emerging (3-4)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500/80 mr-2"></div>
                  <span className="text-green-300 text-xs">Low (1-2)</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6">
            <div className="bg-black/60 border-2 border-green-400 rounded p-4">
              <h3 className="text-green-400 font-bold mb-4 pixel-font">STRATEGIC INSIGHTS</h3>
              
              {impactData.latestInsights && impactData.latestInsights.length > 0 ? (
                <div className="space-y-6">
                  {impactData.latestInsights.map((insight: any) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-green-400/10 p-4 rounded-lg border-l-4 border-green-400"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {insight.insightType === 'disruption' && (
                            <div className="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center">
                              <span className="text-black text-lg">⚡</span>
                            </div>
                          )}
                          {insight.insightType === 'transformation' && (
                            <div className="w-8 h-8 bg-purple-500/80 rounded-full flex items-center justify-center">
                              <span className="text-black text-lg">🔄</span>
                            </div>
                          )}
                          {insight.insightType === 'opportunity' && (
                            <div className="w-8 h-8 bg-blue-500/80 rounded-full flex items-center justify-center">
                              <span className="text-black text-lg">💡</span>
                            </div>
                          )}
                          {insight.insightType === 'efficiency' && (
                            <div className="w-8 h-8 bg-green-500/80 rounded-full flex items-center justify-center">
                              <span className="text-black text-lg">⚙️</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <h4 className="text-green-300 font-bold mb-2">{insight.title}</h4>
                          <p className="text-green-300/80 text-sm">{insight.summary}</p>
                          
                          <div className="mt-3 flex items-center">
                            <span className="text-xs text-green-400/70 bg-black/40 px-2 py-1 rounded mr-2">
                              {insight.technologyName}
                            </span>
                            <span className="text-xs text-green-400/70">
                              {new Date(insight.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-green-400 p-8">
                  No insights available yet. Run the impact analysis to generate insights.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="technologies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {impactData.topTechnologies.map((tech: any) => (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-black/60 border-2 border-green-400 rounded p-4 hover:bg-black/80 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-green-400/50 animate-glow">
                        <span className="text-black text-xl font-bold">
                          {tech.maxImpact}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-green-400 font-bold mb-2">{tech.name}</h3>
                      <div className="text-green-300/70 text-sm mb-2">
                        {tech.maturityLevel === 'emerging' ? 'Emerging Technology' : 
                         tech.maturityLevel === 'growing' ? 'Growing Technology' : 'Established Technology'}
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-xs text-green-400/70 mb-1">Impact Strength</div>
                        <div className="w-full bg-green-900/30 rounded-full h-2.5">
                          <div 
                            className="bg-green-400 h-2.5 rounded-full" 
                            style={{ width: `${(tech.maxImpact / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}