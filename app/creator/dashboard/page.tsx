"use client";

import { useState, useMemo, useEffect } from "react";
import { projectsData } from "@/app/lib/data";
import { Project } from "@/app/lib/types";
import { DashboardFilters } from "@/app/components/dashboard/DashboardFilter"; 
import { ProjectAccordion } from "@/app/components/dashboard/ProjectAccordion";
import { DashboardNav } from '@/app/components/dashboard/DashboardNav';
import { PortfolioView } from "@/app/components/dashboard/PortfolioView";
import { CreateProjectModal } from "@/app/components/dashboard/CreateProjectModal";

const initialProjects = JSON.parse(JSON.stringify(projectsData));

export default function CreatorDashboardPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All Projects");
  const [openProjects, setOpenProjects] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'home' | 'portfolio'>('home');
  const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    let currentProjects: Project[] = projects;
    if (searchQuery) {
      currentProjects = currentProjects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedDate) {
      currentProjects = currentProjects.filter(p => p.startDate === selectedDate);
    }
    return currentProjects;
  }, [searchQuery, projects, selectedDate]);

  useEffect(() => {
    if (activeTab === "All Projects") { setOpenProjects([]); } 
    else { 
      const projectsToOpen = projects
        .filter(p => p.models.some(m => m.category === activeTab))
        .map(p => p.id);
      setOpenProjects(projectsToOpen);
     }
  }, [activeTab]);

  const handleStatusChange = (projectId: string, modelId: string, newStatus: string) => { 
    setProjects(currentProjects =>
      currentProjects.map(p => {
        if (p.id === projectId) {
          return { ...p, models: p.models.map(m => m.id === modelId ? { ...m, status: newStatus } : m) };
        }
        return p;
      })
    );
   };
  const toggleProject = (projectId: string) => { 
    setOpenProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
   };

  return (
    <>
      {/* 3. RENDER THE MODAL */}
      <CreateProjectModal 
        isOpen={isCreateProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
      />

      <div className="min-h-screen bg-beige">
        <div className="border-b border-brown/10 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl space-y-4 px-6 py-4 md:px-8">
            <h1 className="text-2xl font-semibold text-brown">Creator Dashboard</h1>
            {/* 4. PASS THE HANDLER TO THE NAV */}
            <DashboardNav 
              activeView={activeView} 
              onViewChange={setActiveView}
              onCreateProjectClick={() => setCreateProjectModalOpen(true)}
              profileHref="/profile?from=creator"
            />
          </div>
        </div>

        <div className="mx-auto mt-6 w-full max-w-7xl space-y-6 px-6 md:px-8">
          {/* ... (Conditional view rendering is unchanged) */}
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
                {filteredProjects.map((project) => (
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
                ))}
              </div>
            </>
          )}
          {activeView === 'portfolio' && <PortfolioView />}
        </div>
      </div>
    </>
  );
  
}

