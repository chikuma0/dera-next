'use client';

import { useEffect, useState } from 'react';
import { TrendDashboard } from '@/components/trends/TrendDashboard';
import { ViralImpactNarrative } from '@/components/trends/ViralImpactNarrative';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

export default function TechnologyTrendsPage() {
  const [trendData, setTrendData] = useState<any>(null);
  const [impactData, setImpactData] = useState<any>(null);
  const [socialData, setSocialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [trendsResponse, impactResponse] = await Promise.all([
          fetch(`/api/trends`),
          fetch(`/api/trends/impact`)
        ]);

        // Process trends data
        const trendsData = await trendsResponse.json();
        if (trendsData.success && trendsData.data) {
          setTrendData(trendsData.data);
          
          // Extract social data
          if (trendsData.data.socialData) {
            setSocialData(trendsData.data.socialData);
          }
        } else {
          setError(trendsData.error || 'Failed to load trend data');
        }

        // Process impact data
        const impactData = await impactResponse.json();
        if (impactData.success && impactData.data) {
          setImpactData(impactData.data);
        } else {
          setError(impactData.error || 'Failed to load impact data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/news/sonar-digest" className="text-green-400 hover:text-green-300 mr-4">
            ← Back to Sonar Digest
          </Link>
          <h1 className="text-4xl font-bold text-green-400">AI Technology Trends</h1>
        </div>
        <p className="text-lg text-gray-300">
          Detailed analysis of trending AI technologies, their impact, and social media presence.
        </p>
      </div>

      <div className="space-y-8">
        {/* Trend Dashboard */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-green-400">Technology Trend Analysis</h2>
          <TrendDashboard 
            trendData={trendData} 
            trendError={error} 
            socialData={socialData} 
          />
        </section>

        {/* Viral Impact Narrative */}
        {impactData && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-green-400">Technology Impact Assessment</h2>
            <ViralImpactNarrative 
              trendData={trendData} 
              impactData={impactData} 
              socialData={socialData} 
            />
          </section>
        )}
      </div>
    </main>
  );
}