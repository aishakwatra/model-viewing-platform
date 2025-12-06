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

export interface ApprovedUser {
  user_id: number;
  email: string;
  full_name: string | null;
  photo_url: string | null;
  user_role_id: number;
  user_roles: {
    role: string;
  } | null;
  created_at: string;
}

export interface Project {
  id: number;
  project_name: string;
  event_start_date: string | null;
  project_status_id: number;
  creator_id: number;
  project_status: {
    status: string;
  } | null;
  creator: {
    full_name: string | null;
    email: string;
  } | null;
}

export interface UserProject {
  project_id: number;
  project_name: string;
  relationship: "creator" | "client";
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

export async function fetchApprovedUsers(): Promise<ApprovedUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select(`user_id, email, full_name, photo_url, user_role_id, created_at, user_roles(role)`)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch approved users", error);
    throw error;
  }

  return (data || []) as ApprovedUser[];
}

export async function fetchAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      id, 
      project_name, 
      event_start_date, 
      project_status_id, 
      creator_id,
      project_status(status),
      creator:users!creator_id(full_name, email)
    `)
    .order("project_name", { ascending: true });

  if (error) {
    console.error("Failed to fetch projects", error);
    throw error;
  }

  return (data || []) as Project[];
}

export async function fetchUserProjects(userId: number): Promise<UserProject[]> {
  // Fetch projects where user is creator
  const { data: creatorProjects, error: creatorError } = await supabase
    .from("projects")
    .select("id, project_name")
    .eq("creator_id", userId);

  if (creatorError) {
    console.error("Failed to fetch creator projects", creatorError);
    throw creatorError;
  }

  // Fetch projects where user is client
  const { data: clientProjects, error: clientError } = await supabase
    .from("project_clients")
    .select("project_id, projects(id, project_name)")
    .eq("user_id", userId);

  if (clientError) {
    console.error("Failed to fetch client projects", clientError);
    throw clientError;
  }

  const userProjects: UserProject[] = [
    ...(creatorProjects || []).map(p => ({
      project_id: p.id,
      project_name: p.project_name,
      relationship: "creator" as const,
    })),
    ...(clientProjects || []).map((pc: any) => ({
      project_id: pc.projects.id,
      project_name: pc.projects.project_name,
      relationship: "client" as const,
    })),
  ];

  return userProjects;
}

export async function addUserToProject(userId: number, projectId: number): Promise<void> {
  // Check if relationship already exists
  const { data: existing } = await supabase
    .from("project_clients")
    .select("id")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .single();

  if (existing) {
    throw new Error("User is already assigned to this project");
  }

  const { error } = await supabase
    .from("project_clients")
    .insert({ user_id: userId, project_id: projectId });

  if (error) {
    console.error("Failed to add user to project", error);
    throw error;
  }
}

export async function removeUserFromProject(userId: number, projectId: number): Promise<void> {
  const { error } = await supabase
    .from("project_clients")
    .delete()
    .eq("user_id", userId)
    .eq("project_id", projectId);

  if (error) {
    console.error("Failed to remove user from project", error);
    throw error;
  }
}
