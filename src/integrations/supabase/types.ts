export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ads: {
        Row: {
          created_at: string | null
          headline: string
          id: string
          image: string | null
          status: string
          wholesaler_id: string
        }
        Insert: {
          created_at?: string | null
          headline: string
          id?: string
          image?: string | null
          status?: string
          wholesaler_id: string
        }
        Update: {
          created_at?: string | null
          headline?: string
          id?: string
          image?: string | null
          status?: string
          wholesaler_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          created_at: string | null
          id: string
          message: string
          reply: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          reply: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          reply?: string
          user_id?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          province: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          province: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          province?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          commission_amount: number
          created_at: string | null
          id: string
          payout_amount: number
          sale_amount: number
          seller_id: string
          transaction_id: string
        }
        Insert: {
          commission_amount: number
          created_at?: string | null
          id?: string
          payout_amount: number
          sale_amount: number
          seller_id: string
          transaction_id: string
        }
        Update: {
          commission_amount?: number
          created_at?: string | null
          id?: string
          payout_amount?: number
          sale_amount?: number
          seller_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          address: string
          business_type: string
          city_id: string | null
          company_name: string
          created_at: string
          description: string | null
          id: string
          logo: string | null
          phone: string
          updated_at: string
          user_id: string
          verification_status: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address: string
          business_type?: string
          city_id?: string | null
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          logo?: string | null
          phone: string
          updated_at?: string
          user_id: string
          verification_status?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string
          business_type?: string
          city_id?: string | null
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          logo?: string | null
          phone?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          buyer_email: string | null
          buyer_id: string
          buyer_name: string
          buyer_phone: string
          created_at: string
          id: string
          message: string
          product_id: string | null
          quantity_needed: number | null
          seller_id: string
          status: string
        }
        Insert: {
          buyer_email?: string | null
          buyer_id: string
          buyer_name: string
          buyer_phone: string
          created_at?: string
          id?: string
          message: string
          product_id?: string | null
          quantity_needed?: number | null
          seller_id: string
          status?: string
        }
        Update: {
          buyer_email?: string | null
          buyer_id?: string
          buyer_name?: string
          buyer_phone?: string
          created_at?: string
          id?: string
          message?: string
          product_id?: string | null
          quantity_needed?: number | null
          seller_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          commission_id: string | null
          created_at: string | null
          id: string
          shop_id: string
          status: string
          total_amount: number
        }
        Insert: {
          buyer_id: string
          commission_id?: string | null
          created_at?: string | null
          id?: string
          shop_id: string
          status?: string
          total_amount: number
        }
        Update: {
          buyer_id?: string
          commission_id?: string | null
          created_at?: string | null
          id?: string
          shop_id?: string
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          is_active: boolean
          moq: number | null
          name: string
          price: number
          shop_id: string
          verification_status: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          moq?: number | null
          name: string
          price: number
          shop_id: string
          verification_status?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          moq?: number | null
          name?: string
          price?: number
          shop_id?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      role_requests: {
        Row: {
          created_at: string | null
          id: string
          requested_role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          requested_role: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          requested_role?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      shops: {
        Row: {
          address: string
          city_id: string | null
          commission_rate: number | null
          contact: string
          created_at: string | null
          id: string
          logo: string | null
          name: string
          owner_id: string
          postal_code: string
        }
        Insert: {
          address: string
          city_id?: string | null
          commission_rate?: number | null
          contact: string
          created_at?: string | null
          id?: string
          logo?: string | null
          name: string
          owner_id: string
          postal_code: string
        }
        Update: {
          address?: string
          city_id?: string | null
          commission_rate?: number | null
          contact?: string
          created_at?: string | null
          id?: string
          logo?: string | null
          name?: string
          owner_id?: string
          postal_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
