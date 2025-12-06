// app/P_ClientDashboard/page.tsx
"use client";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { ProfileIcon } from "@/app/components/ui/Icons";
import { ChevronDownIcon, PortfolioIcon, FavouriteIcon } from "@/app/components/ui/Icons";
import { ClientFunctionCard } from "@/app/components/client/ClientFunctionCard";
import { FavouritesCarousel } from "@/app/components/client/FavouritesCarousel";
// import { UserSelector } from "@/app/components/UserSelector"; // No longer needed
import { fetchUserProjects, fetchUserFavourites, fetchProjectModels } from "@/app/lib/clientData";
import { getCurrentUser } from "@/app/lib/auth";
import { fetchAllCreatorsWithPortfolios } from "@/app/lib/portfolio";

interface ProjectData {
  id: number;
  project_name: string;
  event_start_date: string | null;
  project_status_id: number;
  creator_id: number;
  project_status?: { status: string } | null;
  model_count: number;
}

interface ModelData {
  id: number;
  model_name: string;
  project_id: number;
  model_category_id: number | null;
  created_at: string;
  status_id: number | null;
  model_categories?: { model_category: string } | null;
  model_status?: { status: string } | null;
  model_versions?: { version: number; thumbnail_url: string | null }[];
}

interface FavouriteData {
  id: number;
  model_version_id: number;
  model_versions: {
    id: number;
    model_id: number;
    version: number;
    obj_file_path: string;
    can_download: boolean;
    created_at: string;
    models: {
      id: number;
      model_name: string;
      project_id: number;
    };
    model_images: Array<{
      id: number;
      image_path: string;
    }>;
  };
}

