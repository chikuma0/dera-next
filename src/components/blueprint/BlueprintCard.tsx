"use client";

import React from 'react';
import Link from 'next/link';
import { Star, Clock, ChevronRight, Code } from 'lucide-react';
import { 
  ImplementationBlueprint,
  BlueprintDifficulty,
  ProgrammingLanguage
} from '@/types/blueprint';

interface BlueprintCardProps {
  blueprint: ImplementationBlueprint;
}

// Difficulty level colors
const DIFFICULTY_COLORS: Record<BlueprintDifficulty, string> = {
  'beginner': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'intermediate': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'advanced': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
};

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

export function BlueprintCard({ blueprint }: BlueprintCardProps) {
  const {
    id,
    title,
    description,
    difficulty,
    estimatedTime,
    rating,
    programmingLanguages
  } = blueprint;
  
  // Format the rating as a single digit if it's a whole number, otherwise one decimal place
  const formattedRating = rating ? 
    (rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)) : 
    'N/A';
  
  return (
    <Link 
      href={`/blueprints/${id}`}
      className="block group"
    >
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full bg-white dark:bg-gray-800">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex space-x-2">
              {/* Difficulty badge */}
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[difficulty]}`}>
                {difficulty === 'beginner' && '初級'}
                {difficulty === 'intermediate' && '中級'}
                {difficulty === 'advanced' && '上級'}
              </span>
              
              {/* Time estimate */}
              {estimatedTime && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  <Clock className="w-3 h-3 mr-1" />
                  {estimatedTime}時間
                </span>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {formattedRating}
              </span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {description}
          </p>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              {/* Programming languages */}
              {programmingLanguages.slice(0, 2).map((lang) => (
                <span 
                  key={lang}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  <Code className="w-3 h-3 mr-1" />
                  {LANGUAGE_DISPLAY[lang as ProgrammingLanguage] || lang}
                </span>
              ))}
              {programmingLanguages.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  +{programmingLanguages.length - 2}
                </span>
              )}
            </div>
            
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform duration-200 inline-flex items-center">
              詳細を見る
              <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 