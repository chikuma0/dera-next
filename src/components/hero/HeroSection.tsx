'use client';

import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import MatrixBackground from './MatrixBackground';

const HeroSection = () => {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  const phrases = [
    'Transforming Impossible to Inevitable',
    'Bridging Business and AI',
    'Creating Future-Ready Solutions'
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
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-green-400 flex flex-col items-center justify-center p-4">
      <MatrixBackground />
      
      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl"