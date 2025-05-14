'use client';

import React from 'react';
import { SonarDigest } from '@/components/news/SonarDigest';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { NewsletterSubscription } from '@/components/news/NewsletterSubscription';

export default function SonarDigestPage() {
  const { translate } = useTranslation();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link 
            href="/news" 
            className="flex items-center text-purple-500 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to News</span>
          </Link>
        </div>
        
        <div className="mb-8">
          {/* Newsletter Subscription */}
          <div className="mb-12">
            <NewsletterSubscription color="purple" />
          </div>
          
      <SonarDigest />
        </div>
      </div>
    </main>
  );
}