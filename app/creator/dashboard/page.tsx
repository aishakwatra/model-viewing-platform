"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth"; 
import { fetchCreatorProjects } from "@/app/lib/creatorData"; // Import the new service
import { Project } from "@/app/lib/types";

// Components
import { DashboardFilters } from "@/app/components/dashboard/DashboardFilter"; 
import { ProjectAccordion } from "@/app/components/dashboard/ProjectAccordion";
import { DashboardNav } from '@/app/components/dashboard/DashboardNav';
import { PortfolioView } from "@/app/components/dashboard/PortfolioView";
import { CreateProjectModal } from "@/app/components/dashboard/CreateProjectModal";
import { Card } from "@/app/components/ui/Card";

export default function CreatorDashboardPage() {
  const router = useRouter();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard Filters & UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All Projects");
  const [openProjects, setOpenProjects] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'home' | 'portfolio'>('home');
  const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);

  // 1. Initial Data Fetching
  useEffect(() => {
    async function initDashboard() {
      try {
        setLoading(true);
        
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
          router.push("/auth");
          return;
        }

        // Check role (Optional safety)
        // Note: user_roles is likely an array from the join, so we check safely
        const roleRaw = Array.isArray(currentUser.user_roles) 
          ? currentUser.user_roles[0]?.role 
          : currentUser.user_roles?.role;
          
        if (roleRaw?.toLowerCase() !== 'creator') {
             // You can uncomment this later to enforce role protection
             // router.push("/P_ClientDashboard");
        }

        // Fetch Data using the Service Layer
        const data = await fetchCreatorProjects(currentUser.user_id);
        setProjects(data);

      } catch (err) {
        console.error("Dashboard loading error:", err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router]);

  // 2. Filtering Logic (Applied to the fetched data)
  const filteredProjects = useMemo(() => {
    let currentProjects = projects;

    // Search Filter
    if (searchQuery) {
      currentProjects = currentProjects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date Filter
    if (selectedDate) {
      currentProjects = currentProjects.filter(p => p.startDate === selectedDate);
    }

    return currentProjects;
  }, [searchQuery, projects, selectedDate]);

  // 3. Auto-Open Logic based on Tabs (Category Filter)
  useEffect(() => {
    if (activeTab === "All Projects") { 
      setOpenProjects([]); 
    } else { 
      // Automatically open projects that contain a model of the selected category
      const projectsToOpen = projects
        .filter(p => p.models.some(m => m.category === activeTab))
        .map(p => p.id);
      setOpenProjects(projectsToOpen);
    }
  }, [activeTab, projects]);

  // Handlers
  const toggleProject = (projectId: string) => { 
    setOpenProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleStatusChange = (projectId: string, modelId: string, newStatus: string) => { 
     // Ideally call an update function in creatorData.ts here
     console.log("Updating status for", modelId, "to", newStatus);
  };

  const handleRefresh = async () => {
      // Helper to refresh list after create/update
      const user = getCurrentUser();
      if (user) {
          setLoading(true);
          const data = await fetchCreatorProjects(user.user_id);
          setProjects(data);
          setLoading(false);
      }
  };

  // 4. Render Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-brown text-lg font-medium animate-pulse">Loading Creator Dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <CreateProjectModal 
        isOpen={isCreateProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onProjectCreated={handleRefresh} 
      />

      <div className="min-h-screen bg-beige">
        <div className="border-b border-brown/10 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl space-y-4 px-6 py-4 md:px-8">
            <h1 className="text-2xl font-semibold text-brown">Creator Dashboard</h1>
            <DashboardNav 
              activeView={activeView} 
              onViewChange={setActiveView}
              onCreateProjectClick={() => setCreateProjectModalOpen(true)}
              profileHref="/profile?from=creator"
            />
          </div>
        </div>

        <div className="mx-auto mt-6 w-full max-w-7xl space-y-6 px-6 md:px-8">
          {activeView === 'home' && (
            <>
              <DashboardFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
              <div className="space-y-4">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <ProjectAccordion
                      key={project.id}
                      project={project}
                      isOpen={openProjects.includes(project.id)}
                      onToggle={() => toggleProject(project.id)}
                      activeFilter={activeTab}
                      onStatusChange={(modelId, newStatus) =>
                        handleStatusChange(project.id, modelId, newStatus)
                      }
                    />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <div className="text-brown/70 mb-2">No projects found.</div>
                    <button 
                        onClick={() => setCreateProjectModalOpen(true)}
                        className="text-sm text-gold hover:underline"
                    >
                        Create your first project
                    </button>
                  </Card>
                )}
              </div>
            </>
          )}
          {activeView === 'portfolio' && <PortfolioView />}
        </div>
      </div>
    </>
  );
}