import { NewsService } from '@/lib/news/news-service'
import { NewsTicker } from '@/components/news/NewsTicker'

export default async function NewsPage() {
  const newsService = new NewsService()
  const news = await newsService.getNews()
  
  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-green-400 mb-8">Latest News</h1>
        <NewsTicker items={news.items} />
      </div>
    </main>
  )
}