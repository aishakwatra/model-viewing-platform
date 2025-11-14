import { supabase } from "./supabase";

export interface PendingCreatorRequest {
  user_id: number;
  email: string;
  full_name: string | null;
  created_at: string;
}

export async function fetchPendingRequests(): Promise<PendingCreatorRequest[]> {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, email, full_name, created_at")
    .eq("user_role_id", 2);

  if (error) {
    console.error("Failed to fetch pending requests", error);
    throw error;
  }

  return data || [];
}

export async function approveUserRole(userId: number): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ user_role_id: 3 })
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to approve user role", error);
    throw error;
  }
}

export async function rejectUserRole(userId: number): Promise<void> {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to reject user role", error);
    throw error;
  }
}
