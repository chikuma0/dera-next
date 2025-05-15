'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import components that use browser APIs
const MatrixBackground = dynamic(
  () => import('./MatrixBackground'),
  { ssr: false }
);

const MatrixNewsTicker = dynamic(
  () => import('./MatrixNewsTicker'),
  { ssr: false }
);

const TYPING_PHRASES = [
  'AI Horsepower for Distributed Era',
  'Transforming Impossible to Inevitable',
  'Bridging Business and AI',
  'Build Future-Ready Solutions'
];

const HeroSection = () => {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  const phrases = useMemo(() => TYPING_PHRASES, []);
  
  useEffect(() => {
    // Set isClient to true when component mounts on the client
    setIsClient(true);
    
    // Don't run typing effect on server
    if (!isClient) return;
    
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
        typeSpeed = 2000; // Pause at the end
        isDeleting = true;
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        typeSpeed = 500; // Pause before starting new phrase
      }

      timeoutId = setTimeout(type, typeSpeed);
    };

    type();
    
    // Cursor blink effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(cursorInterval);
    };
  }, [phrases, isClient]);
  
  // Don't render anything on the server
  if (!isClient) {
    return (
      <div className="relative min-h-screen bg-black text-green-400 flex flex-col items-center justify-center p-4">
        {/* Just a placeholder with the same dimensions */}
        <div className="w-full h-full absolute top-0 left-0" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-green-400 flex flex-col items-center justify-center p-4">
      <MatrixBackground />
      
      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl"
      >
        <div className="mb-6">
          <Terminal className="inline-block w-16 h-16 mb-4" />
        </div>
        
        <h1 className="text-5xl font-bold mb-6 min-h-24">
          {text}
          <span 
            className={`inline-block w-2 h-8 ml-1 bg-green-400 transition-opacity duration-300 ${
              showCursor ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl mb-12 text-green-300"
        >
          Leveraging AI to transform your business vision into reality
        </motion.p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <Link href="/solutions" className="block">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-3 bg-green-400 text-black font-medium rounded-md hover:bg-green-300 transition-colors"
            >
              Our Solutions
            </motion.button>
          </Link>
          
          <Link href="/contact" className="block">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-3 border-2 border-green-400 text-green-400 font-medium rounded-md hover:bg-green-400/10 transition-colors"
            >
              Contact Us
            </motion.button>
          </Link>
        </div>
      </motion.div>
      
      <div className="absolute bottom-8 left-0 right-0">
        <MatrixNewsTicker />
      </div>
    </div>
  );
};

export default HeroSection;