"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth"; 
import { fetchCreatorProjects, fetchModelStatuses, updateModelStatus } from "@/app/lib/creatorData";
import { Project } from "@/app/lib/types";

// Components
import { DashboardFilters } from "@/app/components/dashboard/DashboardFilter"; 
import { ProjectAccordion } from "@/app/components/dashboard/ProjectAccordion";
import { DashboardNav } from '@/app/components/dashboard/DashboardNav';
import { PortfolioView } from "@/app/components/dashboard/PortfolioView";
import { ProjectModal } from "@/app/components/dashboard/ProjectModal";
import { Card } from "@/app/components/ui/Card";

export default function CreatorDashboardPage() {
  const router = useRouter();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [modelStatuses, setModelStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard Filters & UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All Projects");
  const [openProjects, setOpenProjects] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'home' | 'portfolio'>('home');
  
  // Modal State
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null); // Null = Create Mode

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

        // Fetch Projects AND Statuses in parallel
        const [projectsData, statusesData] = await Promise.all([
           fetchCreatorProjects(currentUser.user_id),
           fetchModelStatuses()
        ]);

        setProjects(projectsData);
        setModelStatuses(statusesData);

      } catch (err) {
        console.error("Dashboard loading error:", err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router]);

  // 2. Filtering Logic
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

  // 3. Auto-Open Logic based on Tabs
  useEffect(() => {
    if (activeTab === "All Projects") { 
      setOpenProjects([]); 
    } else { 
      const projectsToOpen = projects
        .filter(p => p.models.some(m => m.category === activeTab))
        .map(p => p.id);
      setOpenProjects(projectsToOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); 

  // --- HANDLERS ---

  const toggleProject = (projectId: string) => { 
    setOpenProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleStatusChange = async (modelId: string, newStatusId: string) => { 
     // Optimistic UI Update
     const statusObj = modelStatuses.find(s => s.id.toString() === newStatusId);
     const statusLabel = statusObj ? statusObj.status : "Unknown";

     setProjects(currentProjects =>
      currentProjects.map(p => ({
        ...p, 
        models: p.models.map(m => m.id === modelId ? { ...m, status: statusLabel } : m) 
      }))
    );

    // Database Update
    await updateModelStatus(Number(modelId), Number(newStatusId));
  };

  const handleRefresh = async () => {
      const user = getCurrentUser();
      if (user) {
          setLoading(true);
          const data = await fetchCreatorProjects(user.user_id);
          setProjects(data);
          setLoading(false);
      }
  };

  // --- MODAL HANDLERS ---

  const handleCreateClick = () => {
    setProjectToEdit(null); // Clear edit state -> Create Mode
    setProjectModalOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setProjectToEdit(project); // Set project -> Edit Mode
    setProjectModalOpen(true);
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
      {/* RENDER THE PROJECT MODAL (Handles Create & Edit) */}
      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSuccess={handleRefresh} // Refresh list on success
        projectToEdit={projectToEdit} // Pass project data if editing
      />

      <div className="min-h-screen bg-beige">
        <div className="border-b border-brown/10 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl space-y-4 px-6 py-4 md:px-8">
            <h1 className="text-2xl font-semibold text-brown">Creator Dashboard</h1>
            
            <DashboardNav 
              activeView={activeView} 
              onViewChange={setActiveView}
              onCreateProjectClick={handleCreateClick} // Open Modal in Create Mode
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
                      modelStatuses={modelStatuses}
                      isOpen={openProjects.includes(project.id)}
                      onToggle={() => toggleProject(project.id)}
                      activeFilter={activeTab}
                      onStatusChange={handleStatusChange}
                      onEditProject={handleEditClick} // Pass the Edit Handler
                    />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <div className="text-brown/70 mb-2">No projects found.</div>
                    <button 
                        onClick={handleCreateClick}
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