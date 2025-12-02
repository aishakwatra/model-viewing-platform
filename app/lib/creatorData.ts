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
            thumbnail_url
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
        // Sort versions descending (newest first)
        const sortedVersions = m.model_versions?.sort((a: any, b: any) => b.version - a.version) || [];
        const latestVer = sortedVersions[0];
        const versionsList = sortedVersions.map((v: any) => v.version.toString()) || [];
        
        // Map: Version -> Thumbnail URL
        const versionThumbnails: Record<string, string> = {};
        sortedVersions.forEach((v: any) => {
             versionThumbnails[v.version.toString()] = v.thumbnail_url;
        });

        return {
          id: m.id.toString(),
          name: m.model_name,
          category: m.model_categories?.model_category || "Uncategorized",
          version: latestVer?.version?.toString() || "1.0",
          status: m.model_status?.status || "Draft",
          thumbnailUrl: latestVer?.thumbnail_url || "", // Latest version's thumb
          versions: versionsList.length > 0 ? versionsList : ["1.0"],
          versionThumbnails: versionThumbnails // Pass the map to the UI
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

export async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from("model_categories")
      .select("id, model_category")
      .order("model_category");
      
    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching categories:", error);
    return [];
  }
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


export async function uploadModelImages(
  modelId: number,       // Added: needed for folder structure
  modelVersionId: number, 
  versionNumber: number, // Added: needed for file name
  files: File[]
) {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split(".").pop();
      
      // NEW NAMING LOGIC: {ModelID}-{VersionNumber}-{Order}.{ext}
      // e.g., "101-2-1.png" (Model 101, Version 2, Image 1)
      const order = index + 1;
      const fileName = `${modelId}-${versionNumber}-${order}.${fileExt}`;
      
      // NEW PATH STRUCTURE: model-{ID}/version-{V}/filename
      // e.g., "model-101/version-2/101-2-1.png"
      const filePath = `model-${modelId}/version-${versionNumber}/${fileName}`;

      // 1. Upload
      const { error: uploadError } = await supabase.storage
        .from("Model Images") 
        .upload(filePath, file, {
            upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Get URL
      const { data: { publicUrl } } = supabase.storage
        .from("Model Images")
        .getPublicUrl(filePath);

      // 3. Insert into DB
      const { error: dbError } = await supabase
        .from("model_images")
        .insert({
          model_version_id: modelVersionId,
          image_path: publicUrl 
        });

      if (dbError) throw dbError;

      return publicUrl;
    });

    const results = await Promise.all(uploadPromises);
    return { success: true, imageUrls: results };

  } catch (error) {
    console.error("Error uploading images:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}


export async function addModelToProject(
  projectId: number,
  name: string,
  categoryId: number,
  modelFiles: File[], // CHANGED: Now accepts File[] instead of string path
  imageFiles: File[] = [],
  thumbnailIndex: number = 0
) {
  try {
    const { data: statusData } = await supabase
      .from("model_status")
      .select("id")
      .ilike("status", "Draft") 
      .maybeSingle();
    const statusId = statusData?.id || 1;

    // 1. Insert Model
    const { data: model, error: modelError } = await supabase
      .from("models")
      .insert({
        model_name: name,
        project_id: projectId,
        model_category_id: categoryId,
        status_id: statusId
      })
      .select()
      .single();

    if (modelError) throw modelError;

    // 2. Upload Model Files (Folder) - We do this BEFORE creating version row
    //    so we have the real GLTF URL.
    //    We assume version 1 for a new model.
    const folderResult = await uploadModelFolder(model.id, 1, modelFiles);
    
    if (!folderResult.success || !folderResult.gltfUrl) {
       throw new Error(folderResult.error || "Failed to process model folder");
    }

    // 3. Insert Version 1 with the real GLTF URL
    const { data: version, error: versionError } = await supabase
      .from("model_versions")
      .insert({
        model_id: model.id,
        version: 1, 
        obj_file_path: folderResult.gltfUrl, // Use the real URL
        can_download: false
      })
      .select()
      .single();

    if (versionError) throw versionError;

    // 4. Upload Images & Handle Thumbnail
    if (imageFiles.length > 0 && version) {
        const result = await uploadModelImages(model.id, version.id, 1, imageFiles);
        if (result.success && result.imageUrls && result.imageUrls.length > 0) {
            const safeIndex = (thumbnailIndex >= 0 && thumbnailIndex < result.imageUrls.length) ? thumbnailIndex : 0;
            await supabase
                .from("model_versions")
                .update({ thumbnail_url: result.imageUrls[safeIndex] })
                .eq("id", version.id);
        }
    }

    return { success: true, model };
  } catch (error) {
    console.error("Error adding model:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}


export async function addNewVersionToModel(
  modelId: number,
  modelFiles: File[], // CHANGED: Now accepts File[] instead of string
  imageFiles: File[] = [],
  thumbnailIndex: number = 0
) {
  try {
    // 1. Determine next version number
    const { data: versions, error: fetchError } = await supabase
      .from("model_versions")
      .select("version")
      .eq("model_id", modelId)
      .order("version", { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;
    const currentMax = versions && versions.length > 0 ? versions[0].version : 0;
    const nextVersion = currentMax + 1;

    // 2. Upload Model Files first to get the URL
    const folderResult = await uploadModelFolder(modelId, nextVersion, modelFiles);

    if (!folderResult.success || !folderResult.gltfUrl) {
        throw new Error(folderResult.error || "Failed to process model folder");
    }

    // 3. Insert new version
    const { data: version, error: insertError } = await supabase
      .from("model_versions")
      .insert({
        model_id: modelId,
        version: nextVersion,
        obj_file_path: folderResult.gltfUrl, // Real URL
        can_download: false
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 4. Upload Images & Handle Thumbnail
    if (imageFiles.length > 0 && version) {
        const result = await uploadModelImages(modelId, version.id, nextVersion, imageFiles);
        if (result.success && result.imageUrls && result.imageUrls.length > 0) {
            const safeIndex = (thumbnailIndex >= 0 && thumbnailIndex < result.imageUrls.length) ? thumbnailIndex : 0;
            await supabase
                .from("model_versions")
                .update({ thumbnail_url: result.imageUrls[safeIndex] })
                .eq("id", version.id);
        }
    }

    return { success: true, version: nextVersion };
  } catch (error) {
    console.error("Error adding new version:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}


export async function uploadModelFolder(
  modelId: number,
  versionNumber: number,
  files: File[]
) {
  try {
    let gltfPath = "";
    
    // 1. Upload every file in the list
    const uploadPromises = files.map(async (file) => {
      // Use webkitRelativePath if available to preserve folder structure (textures/ etc.)
      // Fallback to name if it's flat
      // @ts-ignore - webkitRelativePath exists on File objects from folder inputs
      const relativePath = file.webkitRelativePath || file.name;
      
      // Remove the top-level folder name from the path if present (optional, but cleaner)
      // e.g. "MyModel/textures/img.png" -> "textures/img.png"
      // const cleanPath = relativePath.split('/').slice(1).join('/'); 
      // For safety, we'll keep the full structure to avoid collisions or just use unique prefix
      
      const storagePath = `model-${modelId}/version-${versionNumber}/${relativePath}`;

      const { error } = await supabase.storage
        .from("Models") // User specified bucket 'Models'
        .upload(storagePath, file, {
          upsert: true,
        });

      if (error) throw error;

      // 2. Identify the .gltf file
      if (file.name.endsWith(".gltf")) {
        const { data } = supabase.storage
          .from("Models")
          .getPublicUrl(storagePath);
        
        gltfPath = data.publicUrl;
      }
    });

    await Promise.all(uploadPromises);

    if (!gltfPath) {
      throw new Error("No .gltf file found in the uploaded folder.");
    }

    return { success: true, gltfUrl: gltfPath };

  } catch (error) {
    console.error("Error uploading model folder:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}

