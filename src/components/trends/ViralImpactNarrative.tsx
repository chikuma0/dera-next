'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/contexts/LanguageContext';
import { Tweet } from '@/types/twitter';

interface ViralImpactNarrativeProps {
  trendData: any;
  impactData: any;
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

export function ViralImpactNarrative({ trendData, impactData, socialData }: ViralImpactNarrativeProps) {
  const { translate } = useTranslation();
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  useEffect(() => {
    if (trendData?.technologies?.length > 0 && !selectedTech) {
      setSelectedTech(trendData.technologies[0].id.toString());
    }
  }, [trendData, selectedTech]);
  
  // Generate a shareable link for the current narrative
  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    const techId = selectedTech || '';
    const shareUrl = `${baseUrl}/pulse/share/${techId}`;
    setShareableLink(shareUrl);
    setShowShareModal(true);
  };
  
  if (!trendData || !impactData) {
    return (
      <div className="p-8 text-center text-green-400">
        <div className="animate-pulse">Loading Pulse data...</div>
      </div>
    );
  }
  
  // Find the selected technology
  const selectedTechnology = trendData.technologies.find(
    (tech: any) => tech.id.toString() === selectedTech
  );
  
  // Find impact data for the selected technology
  const techImpact = impactData.topTechnologies.find(
    (tech: any) => tech.id.toString() === selectedTech
  );
  
  // Find related insights for the selected technology
  const relatedInsights = impactData.latestInsights?.filter(
    (insight: any) => insight.technologyId.toString() === selectedTech
  ) || [];
  
  // Find related tweets for the selected technology
  const relatedTweets = socialData?.tweets.filter((tweet: Tweet) => {
    // Simple check if tweet content contains the technology name
    return selectedTechnology && 
      tweet.content.toLowerCase().includes(selectedTechnology.name.toLowerCase());
  }) || [];
  
  // Find industries impacted by this technology
  const impactedIndustries = impactData.impactHeatmap
    .filter((item: any) => item.technologyId.toString() === selectedTech)
    .sort((a: any, b: any) => b.impactLevel - a.impactLevel);
  
  // Generate narrative title
  const narrativeTitle = selectedTechnology 
    ? `The Impact of ${selectedTechnology.name} on Society and Business`
    : 'AI Technology Impact Narrative';
  
  // Generate narrative summary based on available data
  const generateNarrativeSummary = () => {
    if (!selectedTechnology) return '';
    
    const techName = selectedTechnology.name;
    const maturityLevel = selectedTechnology.maturity_level || 'emerging';
    const topIndustries = impactedIndustries.slice(0, 3).map((i: any) => i.industryName).join(', ');
    
    let summary = `${techName} is a ${maturityLevel} AI technology that is `;
    
    if (impactedIndustries.length > 0) {
      const topImpact = impactedIndustries[0].impactLevel;
      if (topImpact >= 8) {
        summary += `dramatically transforming ${topIndustries}.`;
      } else if (topImpact >= 5) {
        summary += `significantly impacting ${topIndustries}.`;
      } else {
        summary += `beginning to influence ${topIndustries}.`;
      }
    } else {
      summary += 'showing potential across multiple industries.';
    }
    
    // Add social validation if available
    if (relatedTweets.length > 0) {
      summary += ` This technology has generated significant social media discussion with ${relatedTweets.length} viral tweets in our analysis.`;
    }
    
    // Add trend data if available
    const trendPoints = selectedTechnology.technology_trend_points || [];
    if (trendPoints.length > 1) {
      const latestPoints = trendPoints.slice(-2);
      const growth = latestPoints[1].mention_count - latestPoints[0].mention_count;
      if (growth > 0) {
        summary += ` Mentions of ${techName} have increased by ${growth} in recent tracking, indicating growing interest.`;
      }
    }
    
    return summary;
  };
  
