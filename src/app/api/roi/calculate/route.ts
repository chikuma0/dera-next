import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEnv } from '@/lib/config/env';

// Define types for our request and response
interface CalculatorInputs {
  industry: string;
  companySize: 'small' | 'medium' | 'large';
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

// Define types for Supabase responses
interface Technology {
  id: number;
  name: string;
  slug: string;
  maturity_level?: string;
}

interface TechnologyImpact {
  id: number;
  impact_level: number;
  technology_id: number;
  ai_technologies?: Technology;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const inputs = await request.json() as CalculatorInputs;

    // Validate inputs
    if (!inputs.industry || !inputs.companySize || !inputs.businessGoals || inputs.businessGoals.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const env = validateEnv();
    const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

    // Get technologies with impact data for the selected industry
    const { data: industryData, error: industryError } = await supabase
      .from('industries')
      .select('id')
      .eq('slug', inputs.industry)
      .single();

    if (industryError) {
      console.error('Error fetching industry data:', industryError);
      return generateMockResults(inputs);
    }

    const industryId = industryData.id;

    // Get technologies with high impact for this industry
    const { data: techImpacts, error: techError } = await supabase
      .from('technology_industry_impacts')
      .select(`
        id,
        impact_level,
        technology_id,
        ai_technologies(id, name, slug, maturity_level)
      `)
      .eq('industry_id', industryId)
      .order('impact_level', { ascending: false })
      .limit(10);

    if (techError || !techImpacts || techImpacts.length === 0) {
      console.error('Error fetching technology impacts:', techError);
      return generateMockResults(inputs);
    }

    // Filter technologies based on business goals
    let filteredTechs = [...techImpacts] as unknown as TechnologyImpact[];
    
    if (inputs.businessGoals.length > 0) {
      // Get use cases related to business goals
      const useCaseSlugs = inputs.businessGoals.map(goal => {
        // Map business goals to use case slugs
        switch (goal) {
          case 'efficiency': return 'process-automation';
          case 'customer': return 'customer-experience';
          case 'innovation': return 'product-innovation';
          case 'cost': return 'cost-reduction';
          case 'revenue': return 'revenue-growth';
          case 'risk': return 'risk-management';
          case 'talent': return 'talent-management';
          case 'supply': return 'supply-chain-optimization';
          case 'sustainability': return 'sustainability';
          default: return goal;
        }
      });

      // Get use case IDs
      const { data: useCases, error: useCaseError } = await supabase
        .from('business_use_cases')
        .select('id, slug')
        .in('slug', useCaseSlugs);

      if (!useCaseError && useCases && useCases.length > 0) {
        const useCaseIds = useCases.map(uc => uc.id);

        // Get technologies related to these use cases
        const { data: techUseCases, error: techUseCaseError } = await supabase
          .from('technology_use_cases')
          .select('technology_id, relevance_score')
          .in('use_case_id', useCaseIds)
          .order('relevance_score', { ascending: false });

        if (!techUseCaseError && techUseCases && techUseCases.length > 0) {
          // Create a map of technology IDs to relevance scores
          const techRelevanceMap = new Map<number, number>();
          
          for (const techUseCase of techUseCases) {
            const currentScore = techRelevanceMap.get(techUseCase.technology_id) || 0;
            techRelevanceMap.set(
              techUseCase.technology_id, 
              currentScore + techUseCase.relevance_score
            );
          }

          // Filter and sort technologies based on both impact and relevance to business goals
          filteredTechs = filteredTechs
            .filter(tech => techRelevanceMap.has(tech.technology_id))
            .sort((a, b) => {
              const aRelevance = techRelevanceMap.get(a.technology_id) || 0;
              const bRelevance = techRelevanceMap.get(b.technology_id) || 0;
              
              // Combine impact level and relevance score for sorting
              const aScore = (a.impact_level * 0.7) + (aRelevance * 0.3);
              const bScore = (b.impact_level * 0.7) + (bRelevance * 0.3);
              
              return bScore - aScore;
            });
        }
      }
    }

    // If we don't have enough technologies after filtering, fall back to the original list
    if (filteredTechs.length < 3) {
      filteredTechs = techImpacts as unknown as TechnologyImpact[];
    }

    // Take top 3 technologies
    const topTechs = filteredTechs.slice(0, 3);

    // Generate ROI results
    const results: ROIResult = {
      technologies: topTechs.map((tech, index) => {
        // Apply company size multiplier to ROI
        let roiMultiplier = 1;
        switch (inputs.companySize) {
          case 'small': roiMultiplier = 0.8; break;
          case 'medium': roiMultiplier = 1; break;
          case 'large': roiMultiplier = 1.2; break;
        }

        // Base ROI range on impact level
        const baseMin = 2 + (tech.impact_level * 0.2);
        const baseMax = 3 + (tech.impact_level * 0.3);

        // Apply multiplier
        const minRoi = baseMin * roiMultiplier;
        const maxRoi = baseMax * roiMultiplier;

        // Determine implementation difficulty based on maturity level
        let difficulty = 3;
        const techData = tech.ai_technologies as Technology;
        if (techData?.maturity_level === 'emerging') {
          difficulty = 5;
        } else if (techData?.maturity_level === 'growing') {
          difficulty = 4;
        } else if (techData?.maturity_level === 'established') {
          difficulty = 3;
        }

        // Determine time to value based on difficulty
        let timeToValue = '6-9 months';
        if (difficulty >= 5) {
          timeToValue = '12-18 months';
        } else if (difficulty >= 4) {
          timeToValue = '9-12 months';
        }

        // Generate resource requirements based on difficulty and company size
        let devs = difficulty - 1;
        let dataScientists = Math.max(1, Math.floor(difficulty / 2));
        let domainExperts = 1;

        // Adjust for company size
        if (inputs.companySize === 'large') {
          devs += 1;
          dataScientists += 1;
          domainExperts += 1;
        } else if (inputs.companySize === 'small') {
          devs = Math.max(1, devs - 1);
          dataScientists = Math.max(1, dataScientists - 1);
        }

        // Generate key metrics based on industry and business goals
        const keyMetrics = generateKeyMetrics(inputs.industry, inputs.businessGoals);

        return {
          name: techData?.name || `AI Technology ${index + 1}`,
          roiRange: {
            min: parseFloat(minRoi.toFixed(1)),
            max: parseFloat(maxRoi.toFixed(1))
          },
          implementationDifficulty: difficulty,
          timeToValue,
          resourceRequirements: {
            developers: devs,
            dataScientists,
            domainExperts
          },
          competitiveAdvantage: `${12 + (tech.impact_level * 1.5)}-month advantage over industry average`,
          keyMetrics: [
            keyMetrics[index * 2 % keyMetrics.length],
            keyMetrics[(index * 2 + 1) % keyMetrics.length]
          ]
        };
      }),
      industryContext: generateIndustryContext(inputs.industry)
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error calculating ROI:', error);
    return NextResponse.json(
      { error: 'Failed to calculate ROI' },
      { status: 500 }
    );
  }
}

// Generate mock results if database queries fail
function generateMockResults(inputs: CalculatorInputs) {
  console.log('Generating mock results for:', inputs);
  
  // Mock results similar to what we'd expect from the database
  const mockResults: ROIResult = {
    technologies: [
      {
        name: inputs.industry === 'healthcare' ? '医療ワークフロー自動化 AI' :
              inputs.industry === 'manufacturing' ? '製造プロセス自動化 AI' :
              inputs.industry === 'retail' ? '小売業務最適化 AI' :
              inputs.industry === 'food-service' ? '飲食店運営効率化 AI' :
              '業務プロセス自動化 AI',
        roiRange: {
          min: 3.5,
          max: 5.8
        },
        implementationDifficulty: 3,
        timeToValue: '6-9 months',
        resourceRequirements: {
          developers: 2,
          dataScientists: 1,
          domainExperts: 1
        },
        competitiveAdvantage: '18-month advantage over industry average',
        keyMetrics: [
          inputs.industry === 'healthcare' ? '42% 削減: 事務処理時間' :
          inputs.industry === 'manufacturing' ? '45% 削減: 品質検査時間' :
          inputs.industry === 'retail' ? '38% 向上: 顧客満足度' :
          inputs.industry === 'food-service' ? '35% 削減: 食材廃棄量' :
          '35% 向上: 業務効率',
          
          inputs.industry === 'healthcare' ? '28% 向上: 患者対応能力' :
          inputs.industry === 'manufacturing' ? '32% 向上: 生産ライン効率' :
          inputs.industry === 'retail' ? '25% 向上: リピート率' :
          inputs.industry === 'food-service' ? '28% 向上: 顧客満足度' :
          '28% 削減: 運営コスト'
        ]
      },
      {
        name: inputs.industry === 'healthcare' ? '予測型患者分析 AI' :
              inputs.industry === 'manufacturing' ? '予知保全 AI' :
              inputs.industry === 'retail' ? '顧客行動予測 AI' :
              inputs.industry === 'food-service' ? '需要予測・在庫最適化 AI' :
              '予測分析 AI',
        roiRange: {
          min: 2.8,
          max: 4.5
        },
        implementationDifficulty: 4,
        timeToValue: '9-12 months',
        resourceRequirements: {
          developers: 3,
          dataScientists: 2,
          domainExperts: 1
        },
        competitiveAdvantage: '12-month advantage over industry average',
        keyMetrics: [
          inputs.industry === 'healthcare' ? '32% 向上: 診断精度' :
          inputs.industry === 'manufacturing' ? '47% 削減: 設備ダウンタイム' :
          inputs.industry === 'retail' ? '32% 削減: 在庫管理コスト' :
          inputs.industry === 'food-service' ? '32% 削減: 注文処理時間' :
          '32% 向上: 意思決定速度',
          
          inputs.industry === 'healthcare' ? '25% 削減: 再入院率' :
          inputs.industry === 'manufacturing' ? '33% 向上: 設備寿命' :
          inputs.industry === 'retail' ? '28% 向上: 販売予測精度' :
          inputs.industry === 'food-service' ? '25% 向上: 客単価' :
          '25% 削減: 手作業時間'
        ]
      },
      {
        name: inputs.industry === 'healthcare' ? '医療画像診断 AI' :
              inputs.industry === 'manufacturing' ? '品質検査 AI' :
              inputs.industry === 'retail' ? '接客・販売支援 AI' :
              inputs.industry === 'food-service' ? '顧客体験向上 AI' :
              '顧客体験最適化 AI',
        roiRange: {
          min: 2.2,
          max: 3.8
        },
        implementationDifficulty: 5,
        timeToValue: '12-18 months',
        resourceRequirements: {
          developers: 4,
          dataScientists: 3,
          domainExperts: 2
        },
        competitiveAdvantage: '24-month advantage over industry average',
        keyMetrics: [
          inputs.industry === 'healthcare' ? '58% 向上: 診断速度' :
          inputs.industry === 'manufacturing' ? '41% 削減: 不良品率' :
          inputs.industry === 'retail' ? '35% 削減: 欠品率' :
          inputs.industry === 'food-service' ? '30% 削減: 在庫管理コスト' :
          '38% 向上: 顧客満足度',
          
          inputs.industry === 'healthcare' ? '30% 削減: 診断エラー' :
          inputs.industry === 'manufacturing' ? '26% 向上: サプライチェーン可視性' :
          inputs.industry === 'retail' ? '22% 向上: 客単価' :
          inputs.industry === 'food-service' ? '22% 向上: 回転率' :
          '30% 向上: 顧客生涯価値'
        ]
      }
    ],
    industryContext: generateIndustryContext(inputs.industry)
  };

  return NextResponse.json(mockResults);
}

// Generate industry context based on industry - tailored for Japanese SMBs
function generateIndustryContext(industry: string) {
  switch (industry) {
    case 'manufacturing':
      return {
        adoptionRate: 58,
        averageImplementationTime: 7,
        primaryChallenges: [
          'Integration with legacy manufacturing systems',
          'Worker training and skill development',
          'Initial investment costs'
        ]
      };
    case 'retail':
      return {
        adoptionRate: 62,
        averageImplementationTime: 5,
        primaryChallenges: [
          'Integration with existing POS systems',
          'Customer data privacy concerns',
          'Staff training and adoption'
        ]
      };
    case 'food-service':
      return {
        adoptionRate: 45,
        averageImplementationTime: 4,
        primaryChallenges: [
          'Limited technical expertise',
          'Integration with ordering systems',
          'Staff training and turnover'
        ]
      };
    case 'technology':
      return {
        adoptionRate: 78,
        averageImplementationTime: 6,
        primaryChallenges: [
          'Finding specialized AI talent',
          'Integration with existing tech stack',
          'Keeping pace with rapid AI advancements'
        ]
      };
    case 'professional-services':
      return {
        adoptionRate: 65,
        averageImplementationTime: 5,
        primaryChallenges: [
          'Client data privacy and security',
          'Integration with existing workflows',
          'Staff adoption and training'
        ]
      };
    case 'construction':
      return {
        adoptionRate: 42,
        averageImplementationTime: 8,
        primaryChallenges: [
          'Limited digital infrastructure',
          'Integration with project management systems',
          'Field worker adoption'
        ]
      };
    case 'healthcare':
      return {
        adoptionRate: 55,
        averageImplementationTime: 9,
        primaryChallenges: [
          'Patient data privacy and security',
          'Integration with medical systems',
          'Regulatory compliance'
        ]
      };
    case 'education':
      return {
        adoptionRate: 48,
        averageImplementationTime: 6,
        primaryChallenges: [
          'Limited budget for technology',
          'Teacher training and adoption',
          'Integration with existing learning systems'
        ]
      };
    case 'hospitality':
      return {
        adoptionRate: 52,
        averageImplementationTime: 5,
        primaryChallenges: [
          'Guest privacy concerns',
          'Integration with property management systems',
          'Staff training with high turnover'
        ]
      };
    case 'logistics':
      return {
        adoptionRate: 60,
        averageImplementationTime: 7,
        primaryChallenges: [
          'Integration with existing tracking systems',
          'Real-time data processing requirements',
          'Driver and warehouse staff adoption'
        ]
      };
    default:
      return {
        adoptionRate: 55,
        averageImplementationTime: 6,
        primaryChallenges: [
          'Limited technical expertise',
          'Initial investment costs',
          'Staff training and adoption'
        ]
      };
  }
}

// Generate key metrics based on industry and business goals - tailored for Japanese SMBs
function generateKeyMetrics(industry: string, businessGoals: string[]): string[] {
  // Industry-specific metrics for Japanese SMBs
  const metrics: Record<string, string[]> = {
    manufacturing: [
      '45% 削減: 品質検査時間',
      '32% 向上: 生産ライン効率',
      '28% 削減: 不良品率',
      '35% 削減: 在庫管理コスト',
      '25% 向上: 設備稼働率',
      '38% 削減: 保守点検時間',
      '30% 向上: 生産計画精度',
      '22% 削減: エネルギー消費'
    ],
    retail: [
      '38% 向上: 顧客満足度',
      '25% 向上: リピート率',
      '32% 削減: 在庫管理コスト',
      '28% 向上: 販売予測精度',
      '35% 削減: 欠品率',
      '22% 向上: 客単価',
      '30% 削減: 発注業務時間',
      '26% 向上: 店舗スタッフ生産性'
    ],
    'food-service': [
      '35% 削減: 食材廃棄量',
      '28% 向上: 顧客満足度',
      '32% 削減: 注文処理時間',
      '25% 向上: 客単価',
      '30% 削減: 在庫管理コスト',
      '22% 向上: 回転率',
      '26% 削減: スタッフ配置コスト',
      '20% 向上: メニュー最適化'
    ],
    technology: [
      '42% 向上: 開発速度',
      '35% 削減: バグ発生率',
      '30% 向上: コード品質',
      '28% 削減: サポート問い合わせ',
      '32% 向上: ユーザーエンゲージメント',
      '25% 削減: インフラコスト',
      '38% 向上: セキュリティ対策',
      '22% 削減: リリースサイクル時間'
    ],
    'professional-services': [
      '38% 削減: 文書処理時間',
      '32% 向上: 顧客対応速度',
      '28% 削減: 管理業務コスト',
      '25% 向上: 顧客満足度',
      '35% 削減: 報告書作成時間',
      '22% 向上: 案件処理能力',
      '30% 削減: ミス発生率',
      '26% 向上: スタッフ生産性'
    ],
    construction: [
      '35% 削減: 工程管理時間',
      '28% 向上: 安全性',
      '32% 削減: 材料廃棄率',
      '25% 向上: 工期遵守率',
      '30% 削減: 設計変更対応時間',
      '22% 向上: 資源利用効率',
      '26% 削減: 検査時間',
      '20% 向上: 作業効率'
    ],
    healthcare: [
      '38% 削減: 事務処理時間',
      '32% 向上: 患者対応能力',
      '28% 削減: 待ち時間',
      '25% 向上: 診断精度',
      '35% 削減: カルテ入力時間',
      '22% 向上: 患者満足度',
      '30% 削減: 医療ミス',
      '26% 向上: 予防医療効果'
    ],
    education: [
      '35% 向上: 学習成果',
      '28% 削減: 管理業務時間',
      '32% 向上: 学生エンゲージメント',
      '25% 削減: 教材準備時間',
      '30% 向上: 個別指導効果',
      '22% 削減: 中退率',
      '26% 向上: 教師の生産性',
      '20% 削減: 運営コスト'
    ],
    hospitality: [
      '38% 向上: 顧客満足度',
      '32% 削減: チェックイン/アウト時間',
      '28% 向上: 客室稼働率',
      '25% 削減: 予約管理コスト',
      '35% 向上: リピート率',
      '22% 削減: エネルギー消費',
      '30% 向上: スタッフ効率',
      '26% 削減: 食材廃棄量'
    ],
    logistics: [
      '42% 削減: 配送計画時間',
      '35% 向上: 配送精度',
      '30% 削減: 燃料消費',
      '28% 向上: 車両稼働率',
      '32% 削減: 在庫管理コスト',
      '25% 向上: 配送ルート最適化',
      '38% 削減: 荷物追跡時間',
      '22% 向上: 顧客満足度'
    ]
  };

  // Business goal-specific metrics
  const goalMetrics: Record<string, string[]> = {
    efficiency: [
      '35% 削減: 業務処理時間',
      '28% 向上: スタッフ生産性',
      '32% 削減: 管理業務コスト',
      '25% 向上: プロセス最適化'
    ],
    labor: [
      '38% 削減: 人手による単純作業',
      '32% 向上: 従業員一人当たりの生産性',
      '28% 削減: 採用コスト',
      '25% 向上: 従業員満足度'
    ],
    customer: [
      '35% 向上: 顧客満足度',
      '28% 削減: 対応時間',
      '32% 向上: リピート率',
      '25% 削減: クレーム数'
    ],
    cost: [
      '38% 削減: 運営コスト',
      '32% 向上: 資源利用効率',
      '28% 削減: 廃棄率',
      '25% 向上: 予算管理精度'
    ],
    quality: [
      '35% 削減: 不良品率',
      '28% 向上: 品質一貫性',
      '32% 削減: 検査時間',
      '25% 向上: 顧客評価'
    ],
    digital: [
      '38% 削減: 紙書類処理',
      '32% 向上: デジタルプロセス導入率',
      '28% 削減: 手作業時間',
      '25% 向上: データ活用度'
    ],
    local: [
      '35% 向上: 地域顧客獲得',
      '28% 削減: 地域マーケティングコスト',
      '32% 向上: 地域ブランド認知度',
      '25% 削減: 地域競合との差別化コスト'
    ],
    supply: [
      '38% 向上: サプライチェーン可視性',
      '32% 削減: 在庫保持コスト',
      '28% 向上: 納期遵守率',
      '25% 削減: 調達コスト'
    ],
    compliance: [
      '35% 削減: コンプライアンス違反リスク',
      '28% 向上: 規制対応速度',
      '32% 削減: 監査準備時間',
      '25% 向上: 法令遵守体制'
    ]
  };

  // Combine industry metrics with goal-specific metrics
  let combinedMetrics = metrics[industry] || [];
  
  // Add goal-specific metrics
  businessGoals.forEach(goal => {
    if (goalMetrics[goal]) {
      combinedMetrics = [...combinedMetrics, ...goalMetrics[goal]];
    }
  });
  
  // If we still don't have enough metrics, add default ones
  if (combinedMetrics.length < 8) {
    const defaultMetrics = [
      '35% 向上: 業務効率',
      '28% 削減: 運営コスト',
      '32% 向上: 意思決定速度',
      '25% 削減: 手作業時間',
      '30% 向上: 従業員生産性',
      '22% 削減: エラー発生率',
      '26% 向上: 資源活用効率',
      '20% 削減: 市場投入時間'
    ];
    combinedMetrics = [...combinedMetrics, ...defaultMetrics];
  }
  
  // Return a unique set of metrics, limited to 8
  return [...new Set(combinedMetrics)].slice(0, 8);
}