import { NewsService } from '@/lib/services/newsService';
import { notFound } from 'next/navigation';
import { NewsDetail } from '@/components/news/NewsDetail';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  try {
    const newsService = new NewsService();
    const newsItem = await newsService.getNewsItem(id);
    if (!newsItem) {
      console.error('No news item found for id:', id);
      notFound();
    }
    return <NewsDetail newsItem={newsItem} />;
  } catch (err) {
    console.error('Detail page error:', err);
    notFound();
  }
} 