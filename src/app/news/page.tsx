import { NewsService } from '@/lib/news/news-service';
import { NewsSection } from '@/components/news/NewsSection';

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
    const newsService = new NewsService();
    const news = await newsService.getNews();
    
    return (
        <main className="min-h-screen bg-black text-green-400">
            <div className="container mx-auto px-4 py-20">
                <h1 className="text-3xl font-bold mb-8">Latest AI News</h1>
                <NewsSection items={news.items} />
            </div>
        </main>
    );
}