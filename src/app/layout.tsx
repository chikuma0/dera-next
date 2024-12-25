import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { NewsService } from '@/lib/news/news-service';
import { NewsTicker } from '@/components/news/NewsTicker';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DERA - AI Solutions',
  description: 'Forward-thinking company specializing in leveraging artificial intelligence (AI) to deliver high-quality, efficient solutions.',
};

async function getTopNews() {
  const newsService = new NewsService();
  const allNews = await newsService.fetchAllNews();
  return newsService.getTopNews(allNews, 5); // Get top 5 news items
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const topNews = await getTopNews();

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Only show ticker if we have news */}
        {topNews.length > 0 && <NewsTicker news={topNews} />}
        {/* Add padding to account for fixed news ticker */}
        <div className={`${topNews.length > 0 ? 'pt-12' : ''}`}>
          {children}
        </div>
      </body>
    </html>
  );
}
