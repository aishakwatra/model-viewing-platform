import { supabase } from "./supabase";

// Fetch projects accessible by a specific user (client)
export async function fetchUserProjects(userId: number) {
  try {
    // Get project_clients entries for this user
    const { data: projectClients, error: pcError } = await supabase
      .from("project_clients")
      .select("project_id")
      .eq("user_id", userId);

    if (pcError) throw pcError;

    if (!projectClients || projectClients.length === 0) {
      return [];
    }

    const projectIds = projectClients.map((pc) => pc.project_id);

    // Fetch full project details with status
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(
        `
        id,
        project_name,
        event_start_date,
        project_status_id,
        creator_id,
        project_status (
          status
        )
      `
      )
      .in("id", projectIds);

    if (projectsError) throw projectsError;

    // For each project, count the number of models
    const projectsWithCounts = await Promise.all(
      (projects || []).map(async (project) => {
        const { count, error: countError } = await supabase
          .from("models")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id);

        if (countError) {
          console.error("Error counting models:", countError);
        }

        return {
          ...project,
          model_count: count || 0,
        };
      })
    );

    return projectsWithCounts;
  } catch (error) {
    console.error("Error fetching user projects:", error);
    throw error;
  }
}

// Fetch user's favorite model versions
export async function fetchUserFavourites(userId: number) {
  try {
    const { data, error } = await supabase
      .from("user_favourites")
      .select(
        `
        id,
        model_version_id,
        model_versions (
          id,
          model_id,
          version,
          obj_file_path,
          can_download,
          created_at,
          models (
            id,
            model_name,
            project_id
          ),
          model_images (
            id,
            image_path
          )
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching user favourites:", error);
    throw error;
  }
}

// Fetch models for a specific project
export async function fetchProjectModels(projectId: number) {
  try {
    const { data, error } = await supabase
      .from("models")
      .select(
        `
        id,
        model_name,
        project_id,
        model_category_id,
        created_at,
        status_id,
        model_categories (
          model_category
        ),
        model_status (
          status
        )
      `
      )
      .eq("project_id", projectId);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching project models:", error);
    throw error;
  }
}

// Fetch all versions of a model
export async function fetchModelVersions(modelId: number) {
  try {
    const { data, error } = await supabase
      .from("model_versions")
      .select(
        `
        id,
        model_id,
        version,
        obj_file_path,
        can_download,
        created_at,
        model_images (
          id,
          image_path
        )
      `
      )
      .eq("model_id", modelId)
      .order("version", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching model versions:", error);
    throw error;
  }
}

// Add or remove a favourite
export async function toggleFavourite(userId: number, modelVersionId: number) {
  try {
    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from("user_favourites")
      .select("id")
      .eq("user_id", userId)
      .eq("model_version_id", modelVersionId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" which is fine
      throw checkError;
    }

    if (existing) {
      // Remove favourite
      const { error: deleteError } = await supabase
        .from("user_favourites")
        .delete()
        .eq("id", existing.id);

      if (deleteError) throw deleteError;
      return { action: "removed" };
    } else {
      // Add favourite
      const { error: insertError } = await supabase
        .from("user_favourites")
        .insert({ user_id: userId, model_version_id: modelVersionId });

      if (insertError) throw insertError;
      return { action: "added" };
    }
  } catch (error) {
    console.error("Error toggling favourite:", error);
    throw error;
  }
}
