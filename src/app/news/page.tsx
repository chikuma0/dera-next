import { Suspense } from 'react';
import { NewsList } from '@/components/news/NewsList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { validateEnv } from '@/lib/config/env';

// Make sure to mark as Client Component if using hooks
export default async function NewsPage() {
  // Original env test
  console.log('ENV TEST:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 5), // Just first 5 chars for safety
    service: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'exists' : 'missing'
  });

  // Additional Supabase validation test
  try {
    const env = validateEnv();
    console.log('Supabase Validation Test:', {
      url: env.supabase.url,
      hasServiceKey: !!env.supabase.serviceRoleKey,
    });
  } catch (error) {
    console.error('Env validation error:', error);
  }

  return (
    <main className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-8">Latest AI News</h1>
      
      <div className="space-y-8">
        <Suspense fallback={<LoadingSpinner />}>
          <section>
            <h2 className="text-2xl font-semibold mb-4">English News</h2>
            <NewsList language="en" />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Japanese News</h2>
            <NewsList language="ja" />
          </section>
        </Suspense>
      </div>
    </main>
  );
}