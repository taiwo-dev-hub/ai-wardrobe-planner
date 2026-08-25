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
      profiles: {
        Row: {
          id: string
          email: string
          credits_balance: number
          created_at: string
        }
        Insert: {
          id: string
          email: string
          credits_balance?: number
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          credits_balance?: number
          created_at?: string
        }
      }
      clothes: {
        Row: {
          id: string
          user_id: string
          image_url: string
          category: 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory'
          color: string
          formality: 'casual' | 'smart-casual' | 'formal'
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          category: 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory'
          color: string
          formality: 'casual' | 'smart-casual' | 'formal'
          tags: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          category?: 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory'
          color?: string
          formality?: 'casual' | 'smart-casual' | 'formal'
          tags?: string[]
          created_at?: string
        }
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          style_vibe: string
          styling_notes: string
          item_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          style_vibe: string
          styling_notes: string
          item_ids: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          style_vibe?: string
          styling_notes?: string
          item_ids?: string[]
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
