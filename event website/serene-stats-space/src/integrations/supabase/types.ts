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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      amenities: {
        Row: {
          code: string
          created_at: string | null
          icon: string | null
          id: string
          name_ar: string
          name_he: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name_ar: string
          name_he: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name_ar?: string
          name_he?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      artist_genres: {
        Row: {
          artist_id: string
          genre_id: string
          id: string
        }
        Insert: {
          artist_id: string
          genre_id: string
          id?: string
        }
        Update: {
          artist_id?: string
          genre_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_genres_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          created_at: string | null
          id: string
          languages_ar: string[] | null
          languages_he: string[] | null
          performance_duration_min: number
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          languages_ar?: string[] | null
          languages_he?: string[] | null
          performance_duration_min?: number
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          languages_ar?: string[] | null
          languages_he?: string[] | null
          performance_duration_min?: number
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artists_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string | null
          date: string
          id: string
          note: string | null
          status: string
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          note?: string | null
          status?: string
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          budget: number | null
          city_id: string | null
          created_at: string | null
          customer_id: string
          event_date: string
          event_id: string | null
          guest_count: number | null
          id: string
          message: string | null
          status: string
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          city_id?: string | null
          created_at?: string | null
          customer_id?: string
          event_date: string
          event_id?: string | null
          guest_count?: number | null
          id?: string
          message?: string | null
          status?: string
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          city_id?: string | null
          created_at?: string | null
          customer_id?: string
          event_date?: string
          event_id?: string | null
          guest_count?: number | null
          id?: string
          message?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_status_history: {
        Row: {
          booking_request_id: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_status: string
          note: string | null
          previous_status: string | null
        }
        Insert: {
          booking_request_id: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          note?: string | null
          previous_status?: string | null
        }
        Update: {
          booking_request_id?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          note?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string | null
          id: string
          name_ar: string
          name_he: string
          region_id: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name_ar: string
          name_he: string
          region_id: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name_ar?: string
          name_he?: string
          region_id?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_records: {
        Row: {
          booking_request_id: string
          commission_amount: number
          commission_rate: number
          created_at: string | null
          id: string
          payment_id: string | null
        }
        Insert: {
          booking_request_id: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
        }
        Update: {
          booking_request_id?: string
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_records_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_records_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          booking_request_id: string | null
          created_at: string | null
          customer_id: string
          id: string
          last_message_at: string | null
          supplier_id: string
        }
        Insert: {
          booking_request_id?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          last_message_at?: string | null
          supplier_id: string
        }
        Update: {
          booking_request_id?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          last_message_at?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          created_at: string | null
          default_event_type_id: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_event_type_id?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_event_type_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_default_event_type_id_fkey"
            columns: ["default_event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          code: string
          created_at: string | null
          icon: string | null
          id: string
          name_ar: string
          name_he: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name_ar: string
          name_he: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          name_ar?: string
          name_he?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          city_id: string | null
          created_at: string | null
          event_date: string
          event_name: string
          event_type_id: string | null
          expected_guests: number
          id: string
          is_active: boolean
          location: string | null
          notes: string | null
          total_budget: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          event_date: string
          event_name: string
          event_type_id?: string | null
          expected_guests?: number
          id?: string
          is_active?: boolean
          location?: string | null
          notes?: string | null
          total_budget?: number
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          event_date?: string
          event_name?: string
          event_type_id?: string | null
          expected_guests?: number
          id?: string
          is_active?: boolean
          location?: string | null
          notes?: string | null
          total_budget?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          supplier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          supplier_id: string
          user_id?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          supplier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name_ar: string
          name_he: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name_ar: string
          name_he: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name_ar?: string
          name_he?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string | null
          id: string
          is_cover: boolean
          media_type: string
          sort_order: number
          supplier_id: string
          thumbnail_url: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_cover?: boolean
          media_type?: string
          sort_order?: number
          supplier_id: string
          thumbnail_url?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_cover?: boolean
          media_type?: string
          sort_order?: number
          supplier_id?: string
          thumbnail_url?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean
          message_text: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          message_text: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          message_text?: string
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
          body_ar: string | null
          body_he: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean
          title_ar: string | null
          title_he: string | null
          type: string
          user_id: string
        }
        Insert: {
          body_ar?: string | null
          body_he?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean
          title_ar?: string | null
          title_he?: string | null
          type: string
          user_id?: string
        }
        Update: {
          body_ar?: string | null
          body_he?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean
          title_ar?: string | null
          title_he?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          payment_id: string
          provider: string | null
          provider_transaction_id: string | null
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id: string
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string
          provider?: string | null
          provider_transaction_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_request_id: string
          created_at: string | null
          customer_id: string
          id: string
          payment_method: string | null
          payment_type: string
          status: string
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          booking_request_id: string
          created_at?: string | null
          customer_id: string
          id?: string
          payment_method?: string | null
          payment_type: string
          status?: string
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_request_id?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          payment_method?: string | null
          payment_type?: string
          status?: string
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          quantity?: number
          quotation_id: string
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          quantity?: number
          quotation_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          booking_request_id: string
          created_at: string | null
          customer_id: string
          description: string | null
          expiration_date: string | null
          id: string
          required_deposit: number
          status: string
          supplier_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          booking_request_id: string
          created_at?: string | null
          customer_id: string
          description?: string | null
          expiration_date?: string | null
          id?: string
          required_deposit?: number
          status?: string
          supplier_id: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          booking_request_id?: string
          created_at?: string | null
          customer_id?: string
          description?: string | null
          expiration_date?: string | null
          id?: string
          required_deposit?: number
          status?: string
          supplier_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string | null
          id: string
          name_ar: string
          name_he: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name_ar: string
          name_he: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name_ar?: string
          name_he?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_request_id: string | null
          comment: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          id: string
          is_verified: boolean
          rating: number
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          booking_request_id?: string | null
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          is_verified?: boolean
          rating: number
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          booking_request_id?: string | null
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          is_verified?: boolean
          rating?: number
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name_ar: string
          name_he: string
          sort_order: number
          supplier_type_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name_ar: string
          name_he: string
          sort_order?: number
          supplier_type_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name_ar?: string
          name_he?: string
          sort_order?: number
          supplier_type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_supplier_type_id_fkey"
            columns: ["supplier_type_id"]
            isOneToOne: false
            referencedRelation: "supplier_types"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_packages: {
        Row: {
          created_at: string | null
          description_ar: string | null
          description_he: string | null
          duration_hours: number | null
          id: string
          included_services: string[] | null
          name_ar: string | null
          name_he: string
          price: number
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description_ar?: string | null
          description_he?: string | null
          duration_hours?: number | null
          id?: string
          included_services?: string[] | null
          name_ar?: string | null
          name_he: string
          price?: number
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description_ar?: string | null
          description_he?: string | null
          duration_hours?: number | null
          id?: string
          included_services?: string[] | null
          name_ar?: string | null
          name_he?: string
          price?: number
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_packages_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_profiles: {
        Row: {
          address: string | null
          business_name_ar: string | null
          business_name_he: string
          city_id: string | null
          created_at: string | null
          description_ar: string | null
          description_he: string | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          is_featured: boolean
          is_verified: boolean
          max_price: number | null
          min_price: number | null
          phone: string | null
          rating: number
          review_count: number
          starting_price: number | null
          supplier_type_id: string
          tiktok: string | null
          total_bookings: number
          updated_at: string | null
          user_id: string | null
          verification_status: string
          website: string | null
          youtube: string | null
        }
        Insert: {
          address?: string | null
          business_name_ar?: string | null
          business_name_he: string
          city_id?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_he?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_featured?: boolean
          is_verified?: boolean
          max_price?: number | null
          min_price?: number | null
          phone?: string | null
          rating?: number
          review_count?: number
          starting_price?: number | null
          supplier_type_id: string
          tiktok?: string | null
          total_bookings?: number
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string
          website?: string | null
          youtube?: string | null
        }
        Update: {
          address?: string | null
          business_name_ar?: string | null
          business_name_he?: string
          city_id?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_he?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_featured?: boolean
          is_verified?: boolean
          max_price?: number | null
          min_price?: number | null
          phone?: string | null
          rating?: number
          review_count?: number
          starting_price?: number | null
          supplier_type_id?: string
          tiktok?: string | null
          total_bookings?: number
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string
          website?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_profiles_supplier_type_id_fkey"
            columns: ["supplier_type_id"]
            isOneToOne: false
            referencedRelation: "supplier_types"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_service_areas: {
        Row: {
          city_id: string | null
          created_at: string | null
          id: string
          region_id: string | null
          supplier_id: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          id?: string
          region_id?: string | null
          supplier_id: string
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          id?: string
          region_id?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_service_areas_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_service_areas_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_service_areas_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_types: {
        Row: {
          code: string
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean
          name_ar: string
          name_he: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name_ar: string
          name_he: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string
          name_he?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venue_amenities: {
        Row: {
          amenity_id: string
          id: string
          venue_id: string
        }
        Insert: {
          amenity_id: string
          id?: string
          venue_id: string
        }
        Update: {
          amenity_id?: string
          id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_amenities_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          created_at: string | null
          has_accessibility: boolean
          has_parking: boolean
          id: string
          is_kosher: boolean
          kosher_certificate: string | null
          latitude: number | null
          longitude: number | null
          max_guests: number
          min_guests: number
          price_per_guest: number
          supplier_id: string
          updated_at: string | null
          venue_type: string
        }
        Insert: {
          created_at?: string | null
          has_accessibility?: boolean
          has_parking?: boolean
          id?: string
          is_kosher?: boolean
          kosher_certificate?: string | null
          latitude?: number | null
          longitude?: number | null
          max_guests?: number
          min_guests?: number
          price_per_guest?: number
          supplier_id: string
          updated_at?: string | null
          venue_type?: string
        }
        Update: {
          created_at?: string | null
          has_accessibility?: boolean
          has_parking?: boolean
          id?: string
          is_kosher?: boolean
          kosher_certificate?: string | null
          latitude?: number | null
          longitude?: number | null
          max_guests?: number
          min_guests?: number
          price_per_guest?: number
          supplier_id?: string
          updated_at?: string | null
          venue_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      event_visible_to_supplier: { Args: { _eid: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_my_customer: { Args: { _uid: string }; Returns: boolean }
      owns_artist: { Args: { _aid: string }; Returns: boolean }
      owns_supplier: { Args: { _sid: string }; Returns: boolean }
      owns_venue: { Args: { _vid: string }; Returns: boolean }
      supplier_is_approved: { Args: { _sid: string }; Returns: boolean }
      taken_dates: { Args: { _sid: string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "supplier" | "customer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "supplier", "customer"],
    },
  },
} as const
