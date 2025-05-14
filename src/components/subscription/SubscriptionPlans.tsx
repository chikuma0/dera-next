"use client";

import React, { useState, useEffect } from 'react';
import { CheckIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionTier } from '@/lib/auth/subscriptionService';

interface PlanFeature {
  title: string;
  tiers: {
    [key in SubscriptionTier]?: boolean;
  };
}

const FEATURES: PlanFeature[] = [
  {
    title: 'AIニュースの閲覧',
    tiers: {
      [SubscriptionTier.FREE]: true,
      [SubscriptionTier.PROFESSIONAL]: true,
      [SubscriptionTier.TEAM]: true,
      [SubscriptionTier.ENTERPRISE]: true,
    },
  },
  {
    title: '基本的なAIトレンド分析',
    tiers: {
      [SubscriptionTier.FREE]: true,
      [SubscriptionTier.PROFESSIONAL]: true,
      [SubscriptionTier.TEAM]: true,
      [SubscriptionTier.ENTERPRISE]: true,
    },
  },
  {
    title: '実装ガイド（基本）',
    tiers: {
      [SubscriptionTier.FREE]: false,
      [SubscriptionTier.PROFESSIONAL]: true,
      [SubscriptionTier.TEAM]: true,
      [SubscriptionTier.ENTERPRISE]: true,
    },
  },
  {
    title: '実装ガイド（詳細）',
    tiers: {
      [SubscriptionTier.FREE]: false,
      [SubscriptionTier.PROFESSIONAL]: true,
      [SubscriptionTier.TEAM]: true,
      [SubscriptionTier.ENTERPRISE]: true,
    },
  },
  {
    title: '日本市場向けのAI実装例',
    tiers: {
      [SubscriptionTier.FREE]: false,
      [SubscriptionTier.PROFESSIONAL]: true,
      [SubscriptionTier.TEAM]: true,
      [SubscriptionTier.ENTERPRISE]: true,
    },
  },
  {
    title: 'パーソナライズされたアラート',
    tiers: {
      [SubscriptionTier.FREE]: false,
      [SubscriptionTier.PROFESSIONAL]: true,
      [SubscriptionTier.TEAM]: true,
      [SubscriptionTier.ENTERPRISE]: true,
    },
  },
  {
    title: 'チーム共有機能',
    tiers: {
      [SubscriptionTier.FREE]: false,
      [SubscriptionTier.PROFESSIONAL]: false,
      [SubscriptionTier.TEAM]: true,
      [SubscriptionTier.ENTERPRISE]: true,
    },
  },
  {
    title: '実装コンサルティング',
    tiers: {
      [SubscriptionTier.FREE]: false,
      [SubscriptionTier.PROFESSIONAL]: false,
      [SubscriptionTier.TEAM]: false,
      [SubscriptionTier.ENTERPRISE]: true,
    },
  },
  {
    title: '専用APIアクセス',
    tiers: {
      [SubscriptionTier.FREE]: false,
      [SubscriptionTier.PROFESSIONAL]: false,
      [SubscriptionTier.TEAM]: false,
      [SubscriptionTier.ENTERPRISE]: true,
    },
  },
  {
    title: 'プライベートブリーフィング',
    tiers: {
      [SubscriptionTier.FREE]: false,
      [SubscriptionTier.PROFESSIONAL]: false,
      [SubscriptionTier.TEAM]: false,
      [SubscriptionTier.ENTERPRISE]: true,
    },
  },
];

const PLAN_DETAILS = {
  [SubscriptionTier.FREE]: {
    title: '無料プラン',
    price: 0,
    description: '基本的なAIニュースとトレンド分析',
    buttonText: '現在のプラン',
    isPopular: false,
  },
  [SubscriptionTier.PROFESSIONAL]: {
    title: 'プロフェッショナル',
    price: 2500,
    description: '個人向けの高度なAI活用支援',
    buttonText: 'アップグレード',
    isPopular: true,
  },
  [SubscriptionTier.TEAM]: {
    title: 'チーム',
    price: 10000,
    description: '5ユーザーまでのチーム向け共有機能',
    buttonText: 'アップグレード',
    isPopular: false,
  },
  [SubscriptionTier.ENTERPRISE]: {
    title: 'エンタープライズ',
    price: 50000,
    description: '組織全体のAI導入を支援',
    buttonText: 'お問い合わせ',
    isPopular: false,
  },
};

export function SubscriptionPlans() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, subscription, upgradeSubscription } = useAuth();
  
  useEffect(() => {
    if (subscription) {
      setSelectedTier(subscription.tier);
    } else {
      setSelectedTier(SubscriptionTier.FREE);
    }
  }, [subscription]);
  
  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!user) {
      window.location.href = '/auth/sign-in?redirect=/subscription';
      return;
    }
    
    if (tier === SubscriptionTier.ENTERPRISE) {
      window.location.href = '/contact?plan=enterprise';
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const success = await upgradeSubscription(tier);
      
      if (!success) {
        setError('サブスクリプションの更新に失敗しました。もう一度お試しください。');
      }
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          サブスクリプションプラン
        </h2>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          あなたのニーズに合わせた柔軟なプランをご用意しています
        </p>
      </div>
      
      <div className="mt-12 flex justify-center">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-0.5 flex">
          <button
            type="button"
            className={`${
              billing === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            } relative py-2 px-6 border border-transparent rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 sm:w-auto`}
            onClick={() => setBilling('monthly')}
          >
            月払い
          </button>
          <button
            type="button"
            className={`${
              billing === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            } relative py-2 px-6 border border-transparent rounded-md text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 sm:w-auto`}
            onClick={() => setBilling('yearly')}
          >
            年払い (20%オフ)
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-6 mx-auto max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
        {Object.values(SubscriptionTier).map((tier) => {
          const plan = PLAN_DETAILS[tier];
          const isCurrentPlan = selectedTier === tier;
          
          return (
            <div 
              key={tier}
              className={`${
                plan.isPopular
                  ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400'
                  : 'border-gray-200 dark:border-gray-700'
              } rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700 flex flex-col`}
            >
              {plan.isPopular && (
                <div className="absolute z-10 top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    人気
                  </span>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plan.title}</h3>
                
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    ¥{plan.price.toLocaleString()}
                  </span>
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                    /{billing === 'monthly' ? '月' : '年'}
                  </span>
                </p>
                
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {plan.description}
                </p>
                
                <button
                  type="button"
                  onClick={() => handleUpgrade(tier as SubscriptionTier)}
                  disabled={isCurrentPlan || isProcessing}
                  className={`${
                    isCurrentPlan
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  } mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium text-white`}
                >
                  {isCurrentPlan ? '現在のプラン' : plan.buttonText}
                </button>
              </div>
              
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  含まれる機能
                </h4>
                <ul className="mt-6 space-y-4">
                  {FEATURES.map((feature) => {
                    // Only show feature if this tier has it defined (either true or false)
                    if (!(tier in feature.tiers)) return null;
                    
                    const included = feature.tiers[tier as SubscriptionTier];
                    
                    return (
                      <li key={feature.title} className="flex">
                        <span className={`${
                          included ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
                        } flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center`}>
                          {included && <CheckIcon className="h-3.5 w-3.5 text-white" />}
                        </span>
                        <span className={`${
                          included 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-400 dark:text-gray-500 line-through'
                        } ml-3 text-sm`}>
                          {feature.title}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 