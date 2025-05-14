'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ViralImpactNarrative } from '@/components/trends/ViralImpactNarrative';
import Link from 'next/link';

export default function PulseSharePage() {
  const params = useParams();
  const { translate, locale } = useTranslation();
  const [trendData, setTrendData] = useState<any>(null);
  const [impactData, setImpactData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const techId = params?.id;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!techId) {
          throw new Error('Invalid technology ID');
        }

        // Fetch trend data
        const trendResponse = await fetch(`/api/trends?language=${locale}`);
        const trendResult = await trendResponse.json();
        
        if (!trendResult.success) {
          throw new Error(trendResult.error || 'Failed to fetch trend data');
        }
        
        // Fetch impact data
        const impactResponse = await fetch(`/api/trends/impact?language=${locale}`);
        const impactResult = await impactResponse.json();
        
        if (!impactResult.success) {
          throw new Error(impactResult.error || 'Failed to fetch impact data');
        }
        
        // Check if the requested technology exists
        const technology = trendResult.data.technologies.find(
          (tech: any) => tech.id.toString() === techId
        );
        
        if (!technology) {
          throw new Error('Technology not found');
        }
        
        setTrendData(trendResult.data);
        setImpactData(impactResult.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [locale, techId]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="bg-black/40 border-4 border-red-400 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-green-300 mb-6">{error}</p>
          <Link 
            href="/news"
            className="bg-green-400 hover:bg-green-500 text-black px-4 py-2 rounded text-sm transition-colors"
          >
            Return to PULSE
          </Link>
        </div>
      </main>
    );
  }
  
  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-green-400 mb-2">AI Pulse</h1>
          <Link 
            href="/news"
            className="bg-green-400/20 hover:bg-green-400/30 text-green-400 px-4 py-2 rounded text-sm transition-colors"
          >
            View Full PULSE
          </Link>
        </div>
        <p className="text-green-300/70">
          Shared analysis of AI technology impact
        </p>
      </div>
      
      <ViralImpactNarrative 
        trendData={{
          ...trendData,
          // Override the technologies array to only include the selected technology
          // This forces the component to show only the selected technology
          technologies: trendData.technologies.filter(
            (tech: any) => tech.id.toString() === techId
          )
        }} 
        impactData={impactData}
        socialData={trendData?.socialData}
      />
      
      <div className="mt-8 text-center">
        <div className="bg-black/40 border border-green-400/30 rounded-lg p-6 inline-block">
          <p className="text-green-300 mb-4">
            This is a shared AI impact analysis from Pulse.
          </p>
          <Link 
            href="/news"
            className="bg-green-400 hover:bg-green-500 text-black px-4 py-2 rounded text-sm transition-colors"
          >
            Explore PULSE
          </Link>
        </div>
      </div>
    </main>
  );
}