import { NewsService } from '@/lib/services/newsService';
import { notFound } from 'next/navigation';
import { NewsDetail } from '@/components/news/NewsDetail';

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  try {
    const newsService = new NewsService();
    const newsItem = await newsService.getNewsItem(params.id);
    if (!newsItem) {
      console.error('No news item found for id:', params.id);
      notFound();
    }
    return <NewsDetail newsItem={newsItem} />;
  } catch (err) {
    console.error('Detail page error:', err);
    notFound();
  }
} 