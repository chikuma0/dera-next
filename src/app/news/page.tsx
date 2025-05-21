import { cookies } from 'next/headers';
import { getLatestNews } from '@/lib/news/fetcher';
import { NewsList } from '@/components/news/NewsList';

async function getRequestLocale(): Promise<'en' | 'ja'> {
  // NEXT_LOCALE cookie is set automatically by Next.js i18n
  const cookieStore = await cookies();
  return (cookieStore.get('NEXT_LOCALE')?.value as 'en' | 'ja') ?? 'en';
}

export default async function NewsPage() {
  const locale = await getRequestLocale();
  const news = await getLatestNews(locale);

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
