'use client';

import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { motion, MotionProps } from 'framer-motion';
import MatrixBackground from './MatrixBackground';

type MotionDivProps = MotionProps & React.HTMLAttributes<HTMLDivElement>;
type MotionSpanProps = MotionProps & React.HTMLAttributes<HTMLSpanElement>;

const HeroSection = () => {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  const phrases = [
    'Creating Future-Ready Solutions',
    'Transforming Impossible to Inevitable',
    'Bridging Business and AI'
  ];
  
  useEffect(() => {
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      const currentPhrase = phrases[currentPhraseIndex];
      
      if (isDeleting) {
        setText(currentPhrase.substring(0, currentCharIndex - 1));
        currentCharIndex--;
      } else {
        setText(currentPhrase.substring(0, currentCharIndex + 1));
        currentCharIndex++;
      }

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && currentCharIndex === currentPhrase.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        typeSpeed = 500;
      }

      timeoutId = setTimeout(type, typeSpeed);
    };

    type();
    
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-green-400 flex flex-col items-center justify-center p-4">
      <MatrixBackground />
      <div className="relative z-10 text-center max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6">
            <Terminal className="inline-block w-16 h-16 mb-4" />
          </div>
          
          <h1 className="text-5xl font-bold mb-6 min-h-24 font-mono">
            {text}
            <span className={`inline-block w-2 h-8 ml-1 bg-green-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
            </span>
          </h1>
          
          <div className="text-xl mb-12 text-green-300">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Leveraging AI to transform your business vision into reality
            </motion.span>
          </div>
          
          <div className="flex justify-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="bg-green-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-green-300 transition-colors">
                Explore Solutions
              </button>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="border-2 border-green-400 px-8 py-3 rounded-lg font-semibold hover:bg-green-400 hover:text-black transition-colors">
                View Portfolio
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;