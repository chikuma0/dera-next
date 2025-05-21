export type Database = {
    public: {
      Tables: {
        news_items: {
          Row: {
            id: string
            title: string
            url: string
            source: string
            source_id: string
            published_date: string
            language: 'en' | 'ja'
            summary: string
            created_at: string
            updated_at: string
          }
          Insert: NewsItemInsert
          Update: Partial<NewsItemInsert>
        }
      }
      Functions: Record<string, never>
      Enums: Record<string, never>
    }
  }
  
  type NewsItemInsert = {
    id: string
    title: string
    url: string
    source: string
    source_id: string
    published_date: string
    language: 'en' | 'ja'
    summary: string
    created_at?: string
    updated_at?: string
  }
