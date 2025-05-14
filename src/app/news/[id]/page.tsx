import { Metadata, ResolvingMetadata } from 'next';
import { NewsDetail } from '@/components/news/NewsDetail';
import { NewsService } from '@/lib/services/newsService';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const newsService = new NewsService();
  const newsItem = await newsService.getNewsItemById(resolvedParams.id);

  return {
    title: newsItem?.title || 'News Detail',
    description: newsItem?.summary || 'Read the latest AI news and updates',
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const newsService = new NewsService();
  const newsItem = await newsService.getNewsItemById(resolvedParams.id);

  if (!newsItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold mb-4">記事が見つかりません</h1>
        <p className="text-gray-600">
          お探しのニュース記事は存在しないか、削除された可能性があります。
        </p>
      </div>
    );
  }

  return <NewsDetail newsItem={newsItem} />;
} 