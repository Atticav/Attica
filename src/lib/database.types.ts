export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'admin' | 'client';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'client';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'client';
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          destination: string;
          destination_id: string | null;
          start_date: string | null;
          end_date: string | null;
          status: 'planning' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
          style: string | null;
          notes: string | null;
          budget_link: string | null;
          contract_pdf_url: string | null;
          contract_form_id: string | null;
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          destination: string;
          destination_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: 'planning' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
          style?: string | null;
          notes?: string | null;
          budget_link?: string | null;
          contract_pdf_url?: string | null;
          contract_form_id?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          destination?: string;
          destination_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: 'planning' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
          style?: string | null;
          notes?: string | null;
          budget_link?: string | null;
          contract_pdf_url?: string | null;
          contract_form_id?: string | null;
          cover_image_url?: string | null;
          updated_at?: string;
        };
      };
      itinerary_items: {
        Row: {
          id: string;
          trip_id: string;
          day_number: number;
          date: string | null;
          time: string | null;
          type: 'Embarque' | 'Passeio' | 'Refeição' | 'Transfer' | 'Check-in' | 'Check-out' | 'Livre' | 'Hotel' | 'Voo';
          title: string;
          description: string | null;
          location: string | null;
          city: string | null;
          priority: 'Alta' | 'Média' | 'Baixa';
          status: 'confirmed' | 'pending' | 'cancelled';
          confirmation_code: string | null;
          price: number | null;
          currency: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['itinerary_items']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['itinerary_items']['Insert']>;
      };
      financial_items: {
        Row: {
          id: string;
          trip_id: string;
          category: string;
          description: string;
          amount: number;
          currency: string;
          amount_brl: number | null;
          payment_date: string | null;
          due_date: string | null;
          status: 'paid' | 'pending' | 'overdue';
          payment_method: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['financial_items']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['financial_items']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          trip_id: string;
          name: string;
          type: string;
          file_url: string;
          file_size: number | null;
          mime_type: string | null;
          is_required: boolean;
          status: 'uploaded' | 'pending' | 'expired';
          expiry_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      packing_items: {
        Row: {
          id: string;
          trip_id: string;
          category: string;
          item_name: string;
          quantity: number;
          is_packed: boolean;
          is_essential: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['packing_items']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['packing_items']['Insert']>;
      };
      checklist_items: {
        Row: {
          id: string;
          trip_id: string;
          category: string;
          task: string;
          is_completed: boolean;
          due_days_before: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['checklist_items']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['checklist_items']['Insert']>;
      };
      strategic_sections: {
        Row: {
          id: string;
          trip_id: string;
          title: string;
          icon: string | null;
          content: string | null;
          links: Json | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['strategic_sections']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['strategic_sections']['Insert']>;
      };
      guide_videos: {
        Row: {
          id: string;
          trip_id: string;
          title: string;
          description: string | null;
          url: string | null;
          file_url: string | null;
          thumbnail_url: string | null;
          platform: 'youtube' | 'vimeo' | 'upload' | null;
          category: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['guide_videos']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['guide_videos']['Insert']>;
      };
      gallery_photos: {
        Row: {
          id: string;
          trip_id: string;
          title: string | null;
          description: string | null;
          file_url: string;
          thumbnail_url: string | null;
          category: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['gallery_photos']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['gallery_photos']['Insert']>;
      };
      restaurants: {
        Row: {
          id: string;
          trip_id: string;
          name: string;
          cuisine: string | null;
          city: string | null;
          address: string | null;
          price_range: number | null;
          rating: number | null;
          description: string | null;
          recommendation_reason: string | null;
          booking_url: string | null;
          maps_url: string | null;
          image_url: string | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
      };
      photography_tips: {
        Row: {
          id: string;
          trip_id: string;
          category: string;
          title: string;
          content: string;
          location: string | null;
          best_time: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['photography_tips']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['photography_tips']['Insert']>;
      };
      cultural_info: {
        Row: {
          id: string;
          trip_id: string;
          category: string;
          title: string;
          content: string;
          icon: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cultural_info']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['cultural_info']['Insert']>;
      };
      vocabulary_items: {
        Row: {
          id: string;
          trip_id: string;
          language: string;
          portuguese: string;
          translation: string;
          pronunciation: string | null;
          category: string | null;
          forvo_url: string | null;
          youglish_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vocabulary_items']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['vocabulary_items']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_trips: {
        Args: { user_id: string };
        Returns: Database['public']['Tables']['trips']['Row'][];
      };
    };
    Enums: Record<string, never>;
  };
}
