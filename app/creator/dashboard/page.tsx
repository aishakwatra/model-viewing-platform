"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/app/lib/auth"; 

import { 
  fetchCreatorProjects, 
  fetchModelStatuses, 
  fetchCategories, 
  updateModelStatus, 
  deleteProject, 
  deleteModel 
} from "@/app/lib/creatorData";

// 1. IMPORT PORTFOLIO FUNCTIONS
import { fetchPortfolioPages, PortfolioPage } from "@/app/lib/portfolio";

import { Project, Model } from "@/app/lib/types";
import { Modal } from "@/app/components/ui/Confirm";

// Components
import { DashboardFilters } from "@/app/components/dashboard/DashboardFilter"; 
import { ProjectAccordion } from "@/app/components/dashboard/ProjectAccordion";
import { DashboardNav } from '@/app/components/dashboard/DashboardNav';
import { PortfolioView } from "@/app/components/dashboard/PortfolioView";
import { ProjectModal } from "@/app/components/dashboard/ProjectModal";
import { CreatePageModal } from "@/app/components/dashboard/CreatePageModal"
import { Card } from "@/app/components/ui/Card";


export default function CreatorDashboardPage() {
  const router = useRouter();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [modelStatuses, setModelStatuses] = useState<any[]>([]);
  
  // 3. NEW STATE: Portfolio Pages
  const [portfolioPages, setPortfolioPages] = useState<PortfolioPage[]>([]);
  const [isCreatePageOpen, setCreatePageOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  
  // Delete/Status Modals State (Keep existing)
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModelDeleteModalOpen, setModelDeleteModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);
  const [isModelDeleting, setIsModelDeleting] = useState(false);

  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{ modelId: string; newStatusId: string } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All Projects");
  const [openProjects, setOpenProjects] = useState<string[]>([]);
  
  const [activeView, setActiveView] = useState<string>('home');
  
  const [categories, setCategories] = useState<any[]>([]);

  // Project Modal State
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Initial Data Fetching
  useEffect(() => {
    async function initDashboard() {
      try {
        setLoading(true);
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
          router.push("/auth");
          return;
        }


        const [projectsData, statusesData, catsData, pagesData] = await Promise.all([
           fetchCreatorProjects(currentUser.user_id),
           fetchModelStatuses(),
           fetchCategories(),
           fetchPortfolioPages(currentUser.user_id) 
        ]);

        setProjects(projectsData);
        setModelStatuses(statusesData);
        setCategories(catsData);
        setPortfolioPages(pagesData); 

      } catch (err) {
        console.error("Dashboard loading error:", err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, [router]);

  const handlePageCreated = async () => {
    const user = getCurrentUser();
    if(user) {
        const pages = await fetchPortfolioPages(user.user_id);
        setPortfolioPages(pages);
    }
  };

  const filteredProjects = useMemo(() => {
    let currentProjects = projects;
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
    if (activeTab === "All Projects") { 
        setOpenProjects(projects.map(p => p.id)); 
    } else { 
      const projectsToOpen = projects
        .filter(p => p.models.some(m => m.category === activeTab))
        .map(p => p.id);
      setOpenProjects(projectsToOpen);
    }
  }, [activeTab, projects]); 

  const toggleProject = (projectId: string) => { 
    setOpenProjects(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
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

  // Modal Triggers
  const handleCreateClick = () => { setProjectToEdit(null); setProjectModalOpen(true); };
  const handleEditClick = (project: Project) => { setProjectToEdit(project); setProjectModalOpen(true); };
  const handleDeleteClick = (project: Project) => { setProjectToDelete(project); setDeleteModalOpen(true); };
  const handleDeleteModelClick = (model: Model) => { setModelToDelete(model); setModelDeleteModalOpen(true); };
  const handleStatusChangeClick = (modelId: string, newStatusId: string) => { setPendingStatus({ modelId, newStatusId }); setStatusModalOpen(true); };

  // Delete/Status Handlers
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    const result = await deleteProject(parseInt(projectToDelete.id));
    if (result.success) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } else {
      alert("Failed to delete project.");
    }
    setIsDeleting(false);
  };

  const confirmModelDelete = async () => {
    if (!modelToDelete) return;
    setIsModelDeleting(true);
    const result = await deleteModel(parseInt(modelToDelete.id));
    if (result.success) {
      setProjects(current => current.map(p => ({
          ...p,
          models: p.models.filter(m => m.id !== modelToDelete.id),
          modelCount: p.models.filter(m => m.id !== modelToDelete.id).length
      })));
      setModelDeleteModalOpen(false);
      setModelToDelete(null);
    } else {
      alert("Failed to delete model: " + result.error);
    }
    setIsModelDeleting(false);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    setIsUpdatingStatus(true);
    const { modelId, newStatusId } = pendingStatus;
    const statusObj = modelStatuses.find(s => s.id.toString() === newStatusId);
    const statusLabel = statusObj ? statusObj.status : "Unknown";
    try {
      await updateModelStatus(Number(modelId), Number(newStatusId));
      setProjects(current => current.map(p => ({
        ...p, 
        models: p.models.map(m => m.id === modelId ? { ...m, status: statusLabel } : m) 
      })));
      setStatusModalOpen(false);
      setPendingStatus(null);
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusChangeDetails = () => {
    if (!pendingStatus) return { modelName: "", statusName: "" };
    let modelName = "Unknown Model";
    for (const p of projects) {
        const m = p.models.find(m => m.id === pendingStatus.modelId);
        if (m) { modelName = m.name; break; }
    }
    const statusObj = modelStatuses.find(s => s.id.toString() === pendingStatus.newStatusId);
    return { modelName, statusName: statusObj?.status || "Unknown" };
  };
  const { modelName, statusName } = getStatusChangeDetails();

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-brown text-lg font-medium animate-pulse">Loading Creator Dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSuccess={handleRefresh}
        projectToEdit={projectToEdit}
      />

      
      <CreatePageModal 
         isOpen={isCreatePageOpen} 
         onClose={() => setCreatePageOpen(false)}
         onSuccess={handlePageCreated}
      />

      
      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Project" onConfirm={confirmDelete} onConfirmLabel={isDeleting ? "Deleting..." : "Yes, Delete Project"} onCancelLabel="Cancel">
        <div className="space-y-3">
            {projectToDelete && projectToDelete.modelCount > 0 ? (
                <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                    <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Warning: Models Attached</p>
                    <p className="text-sm text-red-700">This project contains <strong>{projectToDelete.modelCount} models</strong>. Deleting it will permanently delete all data.</p>
                </div>
            ) : (<p className="text-brown/80">Are you sure you want to delete <strong>{projectToDelete?.name}</strong>?</p>)}
        </div>
      </Modal>

      <Modal isOpen={isModelDeleteModalOpen} onClose={() => setModelDeleteModalOpen(false)} title="Delete Model" onConfirm={confirmModelDelete} onConfirmLabel={isModelDeleting ? "Deleting..." : "Yes, Delete Model"} onCancelLabel="Cancel">
        <div className="space-y-3">
            <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Permanent Action</p>
                <p className="text-sm text-red-700">Are you sure you want to delete <strong>{modelToDelete?.name}</strong>?</p>
            </div>
        </div>
      </Modal>

      <Modal isOpen={isStatusModalOpen} onClose={() => setStatusModalOpen(false)} title="Change Status" onConfirm={confirmStatusChange} onConfirmLabel={isUpdatingStatus ? "Updating..." : "Confirm"} onCancelLabel="Cancel">
        <p className="text-brown/80">Change <strong>{modelName}</strong> to <span className="font-bold">{statusName}</span>?</p>
      </Modal>

      <div className="min-h-screen bg-beige">
        <div className="border-b border-brown/10 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl space-y-4 px-6 py-4 md:px-8">
            <h1 className="text-2xl font-semibold text-brown">Creator Dashboard</h1>           
          
            <DashboardNav 
              activeView={activeView} 
              onViewChange={setActiveView}
              onCreateProjectClick={handleCreateClick}
              profileHref="/profile?from=creator"
              portfolioPages={portfolioPages}
              onNewPageClick={() => setCreatePageOpen(true)}
            />
          </div>
        </div>

        <div className="mx-auto mt-6 w-full max-w-7xl space-y-6 px-6 md:px-8">
          {/* Conditional rendring - Home or portfolio */}
          {activeView === 'home' ? (
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
                      categories={categories}
                      modelStatuses={modelStatuses}
                      isOpen={openProjects.includes(project.id)}
                      onToggle={() => toggleProject(project.id)}
                      activeFilter={activeTab}
                      onStatusChange={handleStatusChangeClick}
                      onEditProject={handleEditClick} 
                      onDeleteProject={handleDeleteClick}
                      onDeleteModel={handleDeleteModelClick}
                    />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <div className="text-brown/70 mb-2">No projects found.</div>
                    <button onClick={handleCreateClick} className="text-sm text-gold hover:underline">Create your first project</button>
                  </Card>
                )}
              </div>
            </>
          ) : (
             
             <PortfolioView 
                pageId={parseInt(activeView)} 
                allProjects={projects} 
             />
          )}
        </div>
      </div>
    </>
  );
}