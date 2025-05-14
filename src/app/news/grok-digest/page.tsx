'use client';

import { GrokDigest } from '@/components/news/GrokDigest';

export default function GrokDigestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Grok&apos;s Digest</h1>
      <GrokDigest />
    </div>
  );
}