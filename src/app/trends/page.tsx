'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function TrendsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the pulse page (which now contains the merged Social Pulse and Sonar Digest)
    router.push('/pulse');
  }, [router]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-purple-400">Redirecting to AI Pulse...</p>
      </div>
    </div>
  );
}