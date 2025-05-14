            
            
            'use client';

import { WeeklyDigest } from '@/components/news/WeeklyDigest';

export default function WeeklyDigestPage() {
  return (
    <main className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-4xl font-bold mb-6 text-green-400">Weekly AI Digest</h1>
      <WeeklyDigest />
    </main>
  );
}