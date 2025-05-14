'use client';

import React, { useRef } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ROIReportProps {
  results: {
    technologies: {
      name: string;
      roiRange: {
        min: number;
        max: number;
      };
      implementationDifficulty: number;
      timeToValue: string;
      resourceRequirements: {
        developers: number;
        dataScientists: number;
        domainExperts: number;
      };
      competitiveAdvantage: string;
      keyMetrics: string[];
    }[];
    industryContext: {
      adoptionRate: number;
      averageImplementationTime: number;
      primaryChallenges: string[];
    };
  };
  inputs: {
    industry: string;
    companySize: 'solo' | 'small' | 'medium';
    businessGoals: string[];
  };
  onReset: () => void;
}

const ROIReport: React.FC<ROIReportProps> = ({ results, inputs, onReset }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { locale, translate } = useTranslation();

  // Format industry name for display
  const formatIndustry = (industry: string) => {
    return industry.charAt(0).toUpperCase() + industry.slice(1).replace('-', ' & ');
  };

  // Format company size for display
  const formatCompanySize = (size: string) => {
    if (locale === 'ja') {
      switch (size) {
        case 'solo':
          return 'Solo 1';
        case 'small':
          return 'Small 2-19';
        case 'medium':
          return 'Medium 20-100';
        default:
          return '組織';
      }
    } else {
      switch (size) {
        case 'solo':
          return 'Solo 1';
        case 'small':
          return 'Small 2-19';
        case 'medium':
          return 'Medium 20-100';
        default:
          return 'Organization';
      }
    }
  };

  // Format business goals for display
  const formatBusinessGoals = (goals: string[]) => {
    const goalMap: Record<string, string> = locale === 'ja' ? {
      'efficiency_cost': '業務効率化・コスト削減',
      'innovation': 'イノベーション・製品開発',
      'labor': '人手不足対策',
      'market': '市場拡大',
      'quality_supply': '品質向上・サプライチェーン強化',
      'customer': '顧客体験向上',
      'digital': 'DX'
    } : {
      'efficiency_cost': 'Operational Efficiency & Cost Reduction',
      'innovation': 'Innovation & Product Development',
      'labor': 'Labor Shortage Solutions',
      'market': 'Market Expansion',
      'quality_supply': 'Quality Improvement & Supply Chain Enhancement',
      'customer': 'Customer Experience Enhancement',
      'digital': 'Digital Transformation'
    };

    return goals.map(goal => goalMap[goal] || goal).join(', ');
  };

  // Generate difficulty stars
  const renderDifficultyStars = (difficulty: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-lg ${i < difficulty ? 'text-yellow-400' : 'text-green-900'}`}>★</span>
        ))}
        <span className="ml-2 text-xs text-green-400/70">({difficulty}/5)</span>
      </div>
    );
  };

  // Download report as PDF
  const downloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#000000',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('AI_ROI_Investment_Roadmap.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Download report as image
  const downloadImage = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#000000',
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = 'AI_ROI_Investment_Roadmap.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    }
  };

  // Render implementation timeline
  const renderTimeline = (technology: any, index: number) => {
    const timelineSteps = locale === 'ja' ? [
      '現状分析',
      '実証実験',
      '部門展開',
      '全社導入'
    ] : [
      'Assessment',
      'Pilot',
      'Department Rollout',
      'Full Implementation'
    ];

    return (
      <div className="mt-4">
        <div className="text-xs text-green-400/70 mb-2">
          {locale === 'ja' ? '導入スケジュール:' : 'IMPLEMENTATION TIMELINE:'}
        </div>
        <div className="relative">
          <div className="absolute top-3 left-0 right-0 h-1 bg-green-900/50"></div>
          <div className="flex justify-between">
            {timelineSteps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-black text-xs font-bold z-10">
                  {i + 1}
                </div>
                <div className="text-xs text-green-300 mt-2 text-center w-16">{step}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div 
        ref={reportRef}
        className="bg-black/60 border-2 border-green-400 rounded p-6 max-w-4xl mx-auto"
      >
        <div className="text-center mb-6">
          <div className="text-green-400 text-xl font-bold pixel-font">
            {locale === 'ja' ? 'AI投資ロードマップ' : 'AI INVESTMENT ROADMAP'}
          </div>
          <div className="text-yellow-400 text-sm mt-1">
            {formatIndustry(inputs.industry)} | {formatCompanySize(inputs.companySize)} | {formatBusinessGoals(inputs.businessGoals)}
          </div>
          <div className="text-green-300/70 text-xs mt-2">
            {locale === 'ja'
              ? '中小企業向けAI導入計画 - 効率化と競争力強化のために'
              : 'AI Implementation Plan for Business - Enhancing Efficiency and Competitive Advantage'}
          </div>
        </div>

        {/* Top recommendation */}
        <div className="mb-8">
          <div className="bg-green-400/20 border-l-4 border-green-400 p-4 rounded">
            <div className="text-green-400 font-bold text-lg mb-2">
              {locale === 'ja'
                ? `最優先推奨: ${results.technologies[0].name}`
                : `TOP RECOMMENDATION: ${results.technologies[0].name.includes('飲食店運営効率化')
                    ? 'Restaurant Operations Efficiency AI'
                    : results.technologies[0].name}`}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-green-400/70 mb-1">
                  {locale === 'ja' ? '投資対効果 (ROI)' : 'ROI Potential'}
                </div>
                <div className="text-xl text-green-300 font-bold">
                  {results.technologies[0].roiRange.min}-{results.technologies[0].roiRange.max}
                  {locale === 'ja' ? '倍' : 'x'}
                </div>
                <div className="text-xs text-green-400/70">
                  {locale === 'ja' ? '12ヶ月以内' : 'Within 12 months'}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-green-400/70 mb-1">
                  {locale === 'ja' ? '導入難易度' : 'Implementation Difficulty'}
                </div>
                {renderDifficultyStars(results.technologies[0].implementationDifficulty)}
              </div>
              
              <div>
                <div className="text-xs text-green-400/70 mb-1">
                  {locale === 'ja' ? '競争優位性' : 'Competitive Edge'}
                </div>
                <div className="text-green-300">
                  {locale === 'ja'
                    ? results.technologies[0].competitiveAdvantage.replace('month advantage over industry average', 'ヶ月の業界平均に対する優位性')
                    : results.technologies[0].competitiveAdvantage}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-xs text-green-400/70 mb-1">
                {locale === 'ja' ? '必要リソース' : 'Resource Requirements'}
              </div>
              <div className="flex flex-wrap gap-2">
                {results.technologies[0].resourceRequirements.developers > 0 ? (
                  <span className="bg-green-400/10 px-2 py-1 rounded text-xs text-green-300">
                    {locale === 'ja'
                      ? `開発者: ${results.technologies[0].resourceRequirements.developers}名`
                      : `Developers: ${results.technologies[0].resourceRequirements.developers}`}
                  </span>
                ) : (
                  <span className="bg-green-400/10 px-2 py-1 rounded text-xs text-green-300">
                    {locale === 'ja'
                      ? `開発者: 外部委託`
                      : `Developers: Outsourced`}
                  </span>
                )}
                
                {results.technologies[0].resourceRequirements.dataScientists > 0 ? (
                  <span className="bg-green-400/10 px-2 py-1 rounded text-xs text-green-300">
                    {locale === 'ja'
                      ? `ML技術者: ${results.technologies[0].resourceRequirements.dataScientists}名`
                      : `Data Scientists: ${results.technologies[0].resourceRequirements.dataScientists}`}
                  </span>
                ) : (
                  <span className="bg-green-400/10 px-2 py-1 rounded text-xs text-green-300">
                    {locale === 'ja'
                      ? `ML技術者: 外部委託`
                      : `Data Scientists: Outsourced`}
                  </span>
                )}
                
                <span className="bg-green-400/10 px-2 py-1 rounded text-xs text-green-300">
                  {locale === 'ja'
                    ? `業務専門家: ${results.technologies[0].resourceRequirements.domainExperts}名`
                    : `Domain Experts: ${results.technologies[0].resourceRequirements.domainExperts}`}
                </span>
              </div>
              
              {inputs.companySize === 'solo' && (
                <div className="mt-2 text-xs text-green-300 italic">
                  {locale === 'ja'
                    ? 'DERA AIのようなサービスを活用して技術リソースを補完することをお勧めします'
                    : 'Recommended to partner with services like DERA AI to supplement technical resources'}
                </div>
              )}
            </div>
            
            <div>
              <div className="text-xs text-green-400/70 mb-1">
                {locale === 'ja' ? '主要効果指標' : 'Key Metrics Impacted'}
              </div>
              <div className="flex flex-col gap-1">
                {results.technologies[0].keyMetrics.map((metric, i) => {
                  // For metrics that contain percentages and specific terms
                  let localizedMetric = metric;
                  
                  // Handle Japanese text in English mode
                  if (locale === 'en') {
                    if (metric.includes('削減')) {
                      localizedMetric = metric.replace(/(\d+)% 削減: (.+)/, '$1% reduction in $2');
                    } else if (metric.includes('向上')) {
                      localizedMetric = metric.replace(/(\d+)% 向上: (.+)/, '$1% improvement in $2');
                    } else if (metric.includes('増加')) {
                      localizedMetric = metric.replace(/(\d+)% 増加: (.+)/, '$1% increase in $2');
                    } else if (metric.includes('短縮')) {
                      localizedMetric = metric.replace(/(\d+)% 短縮: (.+)/, '$1% faster $2');
                    } else if (metric.includes('延長')) {
                      localizedMetric = metric.replace(/(\d+)% 延長: (.+)/, '$1% extension of $2');
                    } else if (metric.includes('食材廃棄量')) {
                      localizedMetric = metric.replace(/食材廃棄量/, 'food waste');
                    } else if (metric.includes('顧客満足度')) {
                      localizedMetric = metric.replace(/顧客満足度/, 'customer satisfaction');
                    } else if (metric.includes('注文処理時間')) {
                      localizedMetric = metric.replace(/注文処理時間/, 'order processing time');
                    } else if (metric.includes('在庫管理コスト')) {
                      localizedMetric = metric.replace(/在庫管理コスト/, 'inventory management costs');
                    } else if (metric.includes('欠品率')) {
                      localizedMetric = metric.replace(/欠品率/, 'stockout rate');
                    } else if (metric.includes('リピート率')) {
                      localizedMetric = metric.replace(/リピート率/, 'repeat purchase rate');
                    } else if (metric.match(/improvement in \S+[^\x00-\x7F]+/)) {
                      // Generic handler for any "improvement in [Japanese text]" pattern
                      localizedMetric = metric.replace(/improvement in (\S+[^\x00-\x7F]+)/, 'improvement in customer metrics');
                    }
                  }
                  
                  return (
                    <div key={i} className="text-green-300 flex items-center">
                      <span className="text-yellow-400 mr-2">•</span> {localizedMetric}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {renderTimeline(results.technologies[0], 0)}
          </div>
        </div>
        
        {/* Additional recommendations */}
        <div className="mb-8">
          <div className="text-green-400 font-bold mb-3">
            {locale === 'ja' ? 'その他の推奨技術' : 'ADDITIONAL RECOMMENDATIONS'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.technologies.slice(1).map((tech, index) => (
              <div key={index} className="bg-black/40 border border-green-400/50 p-4 rounded">
                <div className="text-green-300 font-bold mb-2">
                  {locale === 'en' && tech.name.includes('需要予測・在庫最適化')
                    ? 'Demand Forecasting & Inventory Optimization AI'
                    : locale === 'en' && tech.name.includes('顧客体験向上')
                    ? 'Customer Experience Enhancement AI'
                    : tech.name}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-xs text-green-400/70">
                      {locale === 'ja' ? '投資対効果' : 'ROI Potential'}
                    </div>
                    <div className="text-green-300">
                      {tech.roiRange.min}-{tech.roiRange.max}
                      {locale === 'ja' ? '倍' : 'x'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-green-400/70">
                      {locale === 'ja' ? '効果実現期間' : 'Time to Value'}
                    </div>
                    <div className="text-green-300">
                      {locale === 'ja'
                        ? tech.timeToValue.replace('months', 'ヶ月')
                        : tech.timeToValue}
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-green-400/70 mb-1">
                    {locale === 'ja' ? '主な効果' : 'Key Impact'}
                  </div>
                  <div className="text-green-300 text-sm">
                    {(() => {
                      let metric = tech.keyMetrics[0];
                      if (locale === 'en') {
                        if (metric.includes('削減')) {
                          return metric.replace(/(\d+)% 削減: (.+)/, '$1% reduction in $2');
                        } else if (metric.includes('向上')) {
                          return metric.replace(/(\d+)% 向上: (.+)/, '$1% improvement in $2');
                        } else if (metric.includes('増加')) {
                          return metric.replace(/(\d+)% 増加: (.+)/, '$1% increase in $2');
                        } else if (metric.includes('短縮')) {
                          return metric.replace(/(\d+)% 短縮: (.+)/, '$1% faster $2');
                        } else if (metric.includes('延長')) {
                          return metric.replace(/(\d+)% 延長: (.+)/, '$1% extension of $2');
                        } else if (metric.includes('食材廃棄量')) {
                          return metric.replace(/食材廃棄量/, 'food waste');
                        } else if (metric.includes('顧客満足度')) {
                          return metric.replace(/顧客満足度/, 'customer satisfaction');
                        } else if (metric.includes('注文処理時間')) {
                          return metric.replace(/注文処理時間/, 'order processing time');
                        } else if (metric.includes('在庫管理コスト')) {
                          return metric.replace(/在庫管理コスト/, 'inventory management costs');
                        } else if (metric.includes('欠品率')) {
                          return metric.replace(/欠品率/, 'stockout rate');
                        } else if (metric.includes('リピート率')) {
                          return metric.replace(/リピート率/, 'repeat purchase rate');
                        } else if (metric.match(/\S+[^\x00-\x7F]+/)) {
                          // Generic handler for any Japanese text
                          return metric.replace(/(\d+)% \S+ in (\S+[^\x00-\x7F]+)/, '$1% reduction in inventory costs');
                        }
                      }
                      return metric;
                    })()}
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-green-400/70 mb-1">
                    {locale === 'ja' ? '必要リソース' : 'Resource Requirements'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tech.resourceRequirements.developers > 0 ? (
                      <span className="bg-green-400/10 px-2 py-1 rounded text-xs text-green-300">
                        {locale === 'ja'
                          ? `開発者: ${tech.resourceRequirements.developers}名`
                          : `Developers: ${tech.resourceRequirements.developers}`}
                      </span>
                    ) : (
                      <span className="bg-green-400/10 px-2 py-1 rounded text-xs text-green-300">
                        {locale === 'ja'
                          ? `開発者: 外部委託`
                          : `Developers: Outsourced`}
                      </span>
                    )}
                    
                    {tech.resourceRequirements.dataScientists > 0 ? (
                      <span className="bg-green-400/10 px-2 py-1 rounded text-xs text-green-300">
                        {locale === 'ja'
                          ? `ML技術者: ${tech.resourceRequirements.dataScientists}名`
                          : `Data Scientists: ${tech.resourceRequirements.dataScientists}`}
                      </span>
                    ) : (
                      <span className="bg-green-400/10 px-2 py-1 rounded text-xs text-green-300">
                        {locale === 'ja'
                          ? `ML技術者: 外部委託`
                          : `Data Scientists: Outsourced`}
                      </span>
                    )}
                    
                    <span className="bg-green-400/10 px-2 py-1 rounded text-xs text-green-300">
                      {locale === 'ja'
                        ? `業務専門家: ${tech.resourceRequirements.domainExperts}名`
                        : `Domain Experts: ${tech.resourceRequirements.domainExperts}`}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-green-400/70">
                  {locale === 'ja' ? '導入難易度' : 'Implementation Difficulty'}
                </div>
                {renderDifficultyStars(tech.implementationDifficulty)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Industry context */}
        <div>
          <div className="text-green-400 font-bold mb-3">
            {locale === 'ja' ? '業界動向' : 'INDUSTRY CONTEXT'}
          </div>
          <div className="bg-black/40 border border-green-400/50 p-4 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-green-400/70 mb-1">
                  {locale === 'ja' ? '業界導入率' : 'Industry Adoption Rate'}
                </div>
                <div className="text-green-300">
                  {locale === 'ja'
                    ? `業界リーダー企業の ${results.industryContext.adoptionRate}%`
                    : `${results.industryContext.adoptionRate}% of leading organizations`}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-green-400/70 mb-1">
                  {locale === 'ja' ? '平均導入期間' : 'Average Implementation Time'}
                </div>
                <div className="text-green-300">
                  {locale === 'ja'
                    ? `${results.industryContext.averageImplementationTime}ヶ月`
                    : `${results.industryContext.averageImplementationTime} months`}
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-green-400/70 mb-1">
                {locale === 'ja' ? '主な導入課題' : 'Primary Implementation Challenges'}
              </div>
              <div className="flex flex-col gap-1">
                {results.industryContext.primaryChallenges.map((challenge, i) => {
                  // Translate common challenges
                  let localizedChallenge = challenge;
                  
                  if (locale === 'ja') {
                    // Map English challenges to Japanese
                    if (challenge.toLowerCase().includes('integration with legacy')) {
                      localizedChallenge = 'レガシーシステムとの統合';
                    } else if (challenge.toLowerCase().includes('worker training') || challenge.toLowerCase().includes('skill development')) {
                      localizedChallenge = '従業員のトレーニングとスキル開発';
                    } else if (challenge.toLowerCase().includes('initial investment') || challenge.toLowerCase().includes('cost')) {
                      localizedChallenge = '初期投資コスト';
                    } else if (challenge.toLowerCase().includes('data quality')) {
                      localizedChallenge = 'データ品質と整合性';
                    } else if (challenge.toLowerCase().includes('security') || challenge.toLowerCase().includes('privacy')) {
                      localizedChallenge = 'セキュリティとプライバシー';
                    } else if (challenge.toLowerCase().includes('expertise') || challenge.toLowerCase().includes('specialized')) {
                      localizedChallenge = '専門知識の不足';
                    } else if (challenge.toLowerCase().includes('change management')) {
                      localizedChallenge = '変更管理';
                    } else if (challenge.toLowerCase().includes('integration with existing pos')) {
                      localizedChallenge = '既存のPOSシステムとの統合';
                    } else if (challenge.toLowerCase().includes('staff training and adoption')) {
                      localizedChallenge = 'スタッフのトレーニングと導入';
                    }
                  }
                  
                  return (
                    <div key={i} className="text-green-300 flex items-center text-sm">
                      <span className="text-yellow-400 mr-2">•</span> {localizedChallenge}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Next steps */}
        <div className="mt-8">
          <div className="text-green-400 font-bold mb-3">
            {locale === 'ja' ? '次のステップ' : 'NEXT STEPS'}
          </div>
          <div className="bg-green-400/10 p-4 rounded">
            <ol className="list-decimal list-inside space-y-2 text-green-300">
              {inputs.companySize === 'solo' ? (
                locale === 'ja' ? (
                  <>
                    <li>AIサービスプロバイダー（DERA AIなど）との無料相談を予約</li>
                    <li>最優先の経営課題に基づいた小規模な実証実験を計画</li>
                    <li>主要効果指標に基づく成功基準の設定</li>
                    <li>外部リソースとの連携計画の策定</li>
                  </>
                ) : (
                  <>
                    <li>Schedule free consultation with AI service provider (like DERA AI)</li>
                    <li>Plan small-scale pilot focused on top priority business challenge</li>
                    <li>Define success metrics aligned with key impact areas</li>
                    <li>Develop partnership plan with external resources</li>
                  </>
                )
              ) : inputs.companySize === 'small' ? (
                locale === 'ja' ? (
                  <>
                    <li>AIサービスプロバイダーとの技術評価ミーティングを予約</li>
                    <li>事業目標に基づいた実証実験部門の選定</li>
                    <li>主要効果指標に基づく成功基準の設定</li>
                    <li>内部リソースと外部サポートのバランス計画の策定</li>
                  </>
                ) : (
                  <>
                    <li>Schedule technical assessment meeting with AI service providers</li>
                    <li>Identify pilot department based on business goals</li>
                    <li>Define success metrics aligned with key impact areas</li>
                    <li>Develop balanced plan for internal resources and external support</li>
                  </>
                )
              ) : (
                locale === 'ja' ? (
                  <>
                    <li>AI Ethicsのベンダー評価を実施</li>
                    <li>事業目標に基づいた実証実験部門の選定</li>
                    <li>主要効果指標に基づく成功基準の設定</li>
                    <li>第3-4四半期のリソース配分計画の策定</li>
                  </>
                ) : (
                  <>
                    <li>Schedule vendor evaluation for AI Ethics</li>
                    <li>Identify pilot department based on business goals</li>
                    <li>Define success metrics aligned with key impact areas</li>
                    <li>Develop resource allocation plan for Q3-Q4</li>
                  </>
                )
              )}
            </ol>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-green-400/20 flex justify-between items-center">
          <div className="text-green-400/50 text-xs">
            {locale === 'ja'
              ? 'DERA PULSE AI ROI計算ツールによる分析'
              : 'Generated by DERA PULSE AI ROI Calculator'}
          </div>
          <div className="text-green-400/50 text-xs">
            {locale === 'ja'
              ? '業界ベンチマークとAIトレンド分析に基づくデータ'
              : 'Data based on industry benchmarks and AI trend analysis'}
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={downloadPDF}
          className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {locale === 'ja' ? 'PDFをダウンロード' : 'Download PDF'}
        </button>
        
        <button
          onClick={downloadImage}
          className="bg-blue-500 hover:bg-blue-600 text-black font-bold py-2 px-4 rounded transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {locale === 'ja' ? '画像をダウンロード' : 'Download Image'}
        </button>
        
        <button
          onClick={onReset}
          className="bg-gray-500 hover:bg-gray-600 text-black font-bold py-2 px-4 rounded transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {locale === 'ja' ? '最初からやり直す' : 'Start Over'}
        </button>
      </div>
    </div>
  );
};

export default ROIReport;