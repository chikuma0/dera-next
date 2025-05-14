"use client";

import React, { useState } from 'react';
import { ArrowLeft, Star, Clock, Code, BookOpen, Database, Link2, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { ImplementationBlueprint, BlueprintDifficulty, ProgrammingLanguage, ResourceType } from '@/types/blueprint';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface BlueprintDetailProps {
  blueprint: ImplementationBlueprint;
  onRating?: (rating: number, comment?: string) => Promise<boolean>;
}

// Programming language display names
const LANGUAGE_DISPLAY: Record<ProgrammingLanguage, string> = {
  'python': 'Python',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'java': 'Java',
  'csharp': 'C#',
  'rust': 'Rust',
  'go': 'Go',
  'ruby': 'Ruby',
  'php': 'PHP'
};

// Resource type display info
const RESOURCE_TYPE_DISPLAY: Record<ResourceType, { label: string; bgColor: string; textColor: string; letter: string }> = {
  'documentation': { label: 'ドキュメント', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400', letter: 'D' },
  'video': { label: '動画', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-600 dark:text-red-400', letter: 'V' },
  'article': { label: '記事', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400', letter: 'A' },
  'github': { label: 'GitHub', bgColor: 'bg-gray-100 dark:bg-gray-700', textColor: 'text-gray-600 dark:text-gray-400', letter: 'G' },
  'api': { label: 'API', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-600 dark:text-purple-400', letter: 'A' },
  'tool': { label: 'ツール', bgColor: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-600 dark:text-amber-400', letter: 'T' }
};

export function BlueprintDetail({ blueprint, onRating }: BlueprintDetailProps) {
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  const {
    title,
    description,
    category,
    difficulty,
    estimatedTime,
    programmingLanguages,
    prerequisites,
    steps,
    resources,
    japaneseContext,
    rating,
    ratingCount
  } = blueprint;
  
  const handleRating = async () => {
    if (!currentRating || !onRating || !user) return;
    
    setIsSubmitting(true);
    setRatingError(null);
    
    try {
      const success = await onRating(currentRating, comment);
      
      if (success) {
        setRatingSuccess(true);
        // Reset form after successful submission
        setComment('');
      } else {
        setRatingError('評価の送信中にエラーが発生しました。後でもう一度お試しください。');
      }
    } catch (error) {
      setRatingError('予期せぬエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/blueprints"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          実装ガイド一覧に戻る
        </Link>
      </div>
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Difficulty badge */}
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
            ${difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
            ${difficulty === 'advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
          `}>
            {difficulty === 'beginner' && '初級'}
            {difficulty === 'intermediate' && '中級'}
            {difficulty === 'advanced' && '上級'}
          </span>
          
          {/* Category badge */}
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            {category}
          </span>
          
          {/* Time estimate */}
          {estimatedTime && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              <Clock className="w-3 h-3 mr-1" />
              {estimatedTime}時間
            </span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center mr-4">
            <Star className="w-5 h-5 text-yellow-400 mr-1" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {rating ? (rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)) : 'N/A'}
            </span>
            {ratingCount !== undefined && ratingCount > 0 && (
              <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                ({ratingCount} 件のレビュー)
              </span>
            )}
          </div>
        </div>
        
        {/* Programming languages */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">プログラミング言語</h3>
          <div className="flex flex-wrap gap-2">
            {programmingLanguages.map((lang) => (
              <span 
                key={lang}
                className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              >
                <Code className="w-4 h-4 mr-1" />
                {LANGUAGE_DISPLAY[lang as ProgrammingLanguage] || lang}
              </span>
            ))}
          </div>
        </div>
        
        {/* Prerequisites */}
        {prerequisites.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">前提条件</h3>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
              {prerequisites.map((prerequisite) => (
                <li key={prerequisite.id}>
                  <strong>{prerequisite.title}</strong>
                  {prerequisite.description && ` - ${prerequisite.description}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Japanese Context */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-500" />
          日本市場向けの実装ポイント
        </h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">文化的考慮事項</h3>
          <p className="text-gray-600 dark:text-gray-300">{japaneseContext.culturalConsiderations}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">法規制・ガイドライン</h3>
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-gray-600 dark:text-gray-300">{japaneseContext.regulatoryNotes}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">日本市場への適応</h3>
          <p className="text-gray-600 dark:text-gray-300">{japaneseContext.localMarketAdaptation}</p>
        </div>
        
        {japaneseContext.successExamples && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">成功事例</h3>
            <p className="text-gray-600 dark:text-gray-300">{japaneseContext.successExamples}</p>
          </div>
        )}
      </div>
      
      {/* Implementation Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-green-500" />
          実装手順
        </h2>
        
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.id} className="relative">
              {/* Step number indicator */}
              <div className="absolute top-0 left-0 -ml-6 mt-1 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-800 dark:text-green-400 font-semibold">{step.order}</span>
              </div>
              
              <div className="ml-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{step.description}</p>
                
                {/* Code block */}
                {step.codeBlock && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 mb-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-300 font-mono">
                      {step.codeBlock.code}
                    </pre>
                  </div>
                )}
                
                {/* Images if available */}
                {step.images && step.images.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {step.images.map((image, idx) => (
                      <Image
                        key={idx}
                        src={image}
                        alt={`${step.title} visualization`}
                        width={800}
                        height={400}
                        className="w-full h-auto rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Resources */}
      {resources.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-purple-500" />
            実装リソース
          </h2>
          
          <div className="space-y-4">
            {resources.map((resource) => {
              const typeInfo = RESOURCE_TYPE_DISPLAY[resource.type as ResourceType] || {
                label: 'その他',
                bgColor: 'bg-gray-100 dark:bg-gray-700',
                textColor: 'text-gray-600 dark:text-gray-400',
                letter: 'O'
              };
              
              return (
                <div key={resource.id} className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className={`w-8 h-8 rounded-full ${typeInfo.bgColor} flex items-center justify-center ${typeInfo.textColor}`}>
                      {typeInfo.letter}
                    </div>
                  </div>
                  
                  <div>
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-lg font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                      {resource.title}
                      <Link2 className="w-4 h-4 ml-1" />
                    </a>
                    
                    {resource.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{resource.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Rating Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">評価を送信する</h2>
        
        {user ? (
          <>
            {ratingSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-4 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-green-700 dark:text-green-300 font-medium">評価をいただきありがとうございます！</p>
                  <p className="text-green-600 dark:text-green-400 text-sm">あなたのフィードバックは今後のガイド改善に役立てられます。</p>
                </div>
              </div>
            ) : (
              <>
                {ratingError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
                    <p className="text-red-700 dark:text-red-300">{ratingError}</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">このガイドの評価をお願いします</p>
                  
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCurrentRating(star)}
                        className={`w-8 h-8 ${
                          currentRating && star <= currentRating
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                        disabled={isSubmitting}
                      >
                        <Star className="w-full h-full" fill={currentRating && star <= currentRating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    コメント（オプション）
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    placeholder="このガイドについてのフィードバックをお書きください..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleRating}
                  disabled={!currentRating || isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '送信中...' : '評価を送信'}
                </button>
              </>
            )}
          </>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <p className="text-blue-700 dark:text-blue-300">
              評価を送信するには<Link href="/auth/sign-in" className="font-medium underline">ログイン</Link>してください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 