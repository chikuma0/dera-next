'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const columnsRef = useRef<number>(0);
  const dropsRef = useRef<number[]>([]);
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
  const fontSize = 18;
  const speed = 0.5; // Lower is slower

  // Initialize canvas and drops
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size
    const setCanvasSize = () => {
      if (typeof window === 'undefined') return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      
      // Recalculate columns when window resizes
      columnsRef.current = Math.floor(rect.width / fontSize);
      dropsRef.current = Array(columnsRef.current).fill(0).map(() => Math.random() * -100);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate delta time for consistent animation speed
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // Only update every 2 frames to slow down the animation
    frameCountRef.current++;
    if (frameCountRef.current % 2 !== 0) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Set semi-transparent background for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text style
    ctx.fillStyle = '#0F0';
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'center';

    // Draw characters
    for (let i = 0; i < dropsRef.current.length; i++) {
      // Pick a random character
      const text = chars[Math.floor(Math.random() * chars.length)];
      
      // Calculate position
      const x = i * fontSize + fontSize / 2;
      const y = dropsRef.current[i] * fontSize;
      
      // Draw character with gradient
      const gradient = ctx.createLinearGradient(0, y - fontSize, 0, y);
      gradient.addColorStop(0, '#0F0');
      gradient.addColorStop(0.5, '#0C0');
      gradient.addColorStop(1, '#090');
      
      ctx.fillStyle = gradient;
      ctx.fillText(text, x, y);
      
      // Reset drop if it reaches the bottom or randomly
      if (y > canvas.height && Math.random() > 0.975) {
        dropsRef.current[i] = 0;
      }
      
      // Move drop down
      dropsRef.current[i] += speed;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Initialize and start animation
  useEffect(() => {
    setIsClient(true);
    
    if (!isClient) return;
    
    const cleanupCanvas = initCanvas();
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      cleanupCanvas?.();
    };
  }, [isClient, initCanvas, animate]);

  // Don't render on server
  if (!isClient) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full opacity-20 pointer-events-none"
      style={{
        zIndex: 0,
        mixBlendMode: 'screen',
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
};

export default MatrixBackground;