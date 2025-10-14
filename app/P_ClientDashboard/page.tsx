"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Tabs } from "@/app/components/Tabs";

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("projects");
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy data (kept as requested)
  const projects = [
    { id: 1, name: "Project A", created: "March 15, 2024", functions: 4, lastUpdated: "2 days ago", available: true },
    { id: 2, name: "Project B", created: "April 20, 2024", functions: 3, lastUpdated: "1 week ago", available: true },
    { id: 3, name: "Project C", created: "May 10, 2024", functions: 2, lastUpdated: "3 days ago", available: true },
  ];

  const favorites = [
    {
      id: 1,
      name: "Starry Night Sangeet",
      versions: [
        { id: 1, version: "2.1", added: "2 days ago" },
        { id: 2, version: "2.0", added: "5 days ago" },
        { id: 3, version: "1.5", added: "1 week ago" },
        { id: 4, version: "1.0", added: "2 weeks ago" },
      ],
    },
    {
      id: 2,
      name: "Enchanted Garden Reception",
      versions: [
        { id: 1, version: "2.0", added: "3 days ago" },
        { id: 2, version: "1.8", added: "1 week ago" },
        { id: 3, version: "1.5", added: "2 weeks ago" },
      ],
    },
  ];

  const tabs = useMemo(
    () => [
      { key: "projects", label: "Projects" },
      { key: "favourites", label: "Favourites" },
    ],
    []
  );

  const filteredProjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, searchTerm]);

  const StatusBadge = ({ available }: { available: boolean }) => (
    <span className={["inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"].join(" ")}>
      {available ? "Available" : "Unavailable"}
    </span>
  );

  return (
    <div className="min-h-screen bg-brown/5">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        {/* Back to Menu */}
        <Link href="/" className="mb-4 inline-flex items-center gap-2 text-brown hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Back to Menu
        </Link>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brown md:text-3xl">Client Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-brown">Sarah Johnson</div>
              <div className="text-xs text-brown/70">sarah.j@email.com</div>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-brown/10 text-sm font-semibold text-brown">SJ</div>
          </div>
        </div>

        {/* Tabs */}
        <Card className="p-0">
          <div className="px-4 pt-3">
            <Tabs tabs={tabs} defaultKey={activeTab} onChange={setActiveTab} />
          </div>

          {/* Projects */}
          {activeTab === "projects" && (
            <div className="space-y-4 p-4">
              {/* Search */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="outline" className="px-3 text-xs" onClick={() => setSearchTerm("")}>
                    Clear
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-sm font-semibold text-brown">{project.name}</h2>
                        <p className="mt-1 text-xs text-brown/70">
                          Created: {project.created} • {project.functions} functions • Last updated {project.lastUpdated}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge available={project.available} />
                        <Button variant="ghost" className="p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Favourites */}
          {activeTab === "favourites" && (
            <div className="space-y-4 p-4">
              {favorites.map((favorite) => (
                <Card key={favorite.id} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-brown">{favorite.name}</h2>
                    <Button variant="ghost" className="p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </Button>
                  </div>
                  <p className="mb-3 text-xs text-brown/70">{favorite.versions.length} function versions</p>

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {favorite.versions.map((version) => (
                      <Card key={version.id} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-16 items-center justify-center rounded-xl bg-brown/10 text-xs text-brown">Image</div>
                          <div>
                            <p className="text-sm font-medium text-brown">Version {version.version}</p>
                            <p className="text-xs text-brown/70">Added {version.added}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}