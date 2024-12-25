'use client';

import React from 'react';

const HeroSection = () => {
  return (
    <section className="h-screen flex items-center justify-center bg-black text-green-400">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Dera</h1>
        <p className="text-xl md:text-2xl">Your AI-powered news aggregator</p>
      </div>
    </section>
  );
};

export default HeroSection;