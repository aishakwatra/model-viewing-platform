// app/P_ClientDashboard/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Tabs } from "@/app/components/Tabs";
import { ProfileIcon } from "@/app/components/ui/Icons";
import { ChevronDownIcon, PortfolioIcon, FavouriteIcon } from "@/app/components/ui/Icons";
import { ClientFunctionCard } from "@/app/components/client/ClientFunctionCard";
import { FavouritesCarousel } from "@/app/components/client/FavouritesCarousel";
import { projectsData } from "@/app/lib/data";

const favouritesData = [
  {
    id: "fav-1",
    name: "Starry Night Sangeet",
    versionCount: 4,
    versions: [
      { id: "v1", versionNumber: "2.1", imageUrl: "/sangeet-stage.png" },
      { id: "v2", versionNumber: "2.0", imageUrl: "/sangeet-stage.png" },
      { id: "v3", versionNumber: "1.5", imageUrl: "/sangeet-stage.png" },
      { id: "v4", versionNumber: "1.0", imageUrl: "/sangeet-stage.png" },
    ],
  },
  {
    id: "fav-2",
    name: "Enchanted Garden Reception",
    versionCount: 3,
    versions: [
      { id: "v5", versionNumber: "2.0", imageUrl: "/sangeet-stage.png" },
      { id: "v6", versionNumber: "1.8", imageUrl: "/sangeet-stage.png" },
      { id: "v7", versionNumber: "1.5", imageUrl: "/sangeet-stage.png" },
    ],
  },
];

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [openFavouriteId, setOpenFavouriteId] = useState<string | null>(null);

  const tabs = useMemo(
    () => [
      { key: "projects", label: "Projects", icon: <PortfolioIcon /> },
      { key: "favourites", label: "Favourites", icon: <FavouriteIcon /> },
    ],
    []
  );

  const filteredProjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return projectsData;
    return projectsData.filter((p) => p.name.toLowerCase().includes(q));
  }, [searchTerm]);

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", status === "Complete" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"].join(" ")}>
      {status}
    </span>
  );
  
  const toggleProject = (id: string) => {
    setOpenProjectId(prevId => (prevId === id ? null : id));
  };

  const toggleFavourite = (id: string) => {
    setOpenFavouriteId(prevId => (prevId === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-beige">
      <div className="border-b border-brown/10 bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-brown">Client Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-semibold text-brown">Sarah Johnson</div>
                <div className="text-xs text-brown/70">sarah.j@email.com</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-brown/10 text-sm font-semibold text-brown">SJ</div>
            </div>
            <Link
              href="/profile?from=client"
              className="inline-flex items-center gap-2 rounded-xl border border-brown/10 bg-white px-4 py-2 text-sm font-medium text-brown shadow-[0_4px_12px_rgba(92,32,25,0.08)] transition hover:bg-brown/5"
            >
              <ProfileIcon />
              Profile
            </Link>
            <div className="flex size-10 items-center justify-center rounded-full bg-brown/10 text-sm font-semibold text-brown">SJ</div>
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

        {activeTab === "projects" && (
          <div className="space-y-4">
            <Card className="p-4">
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

            <div className="grid gap-4">
              {filteredProjects.map((project) => {
                const isOpen = openProjectId === project.id;
                return (
                  <Card key={project.id} className="p-0 overflow-hidden">
                    <button className="w-full text-left p-4" onClick={() => toggleProject(project.id)}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-brown">{project.name}</h2>
                          <p className="mt-1 text-xs text-brown/70">
                            Start Date: {project.startDate} • {project.modelCount} functions • Last updated {project.lastUpdated}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={project.status} />
                          <ChevronDownIcon isOpen={isOpen} />
                        </div>
                      </div>
                    </button>
                    {isOpen && project.models.length > 0 && (
                      <div className="p-4 border-t border-brown/10 bg-brown/5">
                         {/* --- CHANGE IS HERE --- */}
                         <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                          {project.models.map(model => (
                            <ClientFunctionCard key={model.id} func={{
                              id: model.id,
                              name: model.name,
                              category: model.category,
                              version: model.version,
                              imageUrl: model.thumbnailUrl
                            }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === "favourites" && (
          <div className="space-y-4">
            {favouritesData.map((fav) => {
              const isOpen = openFavouriteId === fav.id;
              return (
                <Card key={fav.id} className="p-0 overflow-hidden">
                  <button className="w-full text-left p-4" onClick={() => toggleFavourite(fav.id)}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-brown">{fav.name}</h2>
                        <p className="mt-1 text-xs text-brown/70">{fav.versionCount} favourite versions</p>
                      </div>
                      <ChevronDownIcon isOpen={isOpen} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="p-4 border-t border-brown/10 bg-brown/5">
                      <FavouritesCarousel versions={fav.versions} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}