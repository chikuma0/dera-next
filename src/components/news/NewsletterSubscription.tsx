'use client';

import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';

export function NewsletterSubscription({ 
  color = 'blue'
}: { 
  color?: 'blue' | 'purple'
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after the component mounts
  // This helps prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const bgGradient = color === 'blue' 
    ? 'from-blue-900/20 to-teal-900/20' 
    : 'from-purple-900/20 to-indigo-900/20';
  
  const borderColor = color === 'blue' ? 'border-blue-500/30' : 'border-purple-500/30';
  const iconBgColor = color === 'blue' ? 'bg-blue-500/20' : 'bg-purple-500/20';
  const iconTextColor = color === 'blue' ? 'text-blue-400' : 'text-purple-400';
  const titleColor = color === 'blue' ? 'text-blue-400' : 'text-purple-400';
  const descriptionColor = color === 'blue' ? 'text-blue-300/80' : 'text-purple-300/80';
  const inputBorderColor = color === 'blue' ? 'border-blue-500/30' : 'border-purple-500/30';
  const inputFocusBorderColor = color === 'blue' ? 'focus:border-blue-500' : 'focus:border-purple-500';
  const buttonBgColor = color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700';
  const successColor = color === 'blue' ? 'text-green-400' : 'text-green-400';
  const errorColor = color === 'blue' ? 'text-red-400' : 'text-red-400';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      // Mock subscription - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Thanks for subscribing! Check your inbox for updates.' });
      setEmail('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-[160px]"></div>;
  }

  return (
    <div className={`bg-gradient-to-br ${bgGradient} p-6 rounded-lg border ${borderColor} h-full flex flex-col`}>
      <div className="flex items-center mb-4">
        <div className={`${iconBgColor} p-2 rounded-lg mr-3`}>
          <Mail className={`w-6 h-6 ${iconTextColor}`} />
        </div>
        <h2 className={`text-xl font-bold ${titleColor}`}>AI News Newsletter</h2>
      </div>
      <p className={`${descriptionColor} mb-4`}>
        Subscribe to get the latest AI news and our weekly digest delivered directly to your inbox.
      </p>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
          <p className={message.type === 'success' ? successColor : errorColor}>
            {message.text}
          </p>
        </div>
      )}
      
      <div className="mt-auto">
        <form onSubmit={handleSubmit} className="flex">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address" 
            className={`bg-black/30 border ${inputBorderColor} text-white rounded-l-lg px-4 py-2 w-full ${inputFocusBorderColor} focus:outline-none`}
            autoComplete="off"
            disabled={isSubmitting}
          />
          <button 
            type="submit"
            className={`${buttonBgColor} text-white rounded-r-lg px-4 py-2 transition-colors whitespace-nowrap`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
} 