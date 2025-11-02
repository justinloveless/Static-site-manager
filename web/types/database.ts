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
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      sites: {
        Row: {
          id: string;
          name: string;
          repo_full_name: string;
          default_branch: string;
          github_installation_id: number;
          github_app_slug: string | null;
          settings: Json;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          repo_full_name: string;
          default_branch: string;
          github_installation_id: number;
          github_app_slug?: string | null;
          settings?: Json;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          repo_full_name?: string;
          default_branch?: string;
          github_installation_id?: number;
          github_app_slug?: string | null;
          settings?: Json;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_members: {
        Row: {
          site_id: string;
          user_id: string;
          role: 'owner' | 'manager' | 'viewer';
          created_at: string;
        };
        Insert: {
          site_id: string;
          user_id: string;
          role?: 'owner' | 'manager' | 'viewer';
          created_at?: string;
        };
        Update: {
          role?: 'owner' | 'manager' | 'viewer';
          created_at?: string;
        };
      };
      change_batches: {
        Row: {
          id: string;
          site_id: string;
          creator_user_id: string;
          state: 'open' | 'committing' | 'complete' | 'failed';
          commit_sha: string | null;
          commit_message: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          creator_user_id: string;
          state?: 'open' | 'committing' | 'complete' | 'failed';
          commit_sha?: string | null;
          commit_message?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          site_id?: string;
          creator_user_id?: string;
          state?: 'open' | 'committing' | 'complete' | 'failed';
          commit_sha?: string | null;
          commit_message?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      asset_versions: {
        Row: {
          id: string;
          site_id: string;
          storage_path: string;
          repo_path: string;
          file_size_bytes: number;
          checksum: string | null;
          status: 'pending' | 'staged' | 'committing' | 'committed' | 'failed';
          batch_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_id: string;
          storage_path: string;
          repo_path: string;
          file_size_bytes: number;
          checksum?: string | null;
          status?: 'pending' | 'staged' | 'committing' | 'committed' | 'failed';
          batch_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          site_id?: string;
          storage_path?: string;
          repo_path?: string;
          file_size_bytes?: number;
          checksum?: string | null;
          status?: 'pending' | 'staged' | 'committing' | 'committed' | 'failed';
          batch_id?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_log: {
        Row: {
          id: number;
          site_id: string;
          user_id: string | null;
          action: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          site_id: string;
          user_id?: string | null;
          action: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          site_id?: string;
          user_id?: string | null;
          action?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_site_member: {
        Args: { target_site_id: string };
        Returns: boolean;
      };
      is_site_member_from_path: {
        Args: { object_name: string };
        Returns: boolean;
      };
      set_current_timestamp_updated_at?: never;
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          owner: string | null;
          public: boolean;
          file_size_limit: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean;
          file_size_limit?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean;
          file_size_limit?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      objects: {
        Row: {
          id: string;
          bucket_id: string;
          name: string;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          last_accessed_at: string | null;
          metadata: Json | null;
          version: string | null;
        };
        Insert: {
          id?: string;
          bucket_id: string;
          name: string;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          id?: string;
          bucket_id?: string;
          name?: string;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          version?: string | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
