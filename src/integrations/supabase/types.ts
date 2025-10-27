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
      ad_clicks: {
        Row: {
          ad_id: string
          clicked_at: string | null
          id: string
          placement: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          ad_id: string
          clicked_at?: string | null
          id?: string
          placement?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          ad_id?: string
          clicked_at?: string | null
          id?: string
          placement?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ad_impressions: {
        Row: {
          ad_id: string
          created_at: string | null
          id: string
          placement: string | null
          session_id: string | null
          size: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          ad_id: string
          created_at?: string | null
          id?: string
          placement?: string | null
          session_id?: string | null
          size?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          ad_id?: string
          created_at?: string | null
          id?: string
          placement?: string | null
          session_id?: string | null
          size?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_ip_whitelist: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          ip_address: unknown
          is_active?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
          created_at: string | null
          id: string
          is_major: boolean | null
          name: string
          province_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_major?: boolean | null
          name: string
          province_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_major?: boolean | null
          name?: string
          province_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
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
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          last_message: string | null
          last_message_at: string | null
          product_id: string | null
          seller_id: string
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          product_id?: string | null
          seller_id: string
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          product_id?: string | null
          seller_id?: string
          updated_at?: string | null
        }
        Relationships: []
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
      csrf_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string | null
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
      messages: {
        Row: {
          attachment: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_wholesaler_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_rate_limits: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          operation: string
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          operation: string
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          operation?: string
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "order_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_wholesaler_profiles"
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
          {
            foreignKeyName: "order_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_wholesaler_profiles"
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
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "public_wholesaler_profiles"
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
          buyer_area: string | null
          buyer_city: string | null
          buyer_id: string
          buyer_name: string | null
          buyer_phone: string | null
          buyer_postal_code: string | null
          buyer_province: string | null
          buyer_street_address: string | null
          carrier_name: string | null
          confirmed_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_confirmed_by: string | null
          delivery_instructions: string | null
          delivery_partner: string | null
          estimated_delivery: string | null
          guest_session_id: string | null
          id: string
          internal_notes: string | null
          is_guest_order: boolean | null
          last_status_update: string | null
          order_notes: string | null
          packed_at: string | null
          packed_by: string | null
          payment_method: string | null
          payment_screenshot: string | null
          priority_level: number | null
          processing_started_at: string | null
          rejected_at: string | null
          rejection_reason: string | null
          requires_attention: boolean | null
          return_address: string | null
          returned_at: string | null
          screenshot_uploaded_at: string | null
          shipped_at: string | null
          shipped_by: string | null
          shipping_cost: number | null
          shipping_method: string | null
          shop_id: string
          status: string
          total_amount: number
          tracking_number: string | null
          tracking_url: string | null
          wholesaler_notes: string | null
        }
        Insert: {
          auto_delete_screenshot_at?: string | null
          buyer_address?: string | null
          buyer_area?: string | null
          buyer_city?: string | null
          buyer_id: string
          buyer_name?: string | null
          buyer_phone?: string | null
          buyer_postal_code?: string | null
          buyer_province?: string | null
          buyer_street_address?: string | null
          carrier_name?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_confirmed_by?: string | null
          delivery_instructions?: string | null
          delivery_partner?: string | null
          estimated_delivery?: string | null
          guest_session_id?: string | null
          id?: string
          internal_notes?: string | null
          is_guest_order?: boolean | null
          last_status_update?: string | null
          order_notes?: string | null
          packed_at?: string | null
          packed_by?: string | null
          payment_method?: string | null
          payment_screenshot?: string | null
          priority_level?: number | null
          processing_started_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          requires_attention?: boolean | null
          return_address?: string | null
          returned_at?: string | null
          screenshot_uploaded_at?: string | null
          shipped_at?: string | null
          shipped_by?: string | null
          shipping_cost?: number | null
          shipping_method?: string | null
          shop_id: string
          status?: string
          total_amount: number
          tracking_number?: string | null
          tracking_url?: string | null
          wholesaler_notes?: string | null
        }
        Update: {
          auto_delete_screenshot_at?: string | null
          buyer_address?: string | null
          buyer_area?: string | null
          buyer_city?: string | null
          buyer_id?: string
          buyer_name?: string | null
          buyer_phone?: string | null
          buyer_postal_code?: string | null
          buyer_province?: string | null
          buyer_street_address?: string | null
          carrier_name?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_confirmed_by?: string | null
          delivery_instructions?: string | null
          delivery_partner?: string | null
          estimated_delivery?: string | null
          guest_session_id?: string | null
          id?: string
          internal_notes?: string | null
          is_guest_order?: boolean | null
          last_status_update?: string | null
          order_notes?: string | null
          packed_at?: string | null
          packed_by?: string | null
          payment_method?: string | null
          payment_screenshot?: string | null
          priority_level?: number | null
          processing_started_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          requires_attention?: boolean | null
          return_address?: string | null
          returned_at?: string | null
          screenshot_uploaded_at?: string | null
          shipped_at?: string | null
          shipped_by?: string | null
          shipping_cost?: number | null
          shipping_method?: string | null
          shop_id?: string
          status?: string
          total_amount?: number
          tracking_number?: string | null
          tracking_url?: string | null
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
            foreignKeyName: "orders_delivery_confirmed_by_fkey"
            columns: ["delivery_confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_confirmed_by_fkey"
            columns: ["delivery_confirmed_by"]
            isOneToOne: false
            referencedRelation: "public_wholesaler_profiles"
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
      otp_rate_limits: {
        Row: {
          last_sent_at: string | null
          send_count: number | null
          user_id: string
        }
        Insert: {
          last_sent_at?: string | null
          send_count?: number | null
          user_id: string
        }
        Update: {
          last_sent_at?: string | null
          send_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      password_policy_config: {
        Row: {
          check_leaked_passwords: boolean | null
          created_at: string | null
          id: string
          min_length: number | null
          require_lowercase: boolean | null
          require_numbers: boolean | null
          require_special: boolean | null
          require_uppercase: boolean | null
          updated_at: string | null
        }
        Insert: {
          check_leaked_passwords?: boolean | null
          created_at?: string | null
          id?: string
          min_length?: number | null
          require_lowercase?: boolean | null
          require_numbers?: boolean | null
          require_special?: boolean | null
          require_uppercase?: boolean | null
          updated_at?: string | null
        }
        Update: {
          check_leaked_passwords?: boolean | null
          created_at?: string | null
          id?: string
          min_length?: number | null
          require_lowercase?: boolean | null
          require_numbers?: boolean | null
          require_special?: boolean | null
          require_uppercase?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
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
          account_number_encrypted: string | null
          account_number_masked: string | null
          account_title: string | null
          bank_name: string | null
          created_at: string | null
          easypaisa_encrypted: string | null
          easypaisa_masked: string | null
          easypaisa_number: string | null
          id: string
          is_active: boolean | null
          jazzcash_encrypted: string | null
          jazzcash_masked: string | null
          jazzcash_number: string | null
          updated_at: string | null
          wholesaler_id: string
        }
        Insert: {
          account_number?: string | null
          account_number_encrypted?: string | null
          account_number_masked?: string | null
          account_title?: string | null
          bank_name?: string | null
          created_at?: string | null
          easypaisa_encrypted?: string | null
          easypaisa_masked?: string | null
          easypaisa_number?: string | null
          id?: string
          is_active?: boolean | null
          jazzcash_encrypted?: string | null
          jazzcash_masked?: string | null
          jazzcash_number?: string | null
          updated_at?: string | null
          wholesaler_id: string
        }
        Update: {
          account_number?: string | null
          account_number_encrypted?: string | null
          account_number_masked?: string | null
          account_title?: string | null
          bank_name?: string | null
          created_at?: string | null
          easypaisa_encrypted?: string | null
          easypaisa_masked?: string | null
          easypaisa_number?: string | null
          id?: string
          is_active?: boolean | null
          jazzcash_encrypted?: string | null
          jazzcash_masked?: string | null
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
          {
            foreignKeyName: "payment_methods_wholesaler_id_fkey"
            columns: ["wholesaler_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_methods_wholesaler_id_fkey"
            columns: ["wholesaler_id"]
            isOneToOne: false
            referencedRelation: "public_wholesaler_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_tiers: {
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
            foreignKeyName: "pricing_tiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      product_size_charts: {
        Row: {
          chart_data: Json
          chart_type: string
          created_at: string | null
          id: string
          product_id: string
          unit: string | null
        }
        Insert: {
          chart_data: Json
          chart_type?: string
          created_at?: string | null
          id?: string
          product_id: string
          unit?: string | null
        }
        Update: {
          chart_data?: Json
          chart_type?: string
          created_at?: string | null
          id?: string
          product_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_size_charts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specification_tables: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          sort_order: number | null
          specifications: Json
          table_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          sort_order?: number | null
          specifications: Json
          table_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          sort_order?: number | null
          specifications?: Json
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specification_tables_product_id_fkey"
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
      product_variation_combinations: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          price: number
          product_id: string
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
          variations: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          price: number
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          variations: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          price?: number
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          variations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "product_variation_combinations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variations: {
        Row: {
          attributes: Json | null
          created_at: string | null
          hex_color: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          price_adjustment: number | null
          product_id: string
          sku: string | null
          sort_order: number | null
          stock_quantity: number | null
          updated_at: string | null
          variation_label: string | null
          variation_type: string
          variation_value: string
        }
        Insert: {
          attributes?: Json | null
          created_at?: string | null
          hex_color?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          price_adjustment?: number | null
          product_id: string
          sku?: string | null
          sort_order?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
          variation_label?: string | null
          variation_type: string
          variation_value: string
        }
        Update: {
          attributes?: Json | null
          created_at?: string | null
          hex_color?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          price_adjustment?: number | null
          product_id?: string
          sku?: string | null
          sort_order?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
          variation_label?: string | null
          variation_type?: string
          variation_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
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
          ip_address: unknown
          product_id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: unknown
          product_id: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: unknown
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
          auth_type: string | null
          business_name: string | null
          business_type: string | null
          can_switch_roles: boolean | null
          city: string | null
          cnic_encrypted: string | null
          cnic_image: string | null
          contact_name: string | null
          created_at: string | null
          data_retention_consent: boolean | null
          data_retention_date: string | null
          display_identifier: string | null
          email: string
          email_verified: boolean | null
          email_verified_at: string | null
          id: string
          industry: string | null
          is_email_user: boolean | null
          is_suspended: boolean | null
          last_order_data: Json | null
          last_otp_request: string | null
          last_role_switch: string | null
          normalized_phone: string | null
          ntn_number: string | null
          otp_attempts: number | null
          otp_code: string | null
          otp_expires_at: string | null
          phone_encrypted: string | null
          phone_number: string | null
          phone_verified: boolean | null
          postal_code: string | null
          role: string
          role_switch_count: number | null
          selfie_encrypted: string | null
          selfie_image: string | null
          status: string | null
          strn_number: string | null
          suspended_until: string | null
          suspension_reason: string | null
          suspension_type: string | null
          updated_at: string | null
          verification_notes: string | null
          verification_otp: string | null
          verification_status: string | null
          years_in_business: string | null
        }
        Insert: {
          address?: string | null
          auth_type?: string | null
          business_name?: string | null
          business_type?: string | null
          can_switch_roles?: boolean | null
          city?: string | null
          cnic_encrypted?: string | null
          cnic_image?: string | null
          contact_name?: string | null
          created_at?: string | null
          data_retention_consent?: boolean | null
          data_retention_date?: string | null
          display_identifier?: string | null
          email: string
          email_verified?: boolean | null
          email_verified_at?: string | null
          id: string
          industry?: string | null
          is_email_user?: boolean | null
          is_suspended?: boolean | null
          last_order_data?: Json | null
          last_otp_request?: string | null
          last_role_switch?: string | null
          normalized_phone?: string | null
          ntn_number?: string | null
          otp_attempts?: number | null
          otp_code?: string | null
          otp_expires_at?: string | null
          phone_encrypted?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          postal_code?: string | null
          role?: string
          role_switch_count?: number | null
          selfie_encrypted?: string | null
          selfie_image?: string | null
          status?: string | null
          strn_number?: string | null
          suspended_until?: string | null
          suspension_reason?: string | null
          suspension_type?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_otp?: string | null
          verification_status?: string | null
          years_in_business?: string | null
        }
        Update: {
          address?: string | null
          auth_type?: string | null
          business_name?: string | null
          business_type?: string | null
          can_switch_roles?: boolean | null
          city?: string | null
          cnic_encrypted?: string | null
          cnic_image?: string | null
          contact_name?: string | null
          created_at?: string | null
          data_retention_consent?: boolean | null
          data_retention_date?: string | null
          display_identifier?: string | null
          email?: string
          email_verified?: boolean | null
          email_verified_at?: string | null
          id?: string
          industry?: string | null
          is_email_user?: boolean | null
          is_suspended?: boolean | null
          last_order_data?: Json | null
          last_otp_request?: string | null
          last_role_switch?: string | null
          normalized_phone?: string | null
          ntn_number?: string | null
          otp_attempts?: number | null
          otp_code?: string | null
          otp_expires_at?: string | null
          phone_encrypted?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          postal_code?: string | null
          role?: string
          role_switch_count?: number | null
          selfie_encrypted?: string | null
          selfie_image?: string | null
          status?: string | null
          strn_number?: string | null
          suspended_until?: string | null
          suspension_reason?: string | null
          suspension_type?: string | null
          updated_at?: string | null
          verification_notes?: string | null
          verification_otp?: string | null
          verification_status?: string | null
          years_in_business?: string | null
        }
        Relationships: []
      }
      provinces: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
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
      security_config: {
        Row: {
          config_key: string
          config_value: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          resolved: boolean | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          resolved?: boolean | null
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          resolved?: boolean | null
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seller_addresses: {
        Row: {
          address_type: string
          area: string | null
          city: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          instructions: string | null
          is_default: boolean | null
          label: string | null
          postal_code: string
          province: string
          street_address: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_type?: string
          area?: string | null
          city: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_default?: boolean | null
          label?: string | null
          postal_code: string
          province: string
          street_address: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_type?: string
          area?: string | null
          city?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_default?: boolean | null
          label?: string | null
          postal_code?: string
          province?: string
          street_address?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shipping_configs: {
        Row: {
          additional_weight_rate: number | null
          base_weight_rate: number | null
          city_rates: Json | null
          created_at: string | null
          custom_rates: Json | null
          estimated_delivery_days: number | null
          express_delivery_days: number | null
          express_shipping_available: boolean | null
          express_shipping_cost: number | null
          flat_rate_cost: number | null
          free_shipping_above: number | null
          id: string
          is_active: boolean | null
          max_free_weight: number | null
          shipping_method: string
          shop_id: string
          updated_at: string | null
        }
        Insert: {
          additional_weight_rate?: number | null
          base_weight_rate?: number | null
          city_rates?: Json | null
          created_at?: string | null
          custom_rates?: Json | null
          estimated_delivery_days?: number | null
          express_delivery_days?: number | null
          express_shipping_available?: boolean | null
          express_shipping_cost?: number | null
          flat_rate_cost?: number | null
          free_shipping_above?: number | null
          id?: string
          is_active?: boolean | null
          max_free_weight?: number | null
          shipping_method?: string
          shop_id: string
          updated_at?: string | null
        }
        Update: {
          additional_weight_rate?: number | null
          base_weight_rate?: number | null
          city_rates?: Json | null
          created_at?: string | null
          custom_rates?: Json | null
          estimated_delivery_days?: number | null
          express_delivery_days?: number | null
          express_shipping_available?: boolean | null
          express_shipping_cost?: number | null
          flat_rate_cost?: number | null
          free_shipping_above?: number | null
          id?: string
          is_active?: boolean | null
          max_free_weight?: number | null
          shipping_method?: string
          shop_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_configs_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_details: {
        Row: {
          actual_delivery: string | null
          courier_name: string
          created_at: string | null
          created_by: string | null
          dimensions: string | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          order_id: string
          package_count: number | null
          shipping_cost: number | null
          shipping_label_url: string | null
          tracking_number: string | null
          tracking_url: string | null
          weight_kg: number | null
        }
        Insert: {
          actual_delivery?: string | null
          courier_name: string
          created_at?: string | null
          created_by?: string | null
          dimensions?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_id: string
          package_count?: number | null
          shipping_cost?: number | null
          shipping_label_url?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          weight_kg?: number | null
        }
        Update: {
          actual_delivery?: string | null
          courier_name?: string
          created_at?: string | null
          created_by?: string | null
          dimensions?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          package_count?: number | null
          shipping_cost?: number | null
          shipping_label_url?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: []
      }
      sms_logs: {
        Row: {
          cost: number | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          message_content: string | null
          message_type: string
          metadata: Json | null
          phone_number: string
          provider: string | null
          provider_message_id: string | null
          retry_count: number | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          message_type: string
          metadata?: Json | null
          phone_number: string
          provider?: string | null
          provider_message_id?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          message_type?: string
          metadata?: Json | null
          phone_number?: string
          provider?: string | null
          provider_message_id?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_wholesaler_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public: {
        Row: {
          business_name: string | null
          city: string | null
          created_at: string | null
          id: string | null
          role: string | null
          verification_status: string | null
        }
        Insert: {
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          role?: string | null
          verification_status?: string | null
        }
        Update: {
          business_name?: string | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          role?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      public_wholesaler_profiles: {
        Row: {
          business_name: string | null
          business_type: string | null
          city: string | null
          id: string | null
          verification_status: string | null
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          id?: string | null
          verification_status?: string | null
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      security_metrics: {
        Row: {
          measured_at: string | null
          metric: string | null
          value: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_order_tracking: {
        Args: { p_notes?: string; p_order_id: string; p_status: string }
        Returns: string
      }
      archive_old_commission_records: { Args: never; Returns: undefined }
      associate_phone_with_account: {
        Args: { p_email: string; p_phone_number: string }
        Returns: Json
      }
      authenticate_user_by_identifier: {
        Args: { identifier: string }
        Returns: Json
      }
      authenticate_user_by_phone:
        | { Args: { user_phone: string }; Returns: Json }
        | {
            Args: { p_password: string; p_phone_number: string }
            Returns: Json
          }
      calculate_shipping_cost: {
        Args: {
          p_buyer_city?: string
          p_is_express?: boolean
          p_order_amount: number
          p_shop_id: string
          p_total_weight?: number
        }
        Returns: Json
      }
      can_access_commission_data: {
        Args: { p_wholesaler_id: string }
        Returns: boolean
      }
      can_request_otp: { Args: { user_phone: string }; Returns: boolean }
      check_account_lockout: { Args: { user_phone: string }; Returns: Json }
      check_guest_order_rate_limit: {
        Args: { p_ip_address: unknown; p_session_id: string }
        Returns: boolean
      }
      check_operation_rate_limit: {
        Args: {
          p_max_attempts?: number
          p_operation: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_otp_rate_limit: { Args: { p_user_id: string }; Returns: boolean }
      check_phone_exists: { Args: { p_phone: string }; Returns: boolean }
      check_profile_rate_limit: { Args: never; Returns: boolean }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_ip_address: unknown
          p_max_requests?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_security_status: { Args: never; Returns: Json }
      check_user_exists: {
        Args: { p_email?: string; p_phone?: string }
        Returns: Json
      }
      cleanup_auth_attempts_aggressive: { Args: never; Returns: undefined }
      cleanup_expired_data: { Args: never; Returns: undefined }
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
      cleanup_old_audit_logs_aggressive: { Args: never; Returns: undefined }
      cleanup_old_auth_attempts: { Args: never; Returns: undefined }
      cleanup_old_data: { Args: never; Returns: undefined }
      cleanup_old_guest_orders: { Args: never; Returns: undefined }
      cleanup_old_product_views: { Args: never; Returns: undefined }
      cleanup_old_sms_logs: { Args: never; Returns: undefined }
      cleanup_payment_screenshots_aggressive: {
        Args: never
        Returns: undefined
      }
      cleanup_product_views_aggressive: { Args: never; Returns: undefined }
      cleanup_sensitive_data: { Args: never; Returns: undefined }
      cleanup_sms_logs_aggressive: { Args: never; Returns: undefined }
      delete_completed_order_screenshots: { Args: never; Returns: undefined }
      delete_old_payment_screenshots: { Args: never; Returns: undefined }
      delete_old_screenshots: { Args: never; Returns: undefined }
      delete_old_verification_documents: { Args: never; Returns: undefined }
      detect_unusual_access_patterns: { Args: never; Returns: undefined }
      generate_csrf_token: { Args: never; Returns: string }
      generate_otp: { Args: never; Returns: string }
      get_active_products_list: {
        Args: never
        Returns: {
          category_id: string
          created_at: string
          description: string
          id: string
          image: string
          is_active: boolean
          moq: number
          name: string
          price: number
          sample_available: boolean
          sample_price: number
          shop_id: string
          shop_logo: string
          shop_name: string
          verification_status: string
        }[]
      }
      get_available_phones: {
        Args: never
        Returns: {
          email: string
          normalized_phone: string
          phone_number: string
          role: string
        }[]
      }
      get_commission_data_secure: {
        Args: { p_wholesaler_id: string }
        Returns: {
          commission_amount: string
          commission_rate: number
          created_at: string
          id: string
          order_id: string
          sale_amount: string
          status: string
        }[]
      }
      get_current_commission_rate: { Args: never; Returns: number }
      get_effective_user_role: { Args: never; Returns: string }
      get_order_details_secure: { Args: { p_order_id: string }; Returns: Json }
      get_payment_methods_secure: {
        Args: { shop_id: string }
        Returns: {
          account_number_masked: string
          account_title: string
          bank_name: string
          easypaisa_masked: string
          id: string
          is_active: boolean
          jazzcash_masked: string
          wholesaler_id: string
        }[]
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
      get_profile_summary: { Args: { profile_id: string }; Returns: Json }
      get_public_profile_info: { Args: { profile_id: string }; Returns: Json }
      get_safe_profile_data: { Args: { user_id: string }; Returns: Json }
      get_safe_profile_summary: { Args: { profile_id: string }; Returns: Json }
      get_secure_payment_methods: {
        Args: { shop_id: string }
        Returns: {
          account_number_masked: string
          account_title: string
          bank_name: string
          easypaisa_masked: string
          id: string
          is_active: boolean
          jazzcash_masked: string
          wholesaler_id: string
        }[]
      }
      get_security_dashboard: {
        Args: never
        Returns: {
          checked_at: string
          metric: string
          value: number
        }[]
      }
      get_security_stats: { Args: never; Returns: Json }
      get_user_by_phone: {
        Args: { phone_input: string }
        Returns: {
          user_email: string
          user_role: string
        }[]
      }
      get_user_role: { Args: never; Returns: string }
      get_user_role_secure: {
        Args: { _user_id?: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      log_security_event: {
        Args: {
          p_details?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_severity?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      mask_sensitive_data: {
        Args: { field_type: string; field_value: string }
        Returns: string
      }
      monitor_product_view_patterns: { Args: never; Returns: undefined }
      monitor_profile_access: { Args: never; Returns: undefined }
      monitor_security_events: { Args: never; Returns: undefined }
      normalize_pakistani_phone: {
        Args: { phone_input: string }
        Returns: string
      }
      run_all_cleanups: { Args: never; Returns: undefined }
      switch_business_role: { Args: { target_role: string }; Returns: Json }
      sync_auth_profiles: { Args: never; Returns: undefined }
      track_product_view: {
        Args: {
          p_product_id: string
          p_referrer?: string
          p_session_id?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      update_sms_status: {
        Args: {
          p_cost?: number
          p_error_message?: string
          p_provider_message_id?: string
          p_sms_log_id: string
          p_status: string
        }
        Returns: undefined
      }
      validate_admin_access: {
        Args: { p_ip_address?: unknown }
        Returns: boolean
      }
      validate_admin_session: {
        Args: { p_session_token: string }
        Returns: boolean
      }
      validate_auth_input: {
        Args: { input_value: string }
        Returns: {
          error_message: string
          input_type: string
          normalized_value: string
        }[]
      }
      validate_csrf_token: { Args: { p_token: string }; Returns: boolean }
      validate_pakistani_phone: {
        Args: { phone_input: string }
        Returns: boolean
      }
      validate_password_strength: { Args: { password: string }; Returns: Json }
      verify_email_otp: {
        Args: { p_otp: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "wholesaler" | "seller" | "pending"
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
      app_role: ["admin", "wholesaler", "seller", "pending"],
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
