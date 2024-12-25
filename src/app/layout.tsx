import { ReactNode } from 'react';
import { NewsTicker } from '@/components/NewsTicker';
import { getLatestNews } from '@/lib/supabase';

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const news = await getLatestNews();
  const topNews = news.slice(0, 5); // Get top 5 news items for the ticker

  return (
    <html lang="en">
      <body>
        <NewsTicker news={topNews} />
        <div className="pt-12"> {/* Add padding for the fixed ticker */}
          {children}
        </div>
      </body>
    </html>
  );
}
