import HeroSection from '@/components/hero/HeroSection'
import { NewsService } from '@/lib/news/news-service'

export default async function Home() {
  const newsService = new NewsService()
  const news = await newsService.getNews()
  
  return (
    <main>
      <HeroSection news={news.items} />
    </main>
  )
}