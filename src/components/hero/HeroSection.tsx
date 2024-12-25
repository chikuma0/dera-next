'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MatrixBackground from './MatrixBackground';
import { NewsTicker } from '../news/NewsTicker';
import type { NewsItem } from '@/types';

interface HeroSectionProps {
  news: NewsItem[];
}

const HeroSection = ({ news }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Matrix Background with full coverage */}
      <div className="absolute inset-0 z-0">
        <MatrixBackground />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Logo */}
        <motion.div 
          className="absolute top-8 left-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-green-400">DERA</h1>
        </motion.div>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 text-green-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Creating Future-Ready Solutions!
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-green-400 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Leveraging AI to transform your business vision into reality
            </motion.p>
            <motion.div 
              className="flex gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button className="px-6 py-3 bg-green-400 text-black font-semibold rounded hover:bg-green-300 transition-colors">
                Explore Solutions
              </button>
              <button className="px-6 py-3 border border-green-400 text-green-400 font-semibold rounded hover:bg-green-400/10 transition-colors">
                View Portfolio
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex gap-20 mt-20 text-green-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="text-center">
              <p className="text-3xl font-bold">100x</p>
              <p className="text-sm">Business Growth</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm">Industries Transformed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">∞</p>
              <p className="text-sm">Possibilities</p>
            </div>
          </motion.div>
        </div>

        {/* News Ticker - Fixed to bottom */}
        <div className="w-full">
          <NewsTicker items={news} />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;