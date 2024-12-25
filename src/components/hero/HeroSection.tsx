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
    <section className="relative h-screen flex flex-col">
      <MatrixBackground />
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4 text-green-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to DERA
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-green-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your AI-powered news aggregator
          </motion.p>
        </div>
      </div>
      <div className="relative z-10">
        <NewsTicker items={news} />
      </div>
    </section>
  );
};

export default HeroSection;