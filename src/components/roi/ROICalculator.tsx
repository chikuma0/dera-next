'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/contexts/LanguageContext';
import ROIReport from '@/components/roi/ROIReport';

// Define types for our form and results
interface CalculatorInputs {
  industry: string;
  companySize: 'solo' | 'small' | 'medium';
  businessGoals: string[];
}

interface ROIResult {
  technologies: {
    name: string;
    roiRange: {
      min: number;
      max: number;
    };
    implementationDifficulty: number; // 1-5 scale
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
}

export function ROICalculator() {
  const { translate, locale } = useTranslation();
  const [inputs, setInputs] = useState<CalculatorInputs>({
    industry: '',
    companySize: 'solo',
    businessGoals: []
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ROIResult | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Available industries focused on Japanese SMBs
  const industries = [
    'manufacturing', // 製造業
    'retail', // 小売業
    'food-service', // 飲食業
    'technology', // IT・テクノロジー
    'professional-services', // 専門サービス
    'construction', // 建設業
    'healthcare', // 医療・ヘルスケア
    'education', // 教育
    'hospitality', // ホスピタリティ
    'logistics' // 物流・運輸
  ];

  // Business goals with language-specific labels
  const getBusinessGoalOptions = () => {
    if (locale === 'ja') {
      return [
        { id: 'efficiency_cost', label: '業務効率化・コスト削減' },
        { id: 'innovation', label: 'イノベーション・製品開発' },
        { id: 'labor', label: '人手不足対策' },
        { id: 'market', label: '市場拡大' },
        { id: 'quality_supply', label: '品質向上・サプライチェーン強化' },
        { id: 'customer', label: '顧客体験向上' },
        { id: 'digital', label: 'DX' }
      ];
    } else {
      return [
        { id: 'efficiency_cost', label: 'Operational Efficiency & Cost Reduction' },
        { id: 'innovation', label: 'Innovation & Product Development' },
        { id: 'labor', label: 'Labor Shortage Solutions' },
        { id: 'market', label: 'Market Expansion' },
        { id: 'quality_supply', label: 'Quality Improvement & Supply Chain Enhancement' },
        { id: 'customer', label: 'Customer Experience Enhancement' },
        { id: 'digital', label: 'Digital Transformation' }
      ];
    }
  };
  
  const businessGoalOptions = getBusinessGoalOptions();

  // Handle form input changes
  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputs({ ...inputs, industry: e.target.value });
  };

  const handleCompanySizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputs({ ...inputs, companySize: e.target.value as 'solo' | 'small' | 'medium' });
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const goal = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      setInputs({
        ...inputs,
        businessGoals: [...inputs.businessGoals, goal]
      });
    } else {
      setInputs({
        ...inputs,
        businessGoals: inputs.businessGoals.filter(g => g !== goal)
      });
    }
  };

