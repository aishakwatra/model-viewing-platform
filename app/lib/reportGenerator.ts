import ExcelJS from "exceljs";
import { supabase } from "./supabase";

export interface ReportDateRange {
  start?: string | null;
  end?: string | null;
}

export interface ReportOptions {
  creatorProjectsSummary?: boolean;
  topFavoritedProjects?: boolean;
  activeClientsCount?: boolean;
  dateRange?: ReportDateRange;
}

interface CreatorProjectData {
  user_id: number;
  username: string;
  project_id: number;
  project_name: string;
  created_at: string;
  status: string;
  project_count_total: number;
  model_count_total: number;
}

interface FavoritedProjectData {
  project_id: number;
  project_name: string;
  creator_id: number;
  creator_username: string;
  favourite_count: number;
  last_favourited_at: string | null;
}

interface ActiveClientData {
  client_id: number;
  client_name: string;
  status: string;
  last_activity_at: string | null;
  projects_assigned_count: number;
}

/**
 * Fetch projects and models per creator (Model Users with role_id = 2)
 */
async function fetchCreatorProjectsSummary(dateRange?: ReportDateRange): Promise<CreatorProjectData[]> {
  try {
    // Build query for projects with creator info
    let projectQuery = supabase
      .from("projects")
      .select(`
        id,
        project_name,
        created_at,
        creator_id,
        project_status_id,
        users!projects_creator_id_fkey (
          user_id,
          full_name,
          user_role_id
        ),
        project_status (
          status
        )
      `)
      .eq("users.user_role_id", 2); // Filter for Model Users (creators)

    // Apply date range filter if provided
    if (dateRange?.start) {
      projectQuery = projectQuery.gte("created_at", dateRange.start);
    }
    if (dateRange?.end) {
      projectQuery = projectQuery.lte("created_at", dateRange.end);
    }

    const { data: projects, error: projectError } = await projectQuery;

    if (projectError) throw projectError;

    // Fetch model counts per project
    const { data: modelCounts, error: modelError } = await supabase
      .from("models")
      .select("project_id");

    if (modelError) throw modelError;

    // Count models per project
    const modelCountMap = (modelCounts || []).reduce((acc, model) => {
      acc[model.project_id] = (acc[model.project_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Count projects per creator
    const projectCountMap = (projects || []).reduce((acc, project) => {
      const creatorId = project.creator_id;
      acc[creatorId] = (acc[creatorId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Transform data
    const result: CreatorProjectData[] = (projects || []).map((project: any) => ({
      user_id: project.users.user_id,
      username: project.users.full_name || "Unknown",
      project_id: project.id,
      project_name: project.project_name,
      created_at: project.created_at || "",
      status: project.project_status?.status || "Unknown",
      project_count_total: projectCountMap[project.creator_id] || 0,
      model_count_total: modelCountMap[project.id] || 0,
    }));

    return result;
  } catch (error) {
    console.error("Error fetching creator projects summary:", error);
    return [];
  }
}

/**
 * Fetch most favourited projects
 */
async function fetchTopFavoritedProjects(dateRange?: ReportDateRange): Promise<FavoritedProjectData[]> {
  try {
    // Fetch all favourites with related data
    let favouritesQuery = supabase
      .from("user_favourites")
      .select(`
        id,
        model_version_id,
        model_versions!user_favourites_model_version_id_fkey (
          model_id,
          models!model_versions_model_id_fkey (
            project_id,
            projects!models_project_id_fkey (
              id,
              project_name,
              creator_id,
              users!projects_creator_id_fkey (
                user_id,
                full_name
              )
            )
          )
        )
      `);

    const { data: favourites, error: favouritesError } = await favouritesQuery;

    if (favouritesError) throw favouritesError;

    // Group by project and count favourites
    const projectFavMap: Record<number, {
      project_id: number;
      project_name: string;
      creator_id: number;
      creator_username: string;
      count: number;
    }> = {};

    (favourites || []).forEach((fav: any) => {
      const model = fav.model_versions?.models;
      const project = model?.projects;
      
      if (project) {
        const projectId = project.id;
        if (!projectFavMap[projectId]) {
          projectFavMap[projectId] = {
            project_id: projectId,
            project_name: project.project_name,
            creator_id: project.creator_id,
            creator_username: project.users?.full_name || "Unknown",
            count: 0,
          };
        }
        projectFavMap[projectId].count++;
      }
    });

    // Convert to array and sort by count
    const result: FavoritedProjectData[] = Object.values(projectFavMap)
      .map((item) => ({
        project_id: item.project_id,
        project_name: item.project_name,
        creator_id: item.creator_id,
        creator_username: item.creator_username,
        favourite_count: item.count,
        last_favourited_at: null, // Could be enhanced to track this
      }))
      .sort((a, b) => b.favourite_count - a.favourite_count);

    return result;
  } catch (error) {
    console.error("Error fetching top favourited projects:", error);
    return [];
  }
}

/**
 * Fetch active clients (users with role_id = 3)
 */
async function fetchActiveClients(dateRange?: ReportDateRange): Promise<ActiveClientData[]> {
  try {
    // Fetch clients (user_role_id = 3) with their project assignments
    const { data: clients, error: clientsError } = await supabase
      .from("users")
      .select(`
        user_id,
        full_name,
        user_role_id,
        created_at,
        is_approved
      `)
      .eq("user_role_id", 3)
      .eq("is_approved", true);

    if (clientsError) throw clientsError;

    // Fetch project assignments
    const { data: projectClients, error: projectClientsError } = await supabase
      .from("project_clients")
      .select("user_id, project_id");

    if (projectClientsError) throw projectClientsError;

    // Count projects per client
    const projectCountMap = (projectClients || []).reduce((acc, pc) => {
      acc[pc.user_id] = (acc[pc.user_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Transform data
    const result: ActiveClientData[] = (clients || []).map((client: any) => ({
      client_id: client.user_id,
      client_name: client.full_name || "Unknown",
      status: client.is_approved ? "Active" : "Inactive",
      last_activity_at: client.created_at || null,
      projects_assigned_count: projectCountMap[client.user_id] || 0,
    }));

    return result;
  } catch (error) {
    console.error("Error fetching active clients:", error);
    return [];
  }
}

/**
 * Generate Excel report based on selected options
 */
export async function generateAdminReport(options: ReportOptions): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();

  // ------------------------------------------------------------
  // METADATA SHEET
  // ------------------------------------------------------------
  const meta = workbook.addWorksheet("metadata");
  meta.addRows([
    ["report_type", "Admin Report"],
    ["generated_at", new Date().toISOString()],
    ["date_range_start", options.dateRange?.start || "N/A"],
    ["date_range_end", options.dateRange?.end || "N/A"],
    ["includes_creator_projects", options.creatorProjectsSummary ? "Yes" : "No"],
    ["includes_top_favourites", options.topFavoritedProjects ? "Yes" : "No"],
    ["includes_active_clients", options.activeClientsCount ? "Yes" : "No"],
  ]);

  // Style metadata sheet
  meta.getColumn(1).width = 25;
  meta.getColumn(2).width = 30;
  meta.getRow(1).font = { bold: true };

  // ------------------------------------------------------------
  // PROJECTS & MODELS PER CREATOR
  // ------------------------------------------------------------
  if (options.creatorProjectsSummary) {
    const creatorData = await fetchCreatorProjectsSummary(options.dateRange);
    const perUser = workbook.addWorksheet("projects_per_creator");
    
    perUser.columns = [
      { header: "user_id", key: "user_id", width: 12 },
      { header: "username", key: "username", width: 25 },
      { header: "project_id", key: "project_id", width: 12 },
      { header: "project_name", key: "project_name", width: 35 },
      { header: "created_at", key: "created_at", width: 20 },
      { header: "status", key: "status", width: 15 },
      { header: "project_count_total", key: "project_count_total", width: 20 },
      { header: "model_count_total", key: "model_count_total", width: 20 },
    ];

    // Style header row
    perUser.getRow(1).font = { bold: true };
    perUser.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD4A574" }, // Brown/gold color
    };

    // Add data rows
    creatorData.forEach((row) => {
      perUser.addRow(row);
    });

    // Add summary at the end
    if (creatorData.length > 0) {
      perUser.addRow({});
      const summaryRow = perUser.addRow({
        user_id: "SUMMARY",
        username: `Total Creators: ${new Set(creatorData.map(d => d.user_id)).size}`,
        project_id: "",
        project_name: `Total Projects: ${creatorData.length}`,
        created_at: "",
        status: "",
        project_count_total: "",
        model_count_total: `Total Models: ${creatorData.reduce((sum, d) => sum + d.model_count_total, 0)}`,
      });
      summaryRow.font = { bold: true };
    }
  }

  // ------------------------------------------------------------
  // MOST FAVOURITED PROJECTS
  // ------------------------------------------------------------
  if (options.topFavoritedProjects) {
    const favoritedData = await fetchTopFavoritedProjects(options.dateRange);
    const favourites = workbook.addWorksheet("top_favourites");
    
    favourites.columns = [
      { header: "project_id", key: "project_id", width: 12 },
      { header: "project_name", key: "project_name", width: 35 },
      { header: "creator_id", key: "creator_id", width: 12 },
      { header: "creator_username", key: "creator_username", width: 25 },
      { header: "favourite_count", key: "favourite_count", width: 20 },
      { header: "last_favourited_at", key: "last_favourited_at", width: 20 },
    ];

    // Style header row
    favourites.getRow(1).font = { bold: true };
    favourites.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD4A574" },
    };

    // Add data rows
    favoritedData.forEach((row) => {
      favourites.addRow(row);
    });

    // Add summary
    if (favoritedData.length > 0) {
      favourites.addRow({});
      const summaryRow = favourites.addRow({
        project_id: "SUMMARY",
        project_name: `Total Projects: ${favoritedData.length}`,
        creator_id: "",
        creator_username: "",
        favourite_count: favoritedData.reduce((sum, d) => sum + d.favourite_count, 0),
        last_favourited_at: "",
      });
      summaryRow.font = { bold: true };
    }
  }

  // ------------------------------------------------------------
  // ACTIVE CLIENTS
  // ------------------------------------------------------------
  if (options.activeClientsCount) {
    const clientsData = await fetchActiveClients(options.dateRange);
    const clients = workbook.addWorksheet("active_clients");
    
    clients.columns = [
      { header: "client_id", key: "client_id", width: 12 },
      { header: "client_name", key: "client_name", width: 30 },
      { header: "status", key: "status", width: 15 },
      { header: "last_activity_at", key: "last_activity_at", width: 20 },
      { header: "projects_assigned_count", key: "projects_assigned_count", width: 25 },
    ];

    // Style header row
    clients.getRow(1).font = { bold: true };
    clients.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD4A574" },
    };

    // Add data rows
    clientsData.forEach((row) => {
      clients.addRow(row);
    });

    // Add summary
    if (clientsData.length > 0) {
      clients.addRow({});
      const summaryRow = clients.addRow({
        client_id: "SUMMARY",
        client_name: `Total Active Clients: ${clientsData.length}`,
        status: "",
        last_activity_at: "",
        projects_assigned_count: clientsData.reduce((sum, d) => sum + d.projects_assigned_count, 0),
      });
      summaryRow.font = { bold: true };
    }
  }

  // ------------------------------------------------------------
  // EXPORT FILE AS BLOB
  // ------------------------------------------------------------
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * Trigger download of the Excel file in the browser
 */
export function downloadExcelFile(blob: Blob, filename: string = "admin_report.xlsx") {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
