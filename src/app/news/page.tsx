import { NewsService } from '@/lib/news/news-service';
import { NewsSection } from '@/components/news/NewsSection';
import type { NewsItem } from '@/types';

export default async function NewsPage() {
    const newsService = new NewsService();
    const news = await newsService.getNews();
    
    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Latest News</h1>
            <NewsSection items={news.items} />
        </main>
    );
}