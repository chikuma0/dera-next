'use client';

import React from 'react';
import ROICalculator from '@/components/roi/ROICalculator';
import { useTranslation } from '@/contexts/LanguageContext';

export default function ROIPageContent() {
  const { translate, locale } = useTranslation();
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-green-400 mb-4">
            {locale === 'ja' ? 'AI ROI計算ツール' : 'AI ROI Calculator'}
          </h1>
          <p className="text-green-300/80 max-w-3xl mx-auto">
            {locale === 'ja' 
              ? '中小企業向けAI投資対効果シミュレーション - 貴社の業種と経営課題に基づいた最適なAI技術の導入効果を簡単に算出します。'
              : 'Discover the potential return on investment for implementing AI technologies in your business. Get personalized recommendations based on your industry and business goals.'}
          </p>
        </div>
        
        <ROICalculator />
        
        <div className="mt-12 bg-black/40 border border-green-400/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-400 mb-4">
            {locale === 'ja' ? 'ご利用方法' : 'How It Works'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/60 p-4 rounded-lg border border-green-400/20">
              <div className="text-green-400 font-bold mb-2">
                {locale === 'ja' ? '1. 基本情報の入力' : '1. Input Your Details'}
              </div>
              <p className="text-green-300/70 text-sm">
                {locale === 'ja'
                  ? '業種、企業規模、経営課題を選択するだけで、貴社に最適な分析が可能です。専門知識は不要です。'
                  : 'Select your industry, company size, and key business goals to customize your analysis.'}
              </p>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-green-400/20">
              <div className="text-green-400 font-bold mb-2">
                {locale === 'ja' ? '2. AI分析' : '2. AI Analysis'}
              </div>
              <p className="text-green-300/70 text-sm">
                {locale === 'ja'
                  ? '業界動向、技術影響度、ビジネス活用事例を分析し、中小企業に最適なAI技術を特定します。'
                  : 'Our system analyzes industry trends, technology impacts, and business use cases to generate personalized recommendations.'}
              </p>
            </div>
            <div className="bg-black/60 p-4 rounded-lg border border-green-400/20">
              <div className="text-green-400 font-bold mb-2">
                {locale === 'ja' ? '3. 投資計画の取得' : '3. Get Your Roadmap'}
              </div>
              <p className="text-green-300/70 text-sm">
                {locale === 'ja'
                  ? '投資対効果予測、導入スケジュール、具体的な次のステップを含む詳細なAI投資ロードマップを取得できます。'
                  : 'Receive a detailed AI investment roadmap with ROI projections, implementation timelines, and strategic recommendations.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}