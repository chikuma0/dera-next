'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function MediaHubPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the news page
    router.replace('/news');
  }, [router]);
  
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner className="h-12 w-12" />
        <p className="mt-4 text-gray-400">Redirecting to News...</p>
      </div>
    </main>
  );
}