  return (
    <div className="bg-black/40 border-4 border-green-400 rounded-lg p-6 font-mono relative overflow-hidden retro-shadow">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <h2 className="text-green-400 text-3xl font-bold pixel-font relative z-10">
              PULSE
            </h2>
            <div className="absolute -inset-1 bg-green-400/10 blur-sm" />
          </div>
          <div className="text-yellow-400 text-sm mt-3 pixel-font">
            AI IMPACT INTELLIGENCE
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-1 bg-black/60 border-2 border-green-400 rounded p-4">
            <h3 className="text-green-400 font-bold mb-4 pixel-font">AI TECHNOLOGIES</h3>
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
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-green-400 font-bold pixel-font">
                {narrativeTitle}
              </h3>
              <button 
                onClick={generateShareableLink}
                className="bg-green-400/20 hover:bg-green-400/30 text-green-400 px-3 py-1 rounded text-sm transition-colors"
              >
                Generate Shareable Link
              </button>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-green-300 mb-6">
                {generateNarrativeSummary()}
              </p>
              
              {impactedIndustries.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-yellow-400 font-bold mb-3 text-lg">Industry Impact</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {impactedIndustries.slice(0, 4).map((industry: any, index: number) => (
                      <motion.div
                        key={`${industry.industryId}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-black/80 border border-green-400/30 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-green-300">{industry.industryName}</div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            industry.impactLevel >= 8 ? 'bg-red-500/20 text-red-300' :
                            industry.impactLevel >= 6 ? 'bg-orange-500/20 text-orange-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            Impact: {industry.impactLevel}/10
                          </div>
                        </div>
                        <div className="w-full bg-green-900/30 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              industry.impactLevel >= 8 ? 'bg-red-500' :
                              industry.impactLevel >= 6 ? 'bg-orange-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${(industry.impactLevel / 10) * 100}%` }}
                          ></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {relatedInsights.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-yellow-400 font-bold mb-3 text-lg">Key Insights</h4>
                  <div className="space-y-4">
                    {relatedInsights.map((insight: any, index: number) => (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-green-400/10 p-3 rounded-lg border-l-4 border-green-400"
                      >
                        <p className="text-green-300 text-sm">{insight.summary}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {relatedTweets.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-yellow-400 font-bold mb-3 text-lg">Social Pulse</h4>
                  <div className="space-y-4">
                    {relatedTweets.slice(0, 3).map((tweet: Tweet, index: number) => (
                      <motion.div
                        key={tweet.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-black/80 border border-green-400/30 rounded-lg p-4 hover:border-green-400/60 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center text-green-400">
                            @
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-green-300">
                                  {tweet.authorName || tweet.authorUsername}
                                  {tweet.isVerified && (
                                    <span className="ml-1 text-blue-400">✓</span>
                                  )}
                                </div>
                                <div className="text-xs text-green-400/70">
                                  @{tweet.authorUsername}
                                </div>
                              </div>
                              <div className="text-xs text-green-400/50 bg-green-400/10 px-2 py-1 rounded">
                                Impact: {tweet.likesCount + tweet.retweetsCount * 2}
                              </div>
                            </div>
                            <div className="mt-3 text-green-200">{tweet.content}</div>
                            <div className="mt-3 flex items-center text-xs text-green-400/70 space-x-4">
                              <div>❤️ {tweet.likesCount}</div>
                              <div>🔄 {tweet.retweetsCount}</div>
                              <div>💬 {tweet.repliesCount}</div>
                              <a
                                href={tweet.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto text-blue-400 hover:underline"
                              >
                                View on X
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Trend visualization */}
              {selectedTechnology?.technology_trend_points?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-yellow-400 font-bold mb-3 text-lg">Trend Analysis</h4>
                  <div className="bg-black/80 border border-green-400/30 rounded-lg p-4">
                    <div className="h-[200px] relative">
                      {/* Simple trend visualization */}
                      <div className="absolute inset-0 flex items-end">
                        {selectedTechnology.technology_trend_points.map((point: any, index: number) => {
                          const height = `${(point.mention_count / 20) * 100}%`;
                          const maxHeight = '100%';
                          return (
                            <div 
                              key={index}
                              className="flex-1 mx-1"
                            >
                              <div 
                                className="bg-green-400 rounded-t"
                                style={{ 
                                  height: height > maxHeight ? maxHeight : height,
                                  minHeight: '10%'
                                }}
                              ></div>
                              <div className="text-xs text-green-400/70 text-center mt-2 rotate-45 origin-left">
                                {new Date(point.date).toLocaleDateString()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-xs text-green-400/70 mt-8 text-center">
                      Mentions over time
                    </div>
                  </div>
                </div>
              )}
              
              {/* Call to action */}
              <div className="mt-8 bg-green-400/10 p-4 rounded-lg border border-green-400/30">
                <h4 className="text-green-400 font-bold mb-2">Stay Ahead of AI Trends</h4>
                <p className="text-green-300/80 text-sm mb-4">
                  This analysis is powered by Pulse, combining real-time trend detection, social media analysis, 
                  and impact assessment to give you the most comprehensive view of AI&apos;s impact on society and business.
                </p>
                <div className="flex justify-end">
                  <button 
                    onClick={generateShareableLink}
                    className="bg-green-400 hover:bg-green-500 text-black px-4 py-2 rounded text-sm transition-colors"
                  >
                    Share This Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black/90 border-2 border-green-400 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-green-400 font-bold mb-4 pixel-font">SHARE THIS ANALYSIS</h3>
            <div className="bg-black/60 p-3 rounded mb-4 border border-green-400/30">
              <p className="text-green-300 text-sm break-all">{shareableLink}</p>
            </div>
            <div className="flex justify-between">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(shareableLink);
                  alert('Link copied to clipboard!');
                }}
                className="bg-green-400/20 hover:bg-green-400/30 text-green-400 px-4 py-2 rounded text-sm transition-colors"
              >
                Copy Link
              </button>
              <button 
                onClick={() => setShowShareModal(false)}
                className="bg-green-400 hover:bg-green-500 text-black px-4 py-2 rounded text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}