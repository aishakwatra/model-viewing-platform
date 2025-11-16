import { supabase } from "./supabase";

export interface PendingCreatorRequest {
  auth_user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export async function fetchPendingRequests(): Promise<PendingCreatorRequest[]> {
  const { data, error } = await supabase
    .from("users")
    .select("auth_user_id, email, full_name, created_at")
    .eq("user_role_id", 2);

  if (error) {
    console.error("Failed to fetch pending requests", error);
    throw error;
  }

  return data || [];
}

export async function approveUserRole(authUserId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ user_role_id: 3 })
    .eq("auth_user_id", authUserId);

  if (error) {
    console.error("Failed to approve user role", error);
    throw error;
  }
}

export async function rejectUserRole(authUserId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("auth_user_id", authUserId);

  if (error) {
    console.error("Failed to reject user role", error);
    throw error;
  }
}
