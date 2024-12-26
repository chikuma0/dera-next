import HeroSection from '@/components/hero/HeroSection'
import { NewsTicker } from '@/components/news/NewsTicker'
import { Suspense } from 'react'
import { EnvTest } from '@/components/EnvTest'

export default function Home() {
  return (
    <main>
      <EnvTest />
      <HeroSection />
      <div className="mt-8">
        <Suspense fallback={
          <div className="w-full bg-black/50 backdrop-blur-sm text-white h-12 flex items-center justify-center">
            <span className="text-sm">Loading news...</span>
          </div>
        }>
          <NewsTicker 
            maxItems={5}
            presentation={{
              brandName: 'DERA News',
              displayStyle: 'ticker',
              showSource: true,
              showTimestamp: true
            }}
            initialNews={[
              {
                id: 'placeholder',
                title: 'Loading latest AI news...',
                url: '#',
                source: 'Hacker News',
                publishedAt: new Date().toISOString(),
                priority: 'general',
                contentCategory: ['ai-tools']
              }
            ]}
          />
        </Suspense>
      </div>
    </main>
  )
}