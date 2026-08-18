/**
 * Supabase 数据库类型定义。
 * 与 supabase/schema.sql 中的 notes 表保持一致。
 * 运行 `supabase gen types typescript` 可自动生成并覆盖此文件。
 */
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
      notes: {
        Row: {
          id: string;
          title: string;
          content: Json | null;
          parent_id: string | null;
          position: number;
          icon: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          title?: string;
          content?: Json | null;
          parent_id?: string | null;
          position?: number;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: Json | null;
          parent_id?: string | null;
          position?: number;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
