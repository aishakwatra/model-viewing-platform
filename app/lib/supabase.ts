import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on SQL schema
export interface User {
  user_id: number;
  user_role_id: number;
  email: string;
  password_hash: string;
  full_name: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Project {
  id: number;
  project_name: string;
  event_start_date: string | null;
  project_status_id: number;
  creator_id: number;
}

export interface ProjectClient {
  id: number;
  project_id: number;
  user_id: number;
}

export interface ProjectStatus {
  id: number;
  status: string;
}

export interface Model {
  id: number;
  model_name: string;
  project_id: number;
  model_category_id: number | null;
  created_at: string;
  status_id: number | null;
}

export interface ModelVersion {
  id: number;
  model_id: number;
  version: number;
  obj_file_path: string;
  can_download: boolean;
  created_at: string;
}

export interface ModelCategory {
  id: number;
  model_category: string;
}

export interface ModelStatus {
  id: number;
  status: string;
}

export interface UserFavourite {
  id: number;
  model_version_id: number;
  user_id: number;
}

export interface ModelImage {
  id: number;
  model_version_id: number;
  image_path: string;
}

export interface Comment {
  id: number;
  model_version_id: number;
  comment_text: string;
  created_at: string;
  user_id: number;
}

export interface ModelLog {
  id: number;
  model_id: number;
  log_text: string | null;
  created_at: string;
  user_id: number;
}
