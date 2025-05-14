'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NewsItem } from '@/types/news';

interface TechnicalInsightProps {
  newsItem: NewsItem;
  technologies?: any[];
}

export function TechnicalInsight({ newsItem, technologies = [] }: TechnicalInsightProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Generate technical insight based on the article and detected technologies
  const generateInsight = () => {
    if (!newsItem || technologies.length === 0) {
      return "No technical insights available for this article.";
    }
    
    const techNames = technologies.map(t => t.name).join(', ');
    
    // This is a simplified version - in a real implementation, you would use more
    // sophisticated NLP or even an AI service to generate insights
    return `
      This article discusses ${techNames}. 
      
      Key technical aspects:
      - Implementation details of ${technologies[0]?.name || 'this technology'}
      - Potential applications in real-world scenarios
      - Comparison with existing approaches
      
      This development could impact related fields such as ${
        technologies.length > 1 ? technologies[1].name : 'related AI domains'
      }.
    `;
  };
  
  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
      >
        <span className="pixel-font">
          {expanded ? 'HIDE TECHNICAL INSIGHT' : 'SHOW TECHNICAL INSIGHT'}
        </span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>
      
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 bg-green-400/10 border border-green-400/30 rounded p-4 text-green-300 whitespace-pre-line"
        >
          {generateInsight()}
        </motion.div>
      )}
    </div>
  );
}