  // Calculate ROI based on inputs
  const calculateROI = async () => {
    if (!inputs.industry || inputs.businessGoals.length === 0) {
      alert(locale === 'ja'
        ? '業種と少なくとも1つの経営課題を選択してください'
        : 'Please select an industry and at least one business goal');
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate the API call with a timeout
      const response = await fetch('/api/roi/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ROI');
      }

      const data = await response.json();
      setResults(data);
      setShowReport(true);
    } catch (error) {
      console.error('Error calculating ROI:', error);
      // For demo purposes, let's generate mock results if the API fails
      generateMockResults();
    } finally {
      setLoading(false);
    }
  };

  // Generate mock results for demonstration
  const generateMockResults = () => {
    // Adjust resource requirements based on company size
    const getResourceRequirements = (techComplexity: 'low' | 'medium' | 'high') => {
      // Base values that will be adjusted by company size
      let developers = 0;
      let dataScientists = 0;
      let domainExperts = 1; // At minimum, need one domain expert (could be the business owner)
      
      // Adjust based on company size
      if (inputs.companySize === 'solo') {
        // Solo entrepreneurs will mostly outsource technical work
        developers = 0; // Outsourced
        dataScientists = 0; // Outsourced
        // Domain expert is the business owner
      } else if (inputs.companySize === 'small') {
        // Small businesses might have 1 internal developer for simpler projects
        developers = techComplexity === 'low' ? 0 : 1;
        dataScientists = 0; // Likely outsourced
        domainExperts = techComplexity === 'high' ? 2 : 1;
      } else if (inputs.companySize === 'medium') {
        // Medium businesses can afford more internal resources
        developers = techComplexity === 'low' ? 1 : techComplexity === 'medium' ? 1 : 2;
        dataScientists = techComplexity === 'high' ? 1 : 0;
        domainExperts = techComplexity === 'high' ? 2 : 1;
      }
      
      return {
        developers,
        dataScientists,
        domainExperts
      };
    };
    
    // Adjust implementation difficulty based on company size
    const getImplementationDifficulty = (baseDifficulty: number) => {
      // Smaller companies face more challenges with implementation
      if (inputs.companySize === 'solo') {
        return Math.min(baseDifficulty + 1, 5); // Increase difficulty but cap at 5
      } else if (inputs.companySize === 'small') {
        return baseDifficulty;
      } else {
        return Math.max(baseDifficulty - 1, 1); // Decrease difficulty but minimum 1
      }
    };
    
    // Adjust time to value based on company size
    const getTimeToValue = (baseMonths: number) => {
      // Smaller companies can implement faster due to less bureaucracy
      let adjustedMonths = baseMonths;
      
      if (inputs.companySize === 'solo') {
        adjustedMonths = Math.max(baseMonths - 2, 3); // Faster but minimum 3 months
      } else if (inputs.companySize === 'small') {
        adjustedMonths = Math.max(baseMonths - 1, 3);
      }
      
      return locale === 'ja' ?
        `${adjustedMonths}-${adjustedMonths + 3} ヶ月` :
        `${adjustedMonths}-${adjustedMonths + 3} months`;
    };
    
    // This is just for demonstration - in production, this would come from the API
    const mockResults: ROIResult = {
      technologies: [
        {
          name: inputs.industry === 'healthcare' ?
                (locale === 'ja' ? '臨床ワークフロー自動化' : 'Clinical Workflow Automation') :
                inputs.industry === 'finance' ?
                (locale === 'ja' ? 'インテリジェント不正検出' : 'Intelligent Fraud Detection') :
                (locale === 'ja' ? 'プロセス自動化AI' : 'Process Automation AI'),
          roiRange: {
            min: inputs.companySize === 'solo' ? 4.0 : inputs.companySize === 'small' ? 3.8 : 3.5,
            max: inputs.companySize === 'solo' ? 6.5 : inputs.companySize === 'small' ? 6.0 : 5.8
          },
          implementationDifficulty: getImplementationDifficulty(3),
          timeToValue: getTimeToValue(6),
          resourceRequirements: getResourceRequirements('low'),
          competitiveAdvantage: locale === 'ja' ? '18ヶ月の業界平均に対する優位性' : '18-month advantage over industry average',
          keyMetrics: [
            inputs.industry === 'healthcare' ?
              (locale === 'ja' ? '42% 削減: 管理業務' : '42% reduction in administrative tasks') :
            inputs.industry === 'finance' ?
              (locale === 'ja' ? '68% 向上: 不正検出' : '68% improvement in fraud detection') :
              (locale === 'ja' ? '35% 増加: 業務効率' : '35% increase in operational efficiency'),
            
            inputs.industry === 'healthcare' ?
              (locale === 'ja' ? '28% 増加: 患者受入能力' : '28% increase in patient capacity') :
            inputs.industry === 'finance' ?
              (locale === 'ja' ? '22% 削減: 誤検知' : '22% reduction in false positives') :
              (locale === 'ja' ? '25% 削減: 主要プロセスのコスト' : '25% cost reduction in core processes')
          ]
        },
        {
          name: inputs.industry === 'healthcare' ?
                (locale === 'ja' ? '予測患者分析' : 'Predictive Patient Analytics') :
                inputs.industry === 'finance' ?
                (locale === 'ja' ? 'パーソナライズド金融インサイト' : 'Personalized Financial Insights') :
                (locale === 'ja' ? '予測メンテナンスAI' : 'Predictive Maintenance AI'),
          roiRange: {
            min: inputs.companySize === 'solo' ? 3.2 : inputs.companySize === 'small' ? 3.0 : 2.8,
            max: inputs.companySize === 'solo' ? 5.0 : inputs.companySize === 'small' ? 4.8 : 4.5
          },
          implementationDifficulty: getImplementationDifficulty(4),
          timeToValue: getTimeToValue(9),
          resourceRequirements: getResourceRequirements('medium'),
          competitiveAdvantage: locale === 'ja' ? '12ヶ月の業界平均に対する優位性' : '12-month advantage over industry average',
          keyMetrics: [
            inputs.industry === 'healthcare' ?
              (locale === 'ja' ? '32% 向上: 患者アウトカム' : '32% improvement in patient outcomes') :
            inputs.industry === 'finance' ?
              (locale === 'ja' ? '41% 増加: 顧客エンゲージメント' : '41% increase in customer engagement') :
              (locale === 'ja' ? '47% 削減: 設備ダウンタイム' : '47% reduction in equipment downtime'),
            
            inputs.industry === 'healthcare' ?
              (locale === 'ja' ? '18% 削減: 再入院率' : '18% reduction in readmission rates') :
            inputs.industry === 'finance' ?
              (locale === 'ja' ? '28% 増加: 製品採用率' : '28% increase in product adoption') :
              (locale === 'ja' ? '33% 延長: 資産寿命' : '33% extension of asset lifespan')
          ]
        },
        {
          name: inputs.industry === 'healthcare' ?
                (locale === 'ja' ? '医療画像AI' : 'Medical Imaging AI') :
                inputs.industry === 'finance' ?
                (locale === 'ja' ? 'アルゴリズム取引最適化' : 'Algorithmic Trading Optimization') :
                (locale === 'ja' ? '顧客体験AI' : 'Customer Experience AI'),
          roiRange: {
            min: inputs.companySize === 'solo' ? 2.5 : inputs.companySize === 'small' ? 2.3 : 2.2,
            max: inputs.companySize === 'solo' ? 4.2 : inputs.companySize === 'small' ? 4.0 : 3.8
          },
          implementationDifficulty: getImplementationDifficulty(5),
          timeToValue: getTimeToValue(12),
          resourceRequirements: getResourceRequirements('high'),
          competitiveAdvantage: locale === 'ja' ? '24ヶ月の業界平均に対する優位性' : '24-month advantage over industry average',
          keyMetrics: [
            inputs.industry === 'healthcare' ?
              (locale === 'ja' ? '58% 短縮: 診断時間' : '58% faster diagnosis time') :
            inputs.industry === 'finance' ?
              (locale === 'ja' ? '12% 向上: 取引パフォーマンス' : '12% increase in trading performance') :
              (locale === 'ja' ? '42% 向上: 顧客満足度' : '42% improvement in customer satisfaction'),
            
            inputs.industry === 'healthcare' ?
              (locale === 'ja' ? '31% 削減: 診断エラー' : '31% reduction in diagnostic errors') :
            inputs.industry === 'finance' ?
              (locale === 'ja' ? '18% 削減: 運用コスト' : '18% reduction in operational costs') :
              (locale === 'ja' ? '28% 増加: 顧客生涯価値' : '28% increase in customer lifetime value')
          ]
        }
      ],
      industryContext: {
        adoptionRate: inputs.industry === 'healthcare' ? 72 : 
                      inputs.industry === 'finance' ? 85 : 65,
        averageImplementationTime: inputs.industry === 'healthcare' ? 9 : 
                                  inputs.industry === 'finance' ? 6 : 8,
        primaryChallenges: [
          inputs.industry === 'healthcare' ?
            (locale === 'ja' ? 'レガシーシステムとの統合' : 'Integration with legacy systems') :
          inputs.industry === 'finance' ?
            (locale === 'ja' ? '法規制遵守' : 'Regulatory compliance') :
            (locale === 'ja' ? 'データ品質と統合' : 'Data quality and integration'),
          
          inputs.industry === 'healthcare' ?
            (locale === 'ja' ? '従業員のトレーニングとスキル開発' : 'Staff training and adoption') :
          inputs.industry === 'finance' ?
            (locale === 'ja' ? 'データセキュリティの懸念' : 'Data security concerns') :
            (locale === 'ja' ? '専門人材の確保' : 'Skilled talent acquisition'),
          
          inputs.industry === 'healthcare' ?
            (locale === 'ja' ? '患者データのプライバシー' : 'Patient data privacy') :
          inputs.industry === 'finance' ?
            (locale === 'ja' ? 'モデルの説明可能性' : 'Model explainability') :
            (locale === 'ja' ? '変更管理' : 'Change management')
        ]
      }
    };

    setResults(mockResults);
    setShowReport(true);
  };

  // Reset the calculator
  const resetCalculator = () => {
    setInputs({
      industry: '',
      companySize: 'solo',
      businessGoals: []
    });
    setResults(null);
    setShowReport(false);
  };

  return (
    <div className="bg-black/40 border-4 border-green-400 rounded-lg p-6 font-mono relative overflow-hidden retro-shadow">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <h2 className="text-green-400 text-3xl font-bold pixel-font relative z-10">
              {locale === 'ja' ? 'AI ROI計算ツール' : 'AI ROI Calculator'}
            </h2>
            <div className="absolute -inset-1 bg-green-400/10 blur-sm" />
          </div>
          <div className="text-yellow-400 text-sm mt-3 pixel-font">
            {locale === 'ja' ? 'AI投資の可能性を発見する' : 'DISCOVER YOUR AI INVESTMENT POTENTIAL'}
          </div>
        </div>
        
        {!showReport ? (
          <div className="bg-black/60 border-2 border-green-400 rounded p-6">
            <h3 className="text-green-400 font-bold mb-6 pixel-font">
              {locale === 'ja' ? 'ROI分析をカスタマイズ' : 'CUSTOMIZE YOUR ROI ANALYSIS'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-green-400 text-sm mb-2">
                  {locale === 'ja' ? '業種' : 'Industry'}
                </label>
                <select
                  className="w-full bg-black border-2 border-green-400 rounded p-3 text-green-300"
                  value={inputs.industry}
                  onChange={handleIndustryChange}
                  required
                >
                  <option value="">{locale === 'ja' ? '業種を選択してください' : 'Select Your Industry'}</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {locale === 'ja' ?
                        // Japanese industry names
                        industry === 'manufacturing' ? '製造業' :
                        industry === 'retail' ? '小売業' :
                        industry === 'food-service' ? '飲食業' :
                        industry === 'technology' ? 'IT・テクノロジー' :
                        industry === 'professional-services' ? '専門サービス' :
                        industry === 'construction' ? '建設業' :
                        industry === 'healthcare' ? '医療・ヘルスケア' :
                        industry === 'education' ? '教育' :
                        industry === 'hospitality' ? 'ホスピタリティ' :
                        industry === 'logistics' ? '物流・運輸' :
                        industry.charAt(0).toUpperCase() + industry.slice(1).replace('-', ' & ')
                      :
                        // English industry names
                        industry.charAt(0).toUpperCase() + industry.slice(1).replace('-', ' & ')
                      }
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-green-400 text-sm mb-2">
                  {locale === 'ja' ? '企業規模' : 'Company Size'}
                </label>
                <select
                  className="w-full bg-black border-2 border-green-400 rounded p-3 text-green-300"
                  value={inputs.companySize}
                  onChange={handleCompanySizeChange}
                >
                  <option value="solo">
                    {locale === 'ja' ? 'Solo 1' : 'Solo 1'}
                  </option>
                  <option value="small">
                    {locale === 'ja' ? 'Small 2-19' : 'Small 2-19'}
                  </option>
                  <option value="medium">
                    {locale === 'ja' ? 'Medium 20-100' : 'Medium 20-100'}
                  </option>
                </select>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-green-400 text-sm mb-3">
                {locale === 'ja' ? '経営課題 (3つまで選択可能)' : 'Business Goals (Select up to 3)'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {businessGoalOptions.map((goal) => (
                  <div key={goal.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={goal.id}
                      value={goal.id}
                      checked={inputs.businessGoals.includes(goal.id)}
                      onChange={handleGoalChange}
                      className="mr-2 h-4 w-4 border-green-400 text-green-400 focus:ring-green-400"
                      disabled={inputs.businessGoals.length >= 3 && !inputs.businessGoals.includes(goal.id)}
                    />
                    <label htmlFor={goal.id} className="text-green-300">
                      {goal.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={calculateROI}
                disabled={loading || !inputs.industry || inputs.businessGoals.length === 0}
                className="bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {locale === 'ja' ? '計算中...' : 'Calculating...'}
                  </span>
                ) : (
                  locale === 'ja' ? 'AI ROIを計算する' : 'CALCULATE AI ROI'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div>
            {results && <ROIReport results={results} inputs={inputs} onReset={resetCalculator} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default ROICalculator;