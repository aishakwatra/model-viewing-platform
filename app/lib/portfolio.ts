
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