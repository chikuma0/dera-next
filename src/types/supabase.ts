export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      blueprints: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          difficulty: string
          programmingLanguages: string[]
          estimatedTime: number
          prerequisites: Json
          steps: Json
          resources: Json
          japaneseContext: Json
          author: Json
          createdAt: string
          updatedAt: string
          rating: number
          ratingCount: number
          viewCount: number
          published: boolean
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          difficulty: string
          programmingLanguages: string[]
          estimatedTime: number
          prerequisites: Json
          steps: Json
          resources: Json
          japaneseContext: Json
          author: Json
          createdAt?: string
          updatedAt?: string
          rating?: number
          ratingCount?: number
          viewCount?: number
          published?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          difficulty?: string
          programmingLanguages?: string[]
          estimatedTime?: number
          prerequisites?: Json
          steps?: Json
          resources?: Json
          japaneseContext?: Json
          author?: Json
          createdAt?: string
          updatedAt?: string
          rating?: number
          ratingCount?: number
          viewCount?: number
          published?: boolean
        }
      }
      blueprint_ratings: {
        Row: {
          id: string
          blueprintId: string
          userId: string
          rating: number
          comment: string | null
          createdAt: string
          updatedAt: string | null
        }
        Insert: {
          id?: string
          blueprintId: string
          userId: string
          rating: number
          comment?: string | null
          createdAt?: string
          updatedAt?: string | null
        }
        Update: {
          id?: string
          blueprintId?: string
          userId?: string
          rating?: number
          comment?: string | null
          createdAt?: string
          updatedAt?: string | null
        }
      }
      news_sources: {
        Row: {
          id: string
          name: string
          url: string
          feed_url: string
          source_type: string
          priority: number
          logo_url: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          feed_url: string
          source_type: string
          priority?: number
          logo_url?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          feed_url?: string
          source_type?: string
          priority?: number
          logo_url?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      news_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      news_items: {
        Row: {
          id: string
          title: string
          summary: string | null
          content: string | null
          source_id: string
          url: string
          published_date: string
          collected_at: string
          image_url: string | null
          relevance_score: number | null
          importance_score: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          content?: string | null
          source_id: string
          url: string
          published_date: string
          collected_at?: string
          image_url?: string | null
          relevance_score?: number | null
          importance_score?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string | null
          content?: string | null
          source_id?: string
          url?: string
          published_date?: string
          collected_at?: string
          image_url?: string | null
          relevance_score?: number | null
          importance_score?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      news_item_categories: {
        Row: {
          news_item_id: string
          category_id: string
        }
        Insert: {
          news_item_id: string
          category_id: string
        }
        Update: {
          news_item_id?: string
          category_id?: string
        }
      }
    }
    Views: {
      published_news_with_categories: {
        Row: {
          id: string
          title: string
          summary: string | null
          content: string | null
          source_id: string
          source_name: string
          url: string
          published_date: string
          collected_at: string
          image_url: string | null
          relevance_score: number | null
          importance_score: number | null
          status: string
          categories: string[]
        }
      }
    }
    Functions: {
      increment_blueprint_view_count: {
        Args: {
          blueprint_id: string
        }
        Returns: null
      }
      check_news_item_exists: {
        Args: {
          item_url: string
        }
        Returns: boolean
      }
      find_or_create_category: {
        Args: {
          cat_name: string
          cat_description: string
        }
        Returns: string
      }
      link_news_item_category: {
        Args: {
          item_id: string
          cat_id: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 