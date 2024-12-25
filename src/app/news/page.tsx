import { Suspense } from 'react';
import { NewsService } from '@/lib/news/news-service';
import { NewsSection } from '@/components/news/NewsSection';

export const metadata = {
  title: 'AI News & Insights | DERA',
  description: 'Stay updated with the latest AI innovations, research, and industry news.',
};

export const revalidate = 3600; // Revalidate every hour

export default async function NewsPage() {
  const newsService = new NewsService();
  const news = await newsService.fetchAllNews();

  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <NewsSection news={news} />
      </Suspense>
    </main>
  );
}
