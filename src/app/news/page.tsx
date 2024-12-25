import { Metadata } from 'next';
import { NewsService } from '@/lib/news/news-service';
import { NewsSection } from '@/components/news/NewsSection';

export const metadata: Metadata = {
  title: 'AI News & Insights | DERA',
  description: 'Stay updated with the latest AI innovations, research, and industry news.',
};

export const revalidate = 3600; // Revalidate every hour

async function getNews() {
  const newsService = new NewsService();
  return await newsService.fetchAllNews();
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <main>
      <NewsSection news={news} />
    </main>
  );
}
