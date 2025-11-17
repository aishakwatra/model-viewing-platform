import { supabase } from "./supabase";

export interface PendingApprovalUser {
  user_id: number;
  auth_user_id: string | null;
  email: string;
  full_name: string | null;
  created_at: string;
  user_roles: {
    role: string;
  } | null;
}

export async function fetchUnapprovedUsers(): Promise<PendingApprovalUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select(
      `user_id, auth_user_id, email, full_name, created_at, user_roles(role)`
    )
    .eq("is_approved", false);

  if (error) {
    console.error("Failed to fetch unapproved users", error);
    throw error;
  }

  return (data || []) as PendingApprovalUser[];
}

export async function approveUser(userId: number): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ is_approved: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to approve user", error);
    throw error;
  }
}

export async function rejectUser(userId: number): Promise<void> {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to reject user", error);
    throw error;
  }
}
