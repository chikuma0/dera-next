import { getLatestNews } from '@/lib/supabase';
import { NewsSection } from '@/components/NewsSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI News & Insights | DERA',
  description: 'Stay updated with the latest AI innovations, research, and industry news.',
};

export const revalidate = 3600; // Revalidate every hour

export default async function NewsPage() {
  const news = await getLatestNews();

  return (
    <main className="min-h-screen pt-12">
      <NewsSection news={news} />
    </main>
  );
}
