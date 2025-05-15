import { headers } from 'next/headers';
import { NewsService } from '@/lib/services/newsService';
import { NewsList } from '@/components/news/NewsList';

export default async function NewsPage() {
  // Get the current locale from Next.js headers (for future use)
  const locale = (await headers()).get('x-nextjs-locale') || 'en';
  const newsService = new NewsService();
  // Fetch all news (for now, only English is supported)
  const { items: news } = await newsService.getPublishedNews(1, 20);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Latest News</h1>
      {news.length === 0 ? (
        <div>No news available.</div>
      ) : (
        <NewsList news={news} language={locale} />
      )}
    </main>
  );
}
