import { supabase } from "./supabase";

export async function fetchCreatorProjects(creatorId: number) {
  try {
    const { data: rawProjects, error } = await supabase
      .from("projects")
      .select(`
        id,
        project_name,
        event_start_date,
        project_status ( status ),
        project_clients ( user_id ),
        models (
          id,
          model_name,
          created_at,
          model_status ( status ),
          model_categories ( model_category ),
          model_versions (
            version,
            model_images ( image_path )
          )
        )
      `)
      .eq("creator_id", creatorId)
      .order("id", { ascending: false });

    if (error) throw error;

    return (rawProjects || []).map((p: any) => {
      // Extract Client IDs for editing
      const clientIds = (p.project_clients || []).map((pc: any) => pc.user_id);

      const models = (p.models || []).map((m: any) => {
        const latestVer = m.model_versions?.sort((a: any, b: any) => b.version - a.version)[0];
        const versions = m.model_versions?.map((v: any) => v.version.toString()) || [];
        
        return {
          id: m.id.toString(),
          name: m.model_name,
          category: m.model_categories?.model_category || "Uncategorized",
          version: latestVer?.version?.toString() || "1.0",
          status: m.model_status?.status || "Draft",
          thumbnailUrl: latestVer?.model_images?.[0]?.image_path || "/sangeet-stage.png",
          versions: versions.length > 0 ? versions : ["1.0"]
        };
      });

      const startDate = p.event_start_date 
        ? new Date(p.event_start_date).toISOString().split('T')[0] 
        : "";

      return {
        id: p.id.toString(),
        name: p.project_name,
        startDate: startDate,
        modelCount: models.length,
        lastUpdated: "Recently",
        status: p.project_status?.status || "Active",
        models: models,
        clientIds: clientIds 
      };
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function fetchClients() {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, full_name, email, user_roles!inner(role)")
    .eq("user_roles.role", "USER") 
    .eq("is_approved", true);

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
  return data || [];
}


export async function fetchModelStatuses() {
    const { data } = await supabase.from("model_status").select("id, status");
    return data || [];
}

export async function updateModelStatus(modelId: number, statusId: number) {
    const { error } = await supabase
        .from("models")
        .update({ status_id: statusId })
        .eq("id", modelId);
    return { success: !error };
}


export async function createNewProject(
  creatorId: number,
  projectName: string,
  startDate: string,
  clientIds: number[]
) {
  try {
    // 1. Get Default Status ID (e.g., "In Progress")
    const { data: statusData } = await supabase
      .from("project_status")
      .select("id")
      .ilike("status", "In Progress")
      .maybeSingle();
    
    const statusId = statusData?.id || 1;

    // 2. Insert Project
    const { data: project, error: projError } = await supabase
      .from("projects")
      .insert({
        project_name: projectName,
        event_start_date: startDate || null,
        creator_id: creatorId,
        project_status_id: statusId
      })
      .select()
      .single();

    if (projError) throw projError;

    // 3. Insert Project Clients
    if (clientIds.length > 0 && project) {
      const clientLinks = clientIds.map(clientId => ({
        project_id: project.id,
        user_id: clientId
      }));

      const { error: linkError } = await supabase
        .from("project_clients")
        .insert(clientLinks);

      if (linkError) throw linkError;
    }

    return { success: true, project };

  } catch (error) {
    console.error("Error creating project:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}

export async function updateProject(
  projectId: number,
  name: string,
  startDate: string,
  clientIds: number[]
) {
  try {
    // 1. Update Project Details
    const { error: projError } = await supabase
      .from("projects")
      .update({
        project_name: name,
        event_start_date: startDate || null,
      })
      .eq("id", projectId);

    if (projError) throw projError;

    // 2. Update Clients (Sync logic: Delete old -> Insert new)
    
    // A. Delete existing links for this project
    const { error: deleteError } = await supabase
      .from("project_clients")
      .delete()
      .eq("project_id", projectId);

    if (deleteError) throw deleteError;

    // B. Insert new links
    if (clientIds.length > 0) {
      const clientLinks = clientIds.map(clientId => ({
        // Note: project_clients id is auto-generated
        project_id: projectId,
        user_id: clientId
      }));

      const { error: insertError } = await supabase
        .from("project_clients")
        .insert(clientLinks);

      if (insertError) throw insertError;
    }

    return { success: true };

  } catch (error) {
    console.error("Error updating project:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}