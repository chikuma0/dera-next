'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function PulsePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new Sonar Digest page
    router.replace('/news/sonar-digest');
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner className="h-12 w-12" />
        <p className="mt-4 text-gray-400">Redirecting to Sonar Digest...</p>
      </div>
    </main>
  );
}