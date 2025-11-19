import { supabase } from "./supabase";
import { Project } from "./types";

export async function fetchCreatorProjects(creatorId: number): Promise<Project[]> {
  try {
    
    //Getting projects for creator ID

    const { data: rawProjects, error } = await supabase
      .from("projects")
      .select(`
        id,
        project_name,
        event_start_date,
        project_status ( status ),
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

    if (error) {
      console.error("Supabase error fetching projects:", error);
      throw error;
    }

    // Transform the raw Database response into your UI 'Project' type
    const projects: Project[] = (rawProjects || []).map((p: any) => {
      
      // Map the models within the project
      const models = (p.models || []).map((m: any) => {
        // Sort versions to find the latest one (for version number and thumbnail)
        const sortedVersions = (m.model_versions || []).sort((a: any, b: any) => b.version - a.version);
        const latestVer = sortedVersions[0];
        
        // Create array of version strings ["2.0", "1.0"]
        const versionList = sortedVersions.map((v: any) => v.version.toString());

        // Fallback image if no versions or no images exist
        const thumbnail = latestVer?.model_images?.[0]?.image_path || "/sangeet-stage.png";

        return {
          id: m.id.toString(),
          name: m.model_name,
          category: m.model_categories?.model_category || "Uncategorized",
          version: latestVer?.version?.toString() || "1.0",
          status: m.model_status?.status || "Draft",
          thumbnailUrl: thumbnail,
          versions: versionList.length > 0 ? versionList : ["1.0"]
        };
      });

      // Format date (Handle nulls safely)
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
        models: models
      };
    });

    return projects;

  } catch (error) {
    console.error("Error in fetchCreatorProjects:", error);
    return [];
  }
}