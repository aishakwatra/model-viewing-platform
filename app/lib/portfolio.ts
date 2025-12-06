
import { supabase } from "./supabase";

export interface PortfolioPage {
  id: number;
  portfolio_page_name: string; // Matches DB column
  creator_id: number;
}

// fetch all pages for a creator
export async function fetchPortfolioPages(creatorId: number) {
  const { data, error } = await supabase
    .from("portfolio_pages")
    .select("*")
    .eq("creator_id", creatorId)
    .order("id", { ascending: true }); // Ordering by ID or name

  if (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
  return data as PortfolioPage[];
}

// Create a new page
export async function createPortfolioPage(creatorId: number, name: string) {
  const { data, error } = await supabase
    .from("portfolio_pages")
    .insert({ 
      creator_id: creatorId, 
      portfolio_page_name: name // Matches DB column
    })
    .select()
    .single();

  if (error) throw error;
  return { success: true, page: data };
}

// Delete a page
export async function deletePortfolioPage(pageId: number) {
  const { error } = await supabase
    .from("portfolio_pages")
    .delete()
    .eq("id", pageId);
  
  if (error) throw error;
  return { success: true };
}

// Fetch models specifically for a page
export async function fetchPageModels(pageId: number) {

  const { data, error } = await supabase
    .from("portfolio_page_models")
    .select(`
      model_id,
      models (
        id,
        model_name,
        model_categories ( model_category ),
        model_versions (
          version,
          thumbnail_url
        )
      )
    `)
    .eq("portfolio_page_id", pageId); 

  if (error) {
    console.error("Error fetching page models:", error);
    return [];
  }

  // Process to get latest version thumbnail
  return data.map((item: any) => {
    const m = item.models;
    // Sort versions desc to get latest
    const versions = m.model_versions?.sort((a: any, b: any) => b.version - a.version) || [];
    const latest = versions[0];

    return {
      id: m.id.toString(),
      name: m.model_name,
      category: m.model_categories?.model_category || "Uncategorized",
      thumbnailUrl: latest?.thumbnail_url || "/sangeet-stage.png",
      version: latest?.version || "1.0"
    };
  });
}

// Add a model to a page
export async function addModelToPage(pageId: number, modelId: number) {
  const { error } = await supabase
    .from("portfolio_page_models")
    .insert({ 
      portfolio_page_id: pageId, 
      model_id: modelId 
    });

  if (error) {
    // Ignore duplicate error (unique constraint)
    if (error.code === '23505') return { success: true };
    throw error;
  }
  return { success: true };
}

// Remove a model from a page
export async function removeModelFromPage(pageId: number, modelId: number) {
  const { error } = await supabase
    .from("portfolio_page_models")
    .delete()
    .eq("portfolio_page_id", pageId) 
    .eq("model_id", modelId);

  if (error) throw error;
  return { success: true };
}

// Fetch all creators with their portfolio pages (with thumbnails)
export async function fetchAllCreatorsWithPortfolios() {
  // Fetch all portfolio pages with their creator information and first model
  const { data: portfolioPages, error } = await supabase
    .from("portfolio_pages")
    .select(`
      id,
      portfolio_page_name,
      creator_id,
      users!portfolio_pages_creator_id_fkey (
        user_id,
        full_name,
        email,
        photo_url
      ),
      portfolio_page_models (
        models (
          model_versions (
            thumbnail_url,
            version
          )
        )
      )
    `)
    .order("creator_id", { ascending: true });

  if (error) {
    console.error("Error fetching portfolio pages:", error);
    return [];
  }

  if (!portfolioPages || portfolioPages.length === 0) {
    return [];
  }

  // Process pages to extract thumbnail from first model
  const pagesWithThumbnails = portfolioPages.map((page: any) => {
    let thumbnailUrl = "/sangeet-stage.png"; // Default thumbnail
    
    // Get first model from portfolio_page_models
    if (page.portfolio_page_models && page.portfolio_page_models.length > 0) {
      const firstModel = page.portfolio_page_models[0];
      if (firstModel?.models?.model_versions) {
        const versions = firstModel.models.model_versions;
        // Get latest version (highest version number)
        const sortedVersions = Array.isArray(versions) 
          ? [...versions].sort((a: any, b: any) => b.version - a.version)
          : [versions];
        const latestVersion = sortedVersions[0];
        if (latestVersion?.thumbnail_url) {
          thumbnailUrl = latestVersion.thumbnail_url;
        }
      }
    }

    return {
      id: page.id,
      portfolio_page_name: page.portfolio_page_name,
      creator_id: page.creator_id,
      users: page.users,
      thumbnailUrl
    };
  });

  // Group portfolio pages by creator
  const creatorsMap = new Map<number, {
    id: number;
    name: string;
    email: string;
    photo_url: string | null;
    portfolioPages: Array<{
      id: number;
      portfolio_page_name: string;
      creator_id: number;
      thumbnailUrl: string;
    }>;
  }>();

  pagesWithThumbnails.forEach((page: any) => {
    const creator = page.users;
    if (!creator) return;

    const creatorId = creator.user_id;
    
    if (!creatorsMap.has(creatorId)) {
      creatorsMap.set(creatorId, {
        id: creatorId,
        name: creator.full_name || creator.email,
        email: creator.email,
        photo_url: creator.photo_url,
        portfolioPages: []
      });
    }

    creatorsMap.get(creatorId)?.portfolioPages.push({
      id: page.id,
      portfolio_page_name: page.portfolio_page_name,
      creator_id: page.creator_id,
      thumbnailUrl: page.thumbnailUrl
    });
  });

  // Convert map to array and sort by creator name
  return Array.from(creatorsMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}