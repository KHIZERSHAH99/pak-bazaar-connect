export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          budget_cap: number | null
          campaign_end_date: string | null
          campaign_start_date: string | null
          created_at: string | null
          current_spend: number | null
          headline: string
          id: string
          image: string | null
          is_auto_stopped: boolean | null
          status: string
          total_orders: number | null
          wholesaler_id: string
        }
        Insert: {
          budget_cap?: number | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          created_at?: string | null
          current_spend?: number | null
          headline: string
          id?: string
          image?: string | null
          is_auto_stopped?: boolean | null
          status?: string
          total_orders?: number | null
          wholesaler_id: string
        }
        Update: {
          budget_cap?: number | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          created_at?: string | null
          current_spend?: number | null
          headline?: string
          id?: string
          image?: string | null
          is_auto_stopped?: boolean | null
          status?: string
          total_orders?: number | null
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
      auth_attempts: {
        Row: {
          attempted_at: string
          created_at: string
          id: string
          identifier: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempted_at?: string
          created_at?: string
          id?: string
          identifier: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempted_at?: string
          created_at?: string
          id?: string
          identifier?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
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
      commission_settings: {
        Row: {
          commission_percentage: number | null
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          id: string
        }
        Insert: {
          commission_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          id?: string
        }
        Update: {
          commission_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_transactions: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string | null
          id: string
          order_amount: number
          order_id: string
          paid_at: string | null
          status: string
          wholesaler_id: string
        }
        Insert: {
          commission_amount: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          order_amount: number
          order_id: string
          paid_at?: string | null
          status?: string
          wholesaler_id: string
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          order_amount?: number
          order_id?: string
          paid_at?: string | null
          status?: string
          wholesaler_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_transactions_wholesaler_id_fkey"
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
      coupon_usage: {
        Row: {
          coupon_id: string
          discount_amount: number
          id: string
          order_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          id?: string
          order_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          min_order_amount: number | null
          target_buyers: string[] | null
          target_products: string[] | null
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_until: string
          wholesaler_id: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          target_buyers?: string[] | null
          target_products?: string[] | null
          usage_limit?: number | null
          used_count?: number
          valid_from: string
          valid_until: string
          wholesaler_id: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          target_buyers?: string[] | null
          target_products?: string[] | null
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string
          wholesaler_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
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
      monthly_commissions: {
        Row: {
          commission_amount: number | null
          commission_percentage: number | null
          created_at: string | null
          due_date: string | null
          id: string
          month: string
          paid_at: string | null
          payment_status: string | null
          total_sales: number | null
          wholesaler_id: string
        }
        Insert: {
          commission_amount?: number | null
          commission_percentage?: number | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          month: string
          paid_at?: string | null
          payment_status?: string | null
          total_sales?: number | null
          wholesaler_id: string
        }
        Update: {
          commission_amount?: number | null
          commission_percentage?: number | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          month?: string
          paid_at?: string | null
          payment_status?: string | null
          total_sales?: number | null
          wholesaler_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_commissions_wholesaler_id_fkey"
            columns: ["wholesaler_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      order_items: {
        Row: {
          created_at: string | null
          custom_requirements: string | null
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          specifications: Json | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          custom_requirements?: string | null
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          specifications?: Json | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          custom_requirements?: string | null
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          specifications?: Json | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      order_status_history: {
        Row: {
          carrier_name: string | null
          changed_by: string | null
          created_at: string | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          order_id: string
          previous_status: string | null
          status: string
          tracking_number: string | null
        }
        Insert: {
          carrier_name?: string | null
          changed_by?: string | null
          created_at?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_id: string
          previous_status?: string | null
          status: string
          tracking_number?: string | null
        }
        Update: {
          carrier_name?: string | null
          changed_by?: string | null
          created_at?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          previous_status?: string | null
          status?: string
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
          auto_delete_screenshot_at: string | null
          buyer_address: string | null
          buyer_id: string
          buyer_name: string | null
          buyer_phone: string | null
          carrier_name: string | null
          commission_id: string | null
          confirmed_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_confirmed_by: string | null
          estimated_delivery: string | null
          id: string
          internal_notes: string | null
          is_guest_order: boolean | null
          last_status_update: string | null
          order_notes: string | null
          packed_at: string | null
          payment_method: string | null
          payment_screenshot: string | null
          priority_level: number | null
          processing_started_at: string | null
          rejected_at: string | null
          rejection_reason: string | null
          requires_attention: boolean | null
          returned_at: string | null
          screenshot_uploaded_at: string | null
          shipped_at: string | null
          shop_id: string
          status: string
          total_amount: number
          tracking_number: string | null
          wholesaler_notes: string | null
        }
        Insert: {
          auto_delete_screenshot_at?: string | null
          buyer_address?: string | null
          buyer_id: string
          buyer_name?: string | null
          buyer_phone?: string | null
          carrier_name?: string | null
          commission_id?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_confirmed_by?: string | null
          estimated_delivery?: string | null
          id?: string
          internal_notes?: string | null
          is_guest_order?: boolean | null
          last_status_update?: string | null
          order_notes?: string | null
          packed_at?: string | null
          payment_method?: string | null
          payment_screenshot?: string | null
          priority_level?: number | null
          processing_started_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          requires_attention?: boolean | null
          returned_at?: string | null
          screenshot_uploaded_at?: string | null
          shipped_at?: string | null
          shop_id: string
          status?: string
          total_amount: number
          tracking_number?: string | null
          wholesaler_notes?: string | null
        }
        Update: {
          auto_delete_screenshot_at?: string | null
          buyer_address?: string | null
          buyer_id?: string
          buyer_name?: string | null
          buyer_phone?: string | null
          carrier_name?: string | null
          commission_id?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_confirmed_by?: string | null
          estimated_delivery?: string | null
          id?: string
          internal_notes?: string | null
          is_guest_order?: boolean | null
          last_status_update?: string | null
          order_notes?: string | null
          packed_at?: string | null
          payment_method?: string | null
          payment_screenshot?: string | null
          priority_level?: number | null
          processing_started_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          requires_attention?: boolean | null
          returned_at?: string | null
          screenshot_uploaded_at?: string | null
          shipped_at?: string | null
          shop_id?: string
          status?: string
          total_amount?: number
          tracking_number?: string | null
          wholesaler_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_confirmed_by_fkey"
            columns: ["delivery_confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      password_security_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
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
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_pricing_tiers: {
        Row: {
          created_at: string | null
          id: string
          max_quantity: number | null
          min_quantity: number
          product_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_quantity?: number | null
          min_quantity: number
          product_id: string
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          max_quantity?: number | null
          min_quantity?: number
          product_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_pricing_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specifications: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          spec_name: string
          spec_value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          spec_name: string
          spec_value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          spec_name?: string
          spec_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          brand: string | null
          category_id: string | null
          certifications: string[] | null
          colors_available: string[] | null
          created_at: string | null
          customization_available: boolean | null
          description: string | null
          id: string
          image: string | null
          is_active: boolean
          lead_time_days: number | null
          model_number: string | null
          moq: number | null
          name: string
          origin_country: string | null
          package_dimensions: string | null
          package_weight: number | null
          packaging_type: string | null
          price: number
          sample_available: boolean | null
          sample_price: number | null
          shop_id: string
          stock_quantity: number | null
          units_per_package: number | null
          verification_status: string
          warranty_info: string | null
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          certifications?: string[] | null
          colors_available?: string[] | null
          created_at?: string | null
          customization_available?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          lead_time_days?: number | null
          model_number?: string | null
          moq?: number | null
          name: string
          origin_country?: string | null
          package_dimensions?: string | null
          package_weight?: number | null
          packaging_type?: string | null
          price: number
          sample_available?: boolean | null
          sample_price?: number | null
          shop_id: string
          stock_quantity?: number | null
          units_per_package?: number | null
          verification_status?: string
          warranty_info?: string | null
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          certifications?: string[] | null
          colors_available?: string[] | null
          created_at?: string | null
          customization_available?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean
          lead_time_days?: number | null
          model_number?: string | null
          moq?: number | null
          name?: string
          origin_country?: string | null
          package_dimensions?: string | null
          package_weight?: number | null
          packaging_type?: string | null
          price?: number
          sample_available?: boolean | null
          sample_price?: number | null
          shop_id?: string
          stock_quantity?: number | null
          units_per_package?: number | null
          verification_status?: string
          warranty_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_category_id"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_shop_id"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
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
          last_commission_payment: string | null
          last_order_data: Json | null
          last_otp_request: string | null
          last_role_switch: string | null
          normalized_phone: string | null
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
          status: string | null
          strn_number: string | null
          suspended_until: string | null
          suspension_reason: string | null
          suspension_type: string | null
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
          last_commission_payment?: string | null
          last_order_data?: Json | null
          last_otp_request?: string | null
          last_role_switch?: string | null
          normalized_phone?: string | null
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
          status?: string | null
          strn_number?: string | null
          suspended_until?: string | null
          suspension_reason?: string | null
          suspension_type?: string | null
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
          last_commission_payment?: string | null
          last_order_data?: Json | null
          last_otp_request?: string | null
          last_role_switch?: string | null
          normalized_phone?: string | null
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
          status?: string | null
          strn_number?: string | null
          suspended_until?: string | null
          suspension_reason?: string | null
          suspension_type?: string | null
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
      shop_favorites: {
        Row: {
          created_at: string
          id: string
          shop_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shop_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shop_id?: string
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
            foreignKeyName: "fk_shops_city_id"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
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
        Args: { p_notes?: string; p_order_id: string; p_status: string }
        Returns: string
      }
      associate_phone_with_account: {
        Args: { p_email: string; p_phone_number: string }
        Returns: Json
      }
      authenticate_user_by_phone: {
        Args: { user_phone: string }
        Returns: Json
      }
      calculate_monthly_commissions: {
        Args: { target_month?: string }
        Returns: undefined
      }
      can_request_otp: {
        Args: { user_phone: string }
        Returns: boolean
      }
      check_account_lockout: {
        Args: { user_phone: string }
        Returns: Json
      }
      check_user_exists: {
        Args: { p_email?: string; p_phone?: string }
        Returns: Json
      }
      cleanup_old_product_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_completed_order_screenshots: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_old_payment_screenshots: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_old_screenshots: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      detect_unusual_access_patterns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_otp: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_available_phones: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          normalized_phone: string
          phone_number: string
          role: string
        }[]
      }
      get_current_commission_rate: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_effective_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_product_analytics: {
        Args: { p_shop_ids: string[]; p_start_date?: string }
        Returns: {
          total_views: number
          unique_viewers: number
          views_by_day: Json
        }[]
      }
      get_product_analytics_secure: {
        Args: { p_days_back?: number; p_shop_id: string }
        Returns: {
          daily_views: Json
          total_views: number
          unique_viewers: number
        }[]
      }
      get_profile_summary: {
        Args: { profile_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_wholesaler_monthly_sales: {
        Args: { target_month?: string; wholesaler_uuid: string }
        Returns: {
          paid_commission: number
          pending_commission: number
          total_orders: number
          total_sales: number
        }[]
      }
      increment_coupon_usage: {
        Args: { coupon_id: string }
        Returns: undefined
      }
      log_admin_profile_view: {
        Args: { viewed_profile_id: string }
        Returns: undefined
      }
      log_audit_event: {
        Args: {
          p_event_type: string
          p_new_values?: string
          p_old_values?: string
          p_record_id?: string
          p_table_name?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      log_auth_attempt: {
        Args: {
          p_identifier: string
          p_ip_address?: string
          p_success: boolean
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_password_security_event: {
        Args: { p_details?: Json; p_event_type: string; p_user_id: string }
        Returns: undefined
      }
      monitor_product_view_patterns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      normalize_pakistani_phone: {
        Args: { phone_input: string }
        Returns: string
      }
      suspend_overdue_accounts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      switch_business_role: {
        Args: { target_role: string }
        Returns: Json
      }
      track_product_view: {
        Args: {
          p_product_id: string
          p_referrer?: string
          p_session_id?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      validate_pakistani_phone: {
        Args: { phone_input: string }
        Returns: boolean
      }
      verify_otp: {
        Args: { provided_otp: string; user_phone: string }
        Returns: Json
      }
    }
    Enums: {
      order_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "rejected"
        | "cancelled"
        | "processing"
        | "packed"
        | "shipped"
        | "delivered"
        | "returned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "pending",
        "confirmed",
        "completed",
        "rejected",
        "cancelled",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "returned",
      ],
    },
  },
} as const
