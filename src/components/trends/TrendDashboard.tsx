'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/contexts/LanguageContext';
import { SocialTrendInsights } from './SocialTrendInsights';
import { Tweet } from '@/types/twitter';

interface TrendDashboardProps {
  trendData: any;
  trendError?: {message: string, code: string, details?: string | null} | null;
  socialData?: {
    tweets: Tweet[];
    hashtags: {
      hashtag: string;
      tweetCount: number;
      totalLikes: number;
      totalRetweets: number;
      impactScore: number;
    }[];
  };
}

export function TrendDashboard({ trendData, trendError, socialData }: TrendDashboardProps) {
  const { translate } = useTranslation();
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  
  useEffect(() => {
    if (trendData?.technologies?.length > 0 && !selectedTech) {
      setSelectedTech(trendData.technologies[0].id.toString());
    }
  }, [trendData, selectedTech]);
  
  if (trendError) {
    return (
      <div className="p-8 text-center text-green-400 bg-black/40 border-4 border-green-400 rounded-lg">
        <div className="text-xl font-bold mb-4">Database Setup Required</div>
        <div className="mb-6">
          The trend data tables have not been set up in the database.
          Please run the migration script to create the necessary tables.
        </div>
        <div className="text-sm bg-black/60 p-4 rounded text-left">
          <div className="font-bold mb-2">Steps to fix:</div>
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to the Supabase dashboard</li>
            <li>Navigate to the SQL Editor</li>
            <li>Run the migration script from: <code className="bg-green-900/30 px-2 py-1 rounded">supabase/migrations/004_dera_pulse_enhancements.sql</code></li>
            <li>Restart the application</li>
          </ol>
        </div>
        <div className="mt-4 text-xs text-green-400/70 bg-black/60 p-2 rounded">
          <div>Error: {trendError.message}</div>
          <div className="mt-2 text-yellow-400/70 font-mono overflow-x-auto">
            The database tables for AI trend tracking need to be created. This is likely because the migration script
            <code className="bg-green-900/30 px-1 mx-1 rounded">004_dera_pulse_enhancements.sql</code>
            has not been applied to the database.
          </div>
        </div>
      </div>
    );
  }
  
  if (!trendData) {
    return (
      <div className="p-8 text-center text-green-400">
        <div className="animate-pulse">Loading trend data...</div>
      </div>
    );
  }
  
  if (!trendData.technologies) {
    return (
      <div className="p-8 text-center text-green-400 bg-black/40 border-4 border-green-400 rounded-lg">
        <div className="text-xl font-bold mb-4">No Technology Data Available</div>
        <div className="mb-6">
          No technology data was found in the database.
          Please run the trend analysis script to populate the data.
        </div>
        <div className="text-sm bg-black/60 p-4 rounded text-left">
          <div className="font-bold mb-2">Steps to fix:</div>
          <ol className="list-decimal list-inside space-y-2">
            <li>Make sure the database tables are created</li>
            <li>Run the trend analysis script: <code className="bg-green-900/30 px-2 py-1 rounded">npm run analyze-trends</code></li>
            <li>Refresh the page</li>
          </ol>
        </div>
      </div>
    );
  }
  
  const selectedTechnology = trendData.technologies.find(
    (tech: any) => tech.id.toString() === selectedTech
  );
  
  // Prepare chart data
  const chartData = selectedTechnology?.technology_trend_points?.map((point: any) => ({
    date: new Date(point.date).toLocaleDateString(),
    mentions: point.mention_count,
    importance: point.importance_score,
    growth: point.growth_rate ? point.growth_rate * 100 : 0 // Convert to percentage
  })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return (
    <div className="bg-black/40 border-4 border-green-400 rounded-lg p-6 font-mono relative overflow-hidden retro-shadow">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <h2 className="text-green-400 text-3xl font-bold pixel-font relative z-10">
              AI TREND RADAR
            </h2>
            <div className="absolute -inset-1 bg-green-400/10 blur-sm" />
          </div>
          <div className="text-yellow-400 text-sm mt-3 pixel-font">
            TRACKING THE FUTURE OF AI
          </div>
        </div>
        
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="trends" className="text-green-400 data-[state=active]:bg-green-400/20">
              TREND ANALYSIS
            </TabsTrigger>
            <TabsTrigger value="technologies" className="text-green-400 data-[state=active]:bg-green-400/20">
              TOP TECHNOLOGIES
            </TabsTrigger>
            <TabsTrigger value="social" className="text-green-400 data-[state=active]:bg-green-400/20">
              SOCIAL PULSE
            </TabsTrigger>
            <TabsTrigger value="report" className="text-green-400 data-[state=active]:bg-green-400/20">
              WEEKLY REPORT
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 bg-black/60 border-2 border-green-400 rounded p-4">
                <h3 className="text-green-400 font-bold mb-4 pixel-font">TECHNOLOGIES</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {trendData.technologies.map((tech: any) => (
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
                      <div className="text-xs text-green-400/70">
                        {tech.maturity_level === 'emerging' && '🔥 EMERGING'}
                        {tech.maturity_level === 'growing' && '📈 GROWING'}
                        {tech.maturity_level === 'established' && '⭐ ESTABLISHED'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-3 bg-black/60 border-2 border-green-400 rounded p-4">
                <h3 className="text-green-400 font-bold mb-4 pixel-font">
                  {selectedTechnology?.name?.toUpperCase()} TREND DATA
                </h3>
                
                {chartData && chartData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
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
                        />
                        <Line 
                          type="monotone" 
                          dataKey="importance" 
                          stroke="#fbbf24" 
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="growth" 
                          stroke="#ec4899" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-green-400/50">
                    No trend data available for this technology
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="technologies">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trendData.technologies.map((tech: any) => (
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
                          {tech.maturity_level === 'emerging' ? '🔥' : tech.maturity_level === 'growing' ? '📈' : '⭐'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-green-400 font-bold mb-2">{tech.name}</h3>
                      <div className="text-green-300/70 text-sm mb-2">
                        {tech.maturity_level === 'emerging' ? 'Emerging Technology' :
                         tech.maturity_level === 'growing' ? 'Growing Technology' : 'Established Technology'}
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-xs text-green-400/70 mb-1">Trend Strength</div>
                        <div className="w-full bg-green-900/30 rounded-full h-2.5">
                          <div
                            className="bg-green-400 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                ((tech.technology_trend_points?.reduce(
                                  (sum: number, point: any) => sum + point.mention_count, 0
                                ) || 0) / 10) * 100
                              )}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="social">
            {socialData ? (
              <SocialTrendInsights
                tweets={socialData.tweets}
                hashtags={socialData.hashtags}
              />
            ) : (
              <div className="text-center text-green-400 p-8 bg-black/60 border-2 border-green-400 rounded">
                <div className="text-xl font-bold mb-4">Social Media Data Not Available</div>
                <div className="mb-6">
                  No social media data has been fetched yet. Please run the Twitter integration script to populate the data.
                </div>
                <div className="text-sm bg-black/60 p-4 rounded text-left">
                  <div className="font-bold mb-2">Steps to fix:</div>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Make sure the Twitter API key is set in your environment variables</li>
                    <li>Run the Twitter integration script: <code className="bg-green-900/30 px-2 py-1 rounded">node scripts/add-twitter-integration.js</code></li>
                    <li>Refresh the page</li>
                  </ol>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="report">
            {trendData.latestReport ? (
              <div className="bg-black/60 border-2 border-green-400 rounded p-6">
                <h3 className="text-green-400 font-bold mb-4 text-xl pixel-font">
                  {trendData.latestReport.title}
                </h3>
                
                <div className="text-green-300 mb-6 whitespace-pre-line">
                  {trendData.latestReport.summary}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-yellow-400 font-bold mb-3 pixel-font">TOP TECHNOLOGIES</h4>
                    <div className="space-y-2">
                      {trendData.latestReport.report_data?.topTechnologies?.map((tech: any, index: number) => (
                        <div key={tech.id} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-400/20 rounded-full flex items-center justify-center text-green-400 font-bold">
                            {index + 1}
                          </div>
                          <div className="text-green-300">{tech.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-yellow-400 font-bold mb-3 pixel-font">RISING TRENDS</h4>
                    <div className="space-y-2">
                      {trendData.latestReport.report_data?.risingTechnologies?.map((tech: any) => (
                        <div key={tech.id} className="flex items-center gap-2">
                          <div className="text-pink-400">📈</div>
                          <div className="text-green-300">{tech.name}</div>
                          <div className="text-pink-400 text-sm">
                            +{(tech.growthRate * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-yellow-400 font-bold mb-3 pixel-font">KEY DEVELOPMENTS</h4>
                  <div className="space-y-3">
                    {trendData.latestReport.report_data?.keyDevelopments?.map((dev: any) => (
                      <div key={dev.id} className="bg-green-400/10 p-3 rounded">
                        <a 
                          href={dev.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-300 hover:text-green-200 transition-colors"
                        >
                          {dev.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-green-400 p-8">
                No weekly report available yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}