interface CreatorWithPortfolios {
  id: number;
  name: string;
  email: string;
  photo_url: string | null;
  portfolioPages: Array<{
    id: number;
    portfolio_page_name: string;
    creator_id: number;
  }>;
}

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [favourites, setFavourites] = useState<FavouriteData[]>([]);
  const [projectModels, setProjectModels] = useState<Record<number, ModelData[]>>({});
  const [openProjects, setOpenProjects] = useState<number[]>([]);
  const [openFavouriteId, setOpenFavouriteId] = useState<number | null>(null);
  const [creators, setCreators] = useState<CreatorWithPortfolios[]>([]);
  const [openCreators, setOpenCreators] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = useMemo(
    () => [
      { key: "home", label: "Home", icon: <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
      { key: "projects", label: "Projects", icon: <PortfolioIcon /> },
      { key: "favourites", label: "Favourites", icon: <FavouriteIcon /> },
    ],
    []
  );

  // Initialize: Check authentication and load user data (without redirect)
  useEffect(() => {
    initializeDashboard();
  }, []);

  async function initializeDashboard() {
    try {
      setLoading(true);
      setError(null);

      // Load creators with portfolios (available to all users)
      const creatorsData = await fetchAllCreatorsWithPortfolios();
      console.log(`✅ Loaded ${creatorsData.length} creators with portfolios`);
      setCreators(creatorsData);
      // Auto-expand all creators on Home tab
      setOpenCreators(creatorsData.map(c => c.id));

      // Get authenticated user
      const user = getCurrentUser();
      
      if (!user) {
        console.log("ℹ️ No authenticated user found. Showing guest view.");
        setCurrentUser(null);
        setCurrentUserId(null);
        setProjects([]);
        setFavourites([]);
        return;
      }

      console.log("✅ Authenticated user:", user);
      setCurrentUser(user);
      setCurrentUserId(user.user_id);

      // Load user's projects and favourites
      await loadUserData(user.user_id);
    } catch (err) {
      console.error("Error initializing dashboard:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function loadUserData(userId: number) {
    try {
      console.log(`🔄 Loading data for user ID: ${userId}`);
      const [projectsData, favouritesData] = await Promise.all([
        fetchUserProjects(userId),
        fetchUserFavourites(userId),
      ]);
      
      console.log(`✅ Loaded ${projectsData.length} projects and ${favouritesData.length} favourites`);
      setProjects(projectsData as any as ProjectData[]);
setFavourites(favouritesData as any as FavouriteData[]);
    } catch (err) {
      console.error("Error loading user data:", err);
      throw err;
    }
  }



  async function loadProjectModels(projectId: number) {
    if (projectModels[projectId]) return; // Already loaded
    
    try {
      const models = await fetchProjectModels(projectId);
      setProjectModels(prev => ({ ...prev, [projectId]: models as any as ModelData[] }));
    } catch (err) {
      console.error("Failed to load project models:", err);
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 14) return "1 week ago";
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 60) return "1 month ago";
    return `${Math.floor(diffInDays / 30)} months ago`;
  }

  const groupedFavourites = useMemo(() => {
    const groups: Record<
      number,
      {
        modelId: number;
        modelName: string;
        versions: Array<{
          id: number;
          version: number;
          created_at: string;
          image_path: string | null;
        }>;
      }
    > = {};

    favourites.forEach((fav) => {
      const modelId = fav.model_versions.models.id;
      const modelName = fav.model_versions.models.model_name;

      if (!groups[modelId]) {
        groups[modelId] = {
          modelId,
          modelName,
          versions: [],
        };
      }

      groups[modelId].versions.push({
        id: fav.model_versions.id,
        version: fav.model_versions.version,
        created_at: fav.model_versions.created_at,
        image_path: fav.model_versions.model_images?.[0]?.image_path || null,
      });
    });

    return Object.values(groups);
  }, [favourites]);

  const filteredProjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.project_name.toLowerCase().includes(q));
  }, [projects, searchTerm]);

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", status === "Complete" || status === "Completed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"].join(" ")}>
      {status}
    </span>
  );

  const toggleProject = (id: number) => {
    const isCurrentlyOpen = openProjects.includes(id);
    
    if (!isCurrentlyOpen) {
      loadProjectModels(id);
    }
    
    setOpenProjects(prev =>
      prev.includes(id)
        ? prev.filter(projectId => projectId !== id)
        : [...prev, id]
    );
  };

  const toggleFavourite = (id: number) => {
    setOpenFavouriteId(prevId => (prevId === id ? null : id));
  };

  const toggleCreator = (id: number) => {
    setOpenCreators(prev =>
      prev.includes(id)
        ? prev.filter(creatorId => creatorId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-beige">
      <div className="border-b border-brown/10 bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-brown">Client Dashboard</h1>
              {currentUser ? (
                <p className="text-xs text-brown/60">
                  Welcome, {currentUser.full_name || currentUser.email}
                </p>
              ) : (
                <p className="text-xs text-brown/60">
                  Explore projects and models tailored for you.
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* UserSelector removed - using authenticated user */}

              {currentUser ? (
                <Link
                  href="/profile?from=client"
                  className="inline-flex items-center gap-2 rounded-xl border border-brown/10 bg-white px-4 py-2 text-sm font-medium text-brown shadow-[0_4px_12px_rgba(92,32,25,0.08)] transition hover:bg-brown/5"
                >
                  <ProfileIcon />
                  Profile
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth?mode=login"
                    className="inline-flex items-center gap-2 rounded-xl border border-brown/20 bg-white px-4 py-2 text-sm font-medium text-brown transition hover:bg-brown/5"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth?mode=signup"
                    className="inline-flex items-center gap-2 rounded-xl border border-brown/10 bg-gold/90 px-4 py-2 text-sm font-semibold text-brown transition hover:bg-gold"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-8">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-brown/5 border border-brown/10 self-start">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'brown' : 'ghost'}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2"
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <Card className="p-8 text-center">
            <div className="text-brown/70">Loading your dashboard...</div>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <div className="text-red-600">{error}</div>
            <Button 
              variant="brown" 
              onClick={initializeDashboard} 
              className="mt-4"
            >
              Retry
            </Button>
          </Card>
        ) : (
          <>
            {activeTab === "home" && (
              <div className="space-y-4">
                {creators.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-brown/70">No portfolio pages available</div>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {creators.map((creator) => {
                      const isOpen = openCreators.includes(creator.id);

                      return (
                        <Card key={creator.id} className="p-0 overflow-hidden">
                          <button className="w-full text-left p-4" onClick={() => toggleCreator(creator.id)}>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {creator.photo_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img 
                                    src={creator.photo_url} 
                                    alt={creator.name}
                                    className="size-10 rounded-full object-cover border-2 border-gold/30"
                                  />
                                ) : (
                                  <div className="size-10 rounded-full bg-gold/20 flex items-center justify-center">
                                    <span className="text-brown font-semibold text-sm">
                                      {creator.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <h2 className="text-lg font-semibold text-brown">{creator.name}</h2>
                                  <p className="mt-1 text-xs text-brown/70">
                                    {creator.portfolioPages.length} portfolio {creator.portfolioPages.length === 1 ? 'page' : 'pages'}
                                  </p>
                                </div>
                              </div>
                              <ChevronDownIcon isOpen={isOpen} />
                            </div>
                          </button>
                          {isOpen && (
                            <div className="p-4 border-t border-brown/10 bg-brown/5">
                              <div className="space-y-2">
                                {creator.portfolioPages.map((page) => (
                                  <a
                                    key={page.id}
                                    href={`/portfolio/${page.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-brown/10 hover:border-gold hover:shadow-md transition-all group"
                                  >
                                    <div className="flex items-center gap-2">
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="size-5 text-brown/60" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2"
                                      >
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                      </svg>
                                      <span className="font-medium text-brown group-hover:text-gold transition-colors">
                                        {page.portfolio_page_name}
                                      </span>
                                    </div>
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      className="size-4 text-brown/40 group-hover:text-gold transition-colors" 
                                      viewBox="0 0 24 24" 
                                      fill="none" 
                                      stroke="currentColor" 
                                      strokeWidth="2"
                                    >
                                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                      <polyline points="15 3 21 3 21 9"/>
                                      <line x1="10" y1="14" x2="21" y2="3"/>
                                    </svg>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!currentUserId && activeTab !== "home" ? (
              <Card className="p-8 text-center space-y-4">
                <div className="text-brown/70">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 size-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <p className="text-lg font-medium text-brown">Log in to see your {activeTab}</p>
                  <p className="mt-2 text-sm">Access assigned projects, favourites, and personalized resources once you are signed in.</p>
                </div>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href="/auth?mode=login"
                    className="inline-flex items-center gap-2 rounded-xl border border-brown/20 bg-white px-4 py-2 text-sm font-medium text-brown transition hover:bg-brown/5"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth?mode=signup"
                    className="inline-flex items-center gap-2 rounded-xl border border-brown/10 bg-gold/90 px-4 py-2 text-sm font-semibold text-brown transition hover:bg-gold"
                  >
                    Sign Up
                  </Link>
                </div>
              </Card>
            ) : null}

            {currentUserId && activeTab === "projects" && (
              <div className="space-y-4">
                <Card className="p-4 space-y-4">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Search projects..."
                      className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button variant="gold" className="absolute right-2 h-7 px-3 text-xs" onClick={() => setSearchTerm("")}>
                        Clear
                      </Button>
                    )}
                  </div>
                </Card>

                {filteredProjects.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-brown/70">No projects found</div>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredProjects.map((project) => {
                      const isOpen = openProjects.includes(project.id);
                      const models = projectModels[project.id] || [];

                      return (
                        <Card key={project.id} className="p-0 overflow-hidden">
                          <button className="w-full text-left p-4" onClick={() => toggleProject(project.id)}>
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <h2 className="text-lg font-semibold text-brown">{project.project_name}</h2>
                                <p className="mt-1 text-xs text-brown/70">
                                  Start Date: {formatDate(project.event_start_date)} • {project.model_count} models
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                {project.project_status && (
                                  <StatusBadge status={project.project_status.status} />
                                )}
                                <ChevronDownIcon isOpen={isOpen} />
                              </div>
                            </div>
                          </button>
                          {isOpen && models.length > 0 && (
                            <div className="p-4 border-t border-brown/10 bg-brown/5">
                              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {models.map((model) => {
                                  const sortedVersions = model.model_versions?.sort((a, b) => b.version - a.version) || [];
                                  const latestVer = sortedVersions[0];
                                  const versionStr = latestVer?.version?.toString() || "1.0";
                                  const thumbUrl = latestVer?.thumbnail_url || "/sangeet-stage.png";

                                  return (
                                    <ClientFunctionCard 
                                      key={model.id} 
                                      func={{
                                        id: model.id.toString(),
                                        name: model.model_name,
                                        category: model.model_categories?.model_category || "Uncategorized",
                                        version: versionStr, 
                                        imageUrl: thumbUrl  
                                      }} 
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {currentUserId && activeTab === "favourites" && (
              <div className="space-y-4">
                {groupedFavourites.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-brown/70">No favourites found</div>
                  </Card>
                ) : (
                  groupedFavourites.map((fav) => {
                    const isOpen = openFavouriteId === fav.modelId;
                    return (
                      <Card key={fav.modelId} className="p-0 overflow-hidden">
                        <button className="w-full text-left p-4" onClick={() => toggleFavourite(fav.modelId)}>
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h2 className="text-lg font-semibold text-brown">{fav.modelName}</h2>
                              <p className="mt-1 text-xs text-brown/70">{fav.versions.length} favourite versions</p>
                            </div>
                            <ChevronDownIcon isOpen={isOpen} />
                          </div>
                        </button>
                        {isOpen && (
                          <div className="p-4 border-t border-brown/10 bg-brown/5">
                            <FavouritesCarousel 
                              versions={fav.versions.map(v => ({
                                id: v.id.toString(),
                                versionNumber: v.version.toString(),
                                imageUrl: v.image_path || "/sangeet-stage.png"
                              }))} 
                            />
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
