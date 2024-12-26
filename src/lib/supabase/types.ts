export type ContentPriority = 'business' | 'industry' | 'implementation' | 'general'

export interface Database {
  public: {
    Tables: {
      news_items: {
        Row: {
          id: string
          title: string
          url: string
          source: string
          published_at: string
          priority: ContentPriority
          relevance_score: number
          content_category: string[]
          summary: string | null
          created_at: string
          expires_at: string
          score?: number
          comments?: number
          by?: string
        }
        Insert: Omit<Database['public']['Tables']['news_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['news_items']['Insert']>
      }
    }
  }
} 