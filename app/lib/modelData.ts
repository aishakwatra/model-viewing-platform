import { supabase } from "./supabase";

// --- TYPES ---
export interface Comment {
  id: number;
  model_version_id: number;
  comment_text: string;
  created_at: string;
  user_id: number;
  user: {
    full_name: string;
    photo_url: string | null;
    role: string; 
  };
}

export interface ModelDetail {
  id: number;
  model_name: string;
  project_id: number;
  created_at: string;
  projects: { project_name: string };
  model_categories: { model_category: string };
  model_status: { status: string };
}

export interface ModelVersion {
  id: number;
  version: number;
  obj_file_path: string;
  thumbnail_url: string; 
  can_download: boolean;
  created_at: string;
  model_images: {
    id: number;
    image_path: string;
  }[];
}

// --- FUNCTIONS ---

export async function fetchModelDetails(modelId: number) {
  try {
    const { data, error } = await supabase
      .from("models")
      .select(`
        id,
        model_name,
        project_id,
        created_at,
        projects ( project_name ),
        model_categories ( model_category ),
        model_status ( status )
      `)
      .eq("id", modelId)
      .single();

    if (error) throw error;

    const rawData = data as any;

    const formattedData: ModelDetail = {
      ...rawData,
      projects: Array.isArray(rawData.projects) ? rawData.projects[0] : rawData.projects,
      model_categories: Array.isArray(rawData.model_categories) ? rawData.model_categories[0] : rawData.model_categories,
      model_status: Array.isArray(rawData.model_status) ? rawData.model_status[0] : rawData.model_status,
    };

    return formattedData;
  } catch (error) {
    console.error("Error fetching model details:", error);
    return null;
  }
}

export async function fetchModelVersions(modelId: number) {
  try {
    const { data, error } = await supabase
      .from("model_versions")
      .select(`
        *,
        model_images (
          id,
          image_path
        )
      `)
      .eq("model_id", modelId)
      .order("version", { ascending: false });

    if (error) throw error;
    return (data || []) as ModelVersion[];
  } catch (error) {
    console.error("Error fetching model versions:", error);
    return [];
  }
}

// --- UPDATED FETCH COMMENTS ---
export async function fetchComments(versionId: number) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        model_version_id,
        comment_text,
        created_at,
        user_id,
        users (
          full_name,
          photo_url,
          user_roles (
            role
          )
        )
      `)
      .eq("model_version_id", versionId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((c: any) => {
      // Safely extract nested user data
      const userData = Array.isArray(c.users) ? c.users[0] : c.users;
      const roleData = Array.isArray(userData?.user_roles) ? userData.user_roles[0] : userData?.user_roles;
      
      return {
        ...c,
        user: {
          full_name: userData?.full_name || "Unknown",
          photo_url: userData?.photo_url || null,
          role: roleData?.role || "USER" // Default to user if null
        }
      };
    }) as Comment[];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function postComment(versionId: number, userId: number, text: string) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        model_version_id: versionId,
        user_id: userId,
        comment_text: text
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error posting comment:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}


export async function deleteComment(commentId: number) {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}