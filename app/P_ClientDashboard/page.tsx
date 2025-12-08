"use client";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { ProfileIcon } from "@/app/components/ui/Icons";
import { ChevronDownIcon, PortfolioIcon, FavouriteIcon } from "@/app/components/ui/Icons";
import { ClientFunctionCard } from "@/app/components/client/ClientFunctionCard";
import { FavouritesCarousel } from "@/app/components/client/FavouritesCarousel";
import { fetchClientProjects, fetchUserFavourites, ProjectFilters } from "@/app/lib/clientData";
import { getCurrentUser } from "@/app/lib/auth";
import { fetchAllCreatorsWithPortfolios } from "@/app/lib/portfolio";
import { fetchModelCategories } from "@/app/lib/creatorData";

interface ProjectData {
  id: number;
  project_name: string;
  event_start_date: string | null;
  project_status_id: number;
  creator_id: number;
  project_status?: { status: string } | null;
  model_count: number;
  models?: ModelData[];
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
    thumbnailUrl: string;
  }>;
}

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [favourites, setFavourites] = useState<FavouriteData[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; model_category: string }>>([]);
  const [openFavouriteId, setOpenFavouriteId] = useState<number | null>(null);
  const [creators, setCreators] = useState<CreatorWithPortfolios[]>([]);
  const [openCreators, setOpenCreators] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = useMemo(
    () => [
      { key: "home", label: "Explore", icon: <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
      { key: "projects", label: "Projects", icon: <PortfolioIcon /> },
      { key: "favourites", label: "Favourites", icon: <FavouriteIcon /> },
    ],
    []
  );

  // Initialize: Check authentication and load user data (without redirect)
  useEffect(() => {
    initializeDashboard();
  }, []);

  // Reload projects when filters change
  useEffect(() => {
    if (currentUserId && activeTab === "projects") {
      loadUserData(currentUserId);
    }
  }, [searchTerm, selectedCategory]);

  async function initializeDashboard() {
    try {
      setLoading(true);
      setError(null);

      // Load model categories for filtering
      const categoriesData = await fetchModelCategories();
      setCategories(categoriesData);

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
      
      // Build filters object
      const filters: ProjectFilters = {};
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }
      if (selectedCategory) {
        filters.categoryId = selectedCategory;
      }

      const [projectsData, favouritesData] = await Promise.all([
        fetchClientProjects(userId, filters),
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

  function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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

  // Projects are already filtered by the API, no need for client-side filtering
  const displayProjects = projects;

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", status === "Complete" || status === "Completed" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"].join(" ")}>
      {status}
    </span>
  );

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
                  <div className="space-y-8">
                    {creators.map((creator) => {
                      const isOpen = openCreators.includes(creator.id);

                      return (
                        <div key={creator.id} className="space-y-4">
                          {/* Creator Header */}
                          <button 
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                            onClick={() => toggleCreator(creator.id)}
                          >
                            {creator.photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={creator.photo_url} 
                                alt={creator.name}
                                className="size-12 rounded-full object-cover border-2 border-gold/30"
                              />
                            ) : (
                              <div className="size-12 rounded-full bg-gold/20 flex items-center justify-center">
                                <span className="text-brown font-semibold text-lg">
                                  {creator.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="text-left">
                              <h2 className="text-xl font-semibold text-brown">{creator.name}</h2>
                              <p className="text-sm text-brown/70">
                                {creator.portfolioPages.length} portfolio {creator.portfolioPages.length === 1 ? 'page' : 'pages'}
                              </p>
                            </div>
                            <ChevronDownIcon isOpen={isOpen} />
                          </button>

                          {/* Portfolio Grid */}
                          {isOpen && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {creator.portfolioPages.map((page) => (
                                <a
                                  key={page.id}
                                  href={`/portfolio/${page.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group block"
                                >
                                  <Card className="overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] hover:border-gold">
                                    {/* Thumbnail */}
                                    <div className="aspect-video relative bg-brown/5 overflow-hidden">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={page.thumbnailUrl}
                                        alt={page.portfolio_page_name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                      {/* Overlay on hover */}
                                      <div className="absolute inset-0 bg-gradient-to-t from-brown/80 via-brown/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                        <div className="flex items-center gap-2 text-white text-sm font-medium">
                                          <span>View Portfolio</span>
                                          <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="size-4" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2"
                                          >
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                            <polyline points="15 3 21 3 21 9"/>
                                            <line x1="10" y1="14" x2="21" y2="3"/>
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Card Content */}
                                    <div className="p-4">
                                      <h3 className="font-semibold text-brown group-hover:text-gold transition-colors line-clamp-1">
                                        {page.portfolio_page_name}
                                      </h3>
                                      <p className="text-xs text-brown/60 mt-1">
                                        by {creator.name}
                                      </p>
                                    </div>
                                  </Card>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
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
                {/* Filters Section */}
                <Card className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search Input */}
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

                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCategory || ""}
                        onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                        className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.model_category}
                          </option>
                        ))}
                      </select>
                      {selectedCategory && (
                        <Button variant="gold" className="h-9 px-3 text-xs whitespace-nowrap" onClick={() => setSelectedCategory(null)}>
                          Clear Filter
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(searchTerm || selectedCategory) && (
                    <div className="flex items-center gap-2 text-xs text-brown/70">
                      <span className="font-medium">Active filters:</span>
                      {searchTerm && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brown/10 px-2 py-1">
                          Search: "{searchTerm}"
                        </span>
                      )}
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brown/10 px-2 py-1">
                          Category: {categories.find(c => c.id === selectedCategory)?.model_category}
                        </span>
                      )}
                    </div>
                  )}
                </Card>

                {/* Projects Grid View */}
                {displayProjects.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-brown/70">
                      {searchTerm || selectedCategory ? "No projects match your filters" : "No projects found"}
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {displayProjects.map((project) => {
                      const models = project.models || [];

                      return (
                        <div key={project.id} className="space-y-4">
                          {/* Project Header Card */}
                          <Card className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h2 className="text-xl font-semibold text-brown">{project.project_name}</h2>
                                  {project.project_status && (
                                    <StatusBadge status={project.project_status.status} />
                                  )}
                                </div>
                                <div className="mt-2 flex items-center gap-4 text-sm text-brown/70">
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                      <line x1="16" y1="2" x2="16" y2="6"/>
                                      <line x1="8" y1="2" x2="8" y2="6"/>
                                      <line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    {formatDate(project.event_start_date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                    </svg>
                                    {models.length} {models.length === 1 ? "model" : "models"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>

                          {/* Models Grid - Always Visible */}
                          {models.length > 0 && (
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                          )}
                        </div>
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
