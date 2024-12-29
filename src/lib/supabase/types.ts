export type Database = {
    public: {
      Tables: {
        news_items: {
          Row: {
            id: string
            title: string
            url: string
            source: string
            published_date: string
            language: 'en' | 'ja'
            summary: string
            created_at: string
            updated_at: string
          }
          Insert: {
            id: string
            title: string
            url: string
            source: string
            published_date: string
            language: 'en' | 'ja'
            summary: string
            created_at?: string
            updated_at?: string
          }
          Update: Partial<Insert>
        }
      }
      Functions: Record<string, never>
      Enums: Record<string, never>
    }
  }