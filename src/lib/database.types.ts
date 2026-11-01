export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        { id: string; display_name: string | null; avatar_url: string | null; timezone: string; created_at: string; updated_at: string },
        { id: string; display_name?: string | null; avatar_url?: string | null; timezone?: string },
        { display_name?: string | null; avatar_url?: string | null; timezone?: string }
      >;
      conversations: Table<
        { id: string; user_id: string; title: string; summary: string | null; created_at: string; updated_at: string },
        { id?: string; user_id: string; title?: string; summary?: string | null },
        { title?: string; summary?: string | null }
      >;
      messages: Table<
        { id: string; conversation_id: string; user_id: string; role: 'user' | 'assistant'; content: string; metadata: Json; created_at: string },
        { id?: string; conversation_id: string; user_id: string; role: 'user' | 'assistant'; content: string; metadata?: Json },
        { metadata?: Json }
      >;
      attachments: Table<
        { id: string; conversation_id: string; user_id: string; storage_path: string; original_name: string; mime_type: string; size_bytes: number; processing_status: 'uploaded' | 'processing' | 'ready' | 'failed'; extracted_text: string | null; metadata: Json; created_at: string },
        { id?: string; conversation_id: string; user_id: string; storage_path: string; original_name: string; mime_type: string; size_bytes: number; processing_status?: 'uploaded' | 'processing' | 'ready' | 'failed'; extracted_text?: string | null; metadata?: Json },
        { processing_status?: 'uploaded' | 'processing' | 'ready' | 'failed'; extracted_text?: string | null; metadata?: Json }
      >;
      user_preferences: Table<
        { user_id: string; theme: 'light' | 'dark' | 'system'; timezone: string; preferred_model: string | null; preferred_voice_provider: 'deepgram' | 'elevenlabs'; language: string; updated_at: string },
        { user_id: string; theme?: 'light' | 'dark' | 'system'; timezone?: string; preferred_model?: string | null; preferred_voice_provider?: 'deepgram' | 'elevenlabs'; language?: string },
        { theme?: 'light' | 'dark' | 'system'; timezone?: string; preferred_model?: string | null; preferred_voice_provider?: 'deepgram' | 'elevenlabs'; language?: string }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
