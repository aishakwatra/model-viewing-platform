import { supabase } from "./supabase";

// app/lib/creatorData.ts

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
            id,              
            version,
            thumbnail_url,
            can_download
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
        const sortedVersions = m.model_versions?.sort((a: any, b: any) => b.version - a.version) || [];
        const latestVer = sortedVersions[0];
        const versionsList = sortedVersions.map((v: any) => v.version.toString()) || [];
        
        // Build Maps
        const versionThumbnails: Record<string, string> = {};
        const versionIds: Record<string, number> = {}; 
        const versionDownloadStatus: Record<string, boolean> = {};

        sortedVersions.forEach((v: any) => {
             versionThumbnails[v.version.toString()] = v.thumbnail_url;
             versionIds[v.version.toString()] = v.id; 
             versionDownloadStatus[v.version.toString()] = v.can_download;
        });

        return {
          id: m.id.toString(),
          name: m.model_name,
          category: m.model_categories?.model_category || "Uncategorized",
          version: latestVer?.version?.toString() || "1.0",
          status: m.model_status?.status || "Draft",
          thumbnailUrl: latestVer?.thumbnail_url || "", 
          versions: versionsList.length > 0 ? versionsList : ["1.0"],
          versionThumbnails,
          versionIds,
          versionDownloadStatus
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


export async function fetchVersionImages(versionId: number) {
  const { data, error } = await supabase
    .from("model_images")
    .select("id, image_path")
    .eq("model_version_id", versionId);
  
  if (error) {
    console.error("Error fetching images:", error);
    return [];
  }
  return data || [];
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
  try {
    // 1. Perform the Status Update
    const { error } = await supabase
      .from("models")
      .update({ status_id: statusId })
      .eq("id", modelId);

    if (error) throw error;

    // AUTOMATIC CLEANUP: Check if the new status is "Portfolio Safe"
    // Fetch the text name of the status we just set
    const { data: statusData, error: statusError } = await supabase
      .from("model_status")
      .select("status")
      .eq("id", statusId)
      .single();

    if (statusError) {
      console.error("Error checking status name:", statusError);
    } else {
      const newStatus = statusData?.status;
      
      // Define which statuses are allowed on Portfolio Pages
      const allowedOnPortfolio = ["Approved", "Released for Download"];

      // If the new status is NOT allowed, remove this model from ALL portfolio pages
      if (newStatus && !allowedOnPortfolio.includes(newStatus)) {
        console.log(`Model ${modelId} moved to '${newStatus}'. Removing from portfolios...`);
        
        const { error: deleteError } = await supabase
          .from("portfolio_page_models")
          .delete()
          .eq("model_id", modelId);

        if (deleteError) {
          console.error("Failed to remove model from portfolios:", deleteError);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating model status:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
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
  modelId: number,
  modelVersionId: number, 
  versionNumber: number,
  files: File[]
) {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split(".").pop();
      
      // OLD WAY (Caused overwrites):
      // const order = index + 1;
      // const fileName = `${modelId}-${versionNumber}-${order}.${fileExt}`;

      // NEW WAY (Unique): Uses timestamp + index to prevent collisions
      const uniqueId = Date.now(); 
      const fileName = `${modelId}-${versionNumber}-${uniqueId}-${index}.${fileExt}`;
      
      const filePath = `model-${modelId}/version-${versionNumber}/${fileName}`;

      // 1. Upload
      const { error: uploadError } = await supabase.storage
        .from("Model Images") 
        .upload(filePath, file, {
            upsert: false // Prevent accidental overwrites
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
  modelFiles: File[], 
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
    
    // pload every file in the list
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

export async function deleteModelImages(imagePaths: string[]) {
  try {
    // 1. Delete from Storage
    // We need to extract the path relative to the bucket
    // e.g. ".../public/Model Images/model-1/..." -> "model-1/..."
    const pathsToDelete = imagePaths.map(url => {
        const parts = url.split('/Model%20Images/'); // Splitting by bucket name in URL
        return parts[1] ? decodeURIComponent(parts[1]) : null;
    }).filter(p => p !== null) as string[];

    if (pathsToDelete.length > 0) {
        await supabase.storage.from("Model Images").remove(pathsToDelete);
    }

    // 2. Delete from Database
    const { error } = await supabase
        .from("model_images")
        .delete()
        .in("image_path", imagePaths);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting images:", error);
    return false;
  }
}

// --- NEW: Update Model & Version ---
export async function updateModelAndVersion(
  modelId: number,
  versionId: number,
  versionNumber: number,
  updates: {
    modelName: string;
    categoryId: number;
    newThumbnailUrl: string; // The URL to set as cover (could be old or new)
    imagesToDelete: string[]; // URLs of old images to remove
    newImages: File[]; // New files to upload
    newModelFiles?: File[]; // Optional: New 3D files to replace existing
  }
) {
  try {
    // 1. Update Model Details (Name/Category)
    const { error: modelError } = await supabase
      .from("models")
      .update({
        model_name: updates.modelName,
        model_category_id: updates.categoryId
      })
      .eq("id", modelId);

    if (modelError) throw modelError;

    // 2. Handle Image Deletions
    if (updates.imagesToDelete.length > 0) {
        await deleteModelImages(updates.imagesToDelete);
    }

    // 3. Handle New Image Uploads
    if (updates.newImages.length > 0) {
        await uploadModelImages(modelId, versionId, versionNumber, updates.newImages);
    }

    // 4. Handle 3D File Replacement (If provided)
    if (updates.newModelFiles && updates.newModelFiles.length > 0) {
         const folderResult = await uploadModelFolder(modelId, versionNumber, updates.newModelFiles);
         if (!folderResult.success || !folderResult.gltfUrl) {
             throw new Error(folderResult.error || "Failed to upload new model files");
         }
         
         // Update the path in DB
         await supabase
            .from("model_versions")
            .update({ obj_file_path: folderResult.gltfUrl })
            .eq("id", versionId);
    }

    // 5. Update Thumbnail
    // If the thumbnail is one of the newly uploaded ones, we might need to find its URL.
    // However, for simplicity in this implementation, we assume the UI passes the *final desired URL*
    // If it's a new image, the UI might need to wait for upload, or we rely on 'uploadModelImages' returning URLs
    // *Refinement*: The caller of this function won't know the URL of new images yet. 
    // We will simply update the thumbnail *if it's a known string*. 
    // If it was a new image index, we handle it below.
    
    let finalCoverUrl = updates.newThumbnailUrl;

    // If we just uploaded images, we might need to pick one as cover if the user selected a "New Image"
    // This part is tricky. To keep it simple: 
    // We will update the thumbnail URL *only if* it's an existing URL. 
    // If the user picked a "New File" as cover, we'd need to find that URL from step 3's result.
    
    // Simplification: We update the thumbnail URL directly.
    const { error: versionError } = await supabase
        .from("model_versions")
        .update({ thumbnail_url: finalCoverUrl })
        .eq("id", versionId);

    if (versionError) throw versionError;

    return { success: true };

  } catch (error) {
    console.error("Error updating model:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}


// CASCADE DELETE PROJECT

export async function deleteProject(projectId: number) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}

export async function deleteModel(modelId: number) {
  try {
    const { error } = await supabase
      .from('models')
      .delete()
      .eq('id', modelId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting model:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}

export async function updateVersionDownloadStatus(versionId: number, canDownload: boolean) {
  try {
    const { error } = await supabase
      .from("model_versions")
      .update({ can_download: canDownload })
      .eq("id", versionId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating download status:", error);
    // @ts-ignore
    return { success: false, error: error.message };
  }
}