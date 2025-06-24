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
      audit_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      commission_records: {
        Row: {
          commission_amount: number
          commission_rate: number | null
          created_at: string | null
          id: string
          order_id: string
          paid_at: string | null
          sale_amount: number
          status: string | null
          wholesaler_id: string
        }
        Insert: {
          commission_amount: number
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          order_id: string
          paid_at?: string | null
          sale_amount: number
          status?: string | null
          wholesaler_id: string
        }
        Update: {
          commission_amount?: number
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          order_id?: string
          paid_at?: string | null
          sale_amount?: number
          status?: string | null
          wholesaler_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_wholesaler_id_fkey"
            columns: ["wholesaler_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      order_actions: {
        Row: {
          action: string
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_actions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          order_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          order_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tracking: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_address: string | null
          buyer_id: string
          buyer_name: string | null
          buyer_phone: string | null
          commission_id: string | null
          confirmed_at: string | null
          created_at: string | null
          id: string
          payment_method: string | null
          payment_screenshot: string | null
          rejected_at: string | null
          screenshot_uploaded_at: string | null
          shop_id: string
          status: string
          total_amount: number
          wholesaler_notes: string | null
        }
        Insert: {
          buyer_address?: string | null
          buyer_id: string
          buyer_name?: string | null
          buyer_phone?: string | null
          commission_id?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_screenshot?: string | null
          rejected_at?: string | null
          screenshot_uploaded_at?: string | null
          shop_id: string
          status?: string
          total_amount: number
          wholesaler_notes?: string | null
        }
        Update: {
          buyer_address?: string | null
          buyer_id?: string
          buyer_name?: string | null
          buyer_phone?: string | null
          commission_id?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_screenshot?: string | null
          rejected_at?: string | null
          screenshot_uploaded_at?: string | null
          shop_id?: string
          status?: string
          total_amount?: number
          wholesaler_notes?: string | null
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
      payment_methods: {
        Row: {
          account_number: string | null
          account_title: string | null
          bank_name: string | null
          created_at: string | null
          easypaisa_number: string | null
          id: string
          is_active: boolean | null
          jazzcash_number: string | null
          updated_at: string | null
          wholesaler_id: string
        }
        Insert: {
          account_number?: string | null
          account_title?: string | null
          bank_name?: string | null
          created_at?: string | null
          easypaisa_number?: string | null
          id?: string
          is_active?: boolean | null
          jazzcash_number?: string | null
          updated_at?: string | null
          wholesaler_id: string
        }
        Update: {
          account_number?: string | null
          account_title?: string | null
          bank_name?: string | null
          created_at?: string | null
          easypaisa_number?: string | null
          id?: string
          is_active?: boolean | null
          jazzcash_number?: string | null
          updated_at?: string | null
          wholesaler_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_wholesaler_id_fkey"
            columns: ["wholesaler_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          id: string
          ip_address: unknown | null
          product_id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          product_id: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          product_id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: []
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
          address: string | null
          business_name: string | null
          business_type: string | null
          can_switch_roles: boolean | null
          city: string | null
          cnic_image: string | null
          contact_name: string | null
          created_at: string | null
          email: string
          id: string
          industry: string | null
          is_suspended: boolean | null
          last_role_switch: string | null
          ntn_number: string | null
          otp_attempts: number | null
          otp_code: string | null
          otp_expires_at: string | null
          phone_number: string | null
          phone_verified: boolean | null
          postal_code: string | null
          profile_image: string | null
          role: string
          role_switch_count: number | null
          selfie_image: string | null
          strn_number: string | null
          suspension_reason: string | null
          updated_at: string | null
          verification_notes: string | null
          verification_status: string | null
          years_in_business: string | null
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          business_type?: string | null
          can_switch_roles?: boolean | null
          city?: string | null
          cnic_image?: string | null
          contact_name?: string | null
          created_at?: string | null
          email: string
          id: string
          industry?: string | null
          is_suspended?: boolean | null
          last_role_switch?: string | null
          ntn_number?: string | null
          otp_attempts?: number | null
          otp_code?: string | null
          otp_expires_at?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          postal_code?: string | null
          profile_image?: string | null
          role?: string
          role_switch_count?: number | null
          selfie_image?: string | null
          strn_number?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          years_in_business?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string | null
          business_type?: string | null
          can_switch_roles?: boolean | null
          city?: string | null
          cnic_image?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          industry?: string | null
          is_suspended?: boolean | null
          last_role_switch?: string | null
          ntn_number?: string | null
          otp_attempts?: number | null
          otp_code?: string | null
          otp_expires_at?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          postal_code?: string | null
          profile_image?: string | null
          role?: string
          role_switch_count?: number | null
          selfie_image?: string | null
          strn_number?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          years_in_business?: string | null
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
      role_switch_history: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          from_role: string
          id: string
          notes: string | null
          requires_approval: boolean | null
          switched_at: string | null
          to_role: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          from_role: string
          id?: string
          notes?: string | null
          requires_approval?: boolean | null
          switched_at?: string | null
          to_role: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          from_role?: string
          id?: string
          notes?: string | null
          requires_approval?: boolean | null
          switched_at?: string | null
          to_role?: string
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
      add_order_tracking: {
        Args: { p_order_id: string; p_status: string; p_notes?: string }
        Returns: string
      }
      delete_old_payment_screenshots: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_old_screenshots: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_product_analytics: {
        Args: { p_shop_ids: string[]; p_start_date?: string }
        Returns: {
          total_views: number
          unique_viewers: number
          views_by_day: Json
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_wholesaler_monthly_sales: {
        Args: { wholesaler_uuid: string; target_month?: string }
        Returns: {
          total_orders: number
          total_sales: number
          pending_commission: number
          paid_commission: number
        }[]
      }
      log_audit_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_table_name?: string
          p_record_id?: string
          p_old_values?: string
          p_new_values?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      switch_business_role: {
        Args: { target_role: string }
        Returns: Json
      }
      track_product_view: {
        Args: {
          p_product_id: string
          p_session_id?: string
          p_user_agent?: string
          p_referrer?: string
        }
        Returns: undefined
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
