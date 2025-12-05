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

import { Project } from "@/app/lib/types";
import { Modal } from "@/app/components/ui/Confirm";

// Components
import { DashboardFilters } from "@/app/components/dashboard/DashboardFilter"; 
import { ProjectAccordion } from "@/app/components/dashboard/ProjectAccordion";
import { DashboardNav } from '@/app/components/dashboard/DashboardNav';
import { PortfolioView } from "@/app/components/dashboard/PortfolioView";
import { ProjectModal } from "@/app/components/dashboard/ProjectModal";
import { Card } from "@/app/components/ui/Card";
import { Model } from "@/app/lib/types";


export default function CreatorDashboardPage() {
  const router = useRouter();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [modelStatuses, setModelStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModelDeleteModalOpen, setModelDeleteModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);
  const [isModelDeleting, setIsModelDeleting] = useState(false);

  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{ modelId: string; newStatusId: string } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Dashboard Filters & UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All Projects");
  const [openProjects, setOpenProjects] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'home' | 'portfolio'>('home');
  const [categories, setCategories] = useState<any[]>([]);

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

       // Fetch Projects, Statuses AND Categories in parallel
        const [projectsData, statusesData, catsData] = await Promise.all([
           fetchCreatorProjects(currentUser.user_id),
           fetchModelStatuses(),
           fetchCategories() 
        ]);

        setProjects(projectsData);
        setModelStatuses(statusesData);
        setCategories(catsData);

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

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    const result = await deleteProject(parseInt(projectToDelete.id));
    
    if (result.success) {
      // Remove from local state to avoid full reload
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } else {
      alert("Failed to delete project. Ensure database constraints are configured or try again.");
    }
    setIsDeleting(false);
  };

  const handleDeleteModelClick = (model: Model) => {
    setModelToDelete(model);
    setModelDeleteModalOpen(true);
  };

  const confirmModelDelete = async () => {
    if (!modelToDelete) return;

    setIsModelDeleting(true);
    const result = await deleteModel(parseInt(modelToDelete.id));

    if (result.success) {
      // Optimistically remove model from UI
      setProjects(currentProjects => 
        currentProjects.map(p => ({
          ...p,
          models: p.models.filter(m => m.id !== modelToDelete.id),
          modelCount: p.models.filter(m => m.id !== modelToDelete.id).length // Update count
        }))
      );
      setModelDeleteModalOpen(false);
      setModelToDelete(null);
    } else {
      alert("Failed to delete model: " + result.error);
    }
    setIsModelDeleting(false);
  };


  const handleStatusChangeClick = (modelId: string, newStatusId: string) => {
    setPendingStatus({ modelId, newStatusId });
    setStatusModalOpen(true);
  };

  // 2. Execute the change after confirmation
  const confirmStatusChange = async () => {
    if (!pendingStatus) return;

    setIsUpdatingStatus(true);
    const { modelId, newStatusId } = pendingStatus;

    // Optimistic UI Update (Find the status text first)
    const statusObj = modelStatuses.find(s => s.id.toString() === newStatusId);
    const statusLabel = statusObj ? statusObj.status : "Unknown";

    try {
      // Database Update
      await updateModelStatus(Number(modelId), Number(newStatusId));

      // State Update
      setProjects(currentProjects =>
        currentProjects.map(p => ({
          ...p, 
          models: p.models.map(m => m.id === modelId ? { ...m, status: statusLabel } : m) 
        }))
      );

      setStatusModalOpen(false);
      setPendingStatus(null);
    } catch (err) {
      alert("Failed to update status");
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Helper to get names for the modal text
  const getStatusChangeDetails = () => {
    if (!pendingStatus) return { modelName: "", statusName: "" };
    
    // Find Model Name
    let modelName = "Unknown Model";
    for (const p of projects) {
        const m = p.models.find(m => m.id === pendingStatus.modelId);
        if (m) { modelName = m.name; break; }
    }

    // Find Status Name
    const statusObj = modelStatuses.find(s => s.id.toString() === pendingStatus.newStatusId);
    
    return { modelName, statusName: statusObj?.status || "Unknown" };
  };

  const { modelName, statusName } = getStatusChangeDetails();

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
     
      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSuccess={handleRefresh} // Refresh list on success
        projectToEdit={projectToEdit} // Pass project data if editing
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project"
        onConfirm={confirmDelete}
        onConfirmLabel={isDeleting ? "Deleting..." : "Yes, Delete Project"}
        onCancelLabel="Cancel"
      >
        <div className="space-y-3">
            {projectToDelete && projectToDelete.modelCount > 0 ? (
                <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                    <p className="text-sm font-semibold text-red-800 mb-1">
                        ⚠️ Warning: Models Attached
                    </p>
                    <p className="text-sm text-red-700">
                        This project contains <strong>{projectToDelete.modelCount} models</strong>. 
                        Deleting this project will <strong>permanently delete</strong> all associated models, versions, and comments.
                    </p>
                </div>
            ) : (
                <p className="text-brown/80">
                    Are you sure you want to delete <strong>{projectToDelete?.name}</strong>? 
                    This action cannot be undone.
                </p>
            )}
            
            {projectToDelete?.modelCount! > 0 && (
                <p className="text-xs text-brown/60 mt-2">
                    Please confirm you understand that all data inside this project will be lost.
                </p>
            )}
        </div>
      </Modal>

      <Modal
        isOpen={isModelDeleteModalOpen}
        onClose={() => setModelDeleteModalOpen(false)}
        title="Delete Model"
        onConfirm={confirmModelDelete}
        onConfirmLabel={isModelDeleting ? "Deleting..." : "Yes, Delete Model"}
        onCancelLabel="Cancel"
      >
        <div className="space-y-3">
            <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                <p className="text-sm font-semibold text-red-800 mb-1">
                    ⚠️ Permanent Action
                </p>
                <p className="text-sm text-red-700">
                    Are you sure you want to delete <strong>{modelToDelete?.name}</strong>?
                </p>
                <p className="text-sm text-red-700 mt-2 font-medium">
                    All model versions, images, and comments will be deleted.
                </p>
            </div>
            <p className="text-xs text-brown/60">
                This action cannot be undone.
            </p>
        </div>
      </Modal>

      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Change Model Status"
        onConfirm={confirmStatusChange}
        onConfirmLabel={isUpdatingStatus ? "Updating..." : "Confirm Change"}
        onCancelLabel="Cancel"
      >
        <div className="space-y-2">
            <p className="text-brown/80">
                Are you sure you want to change the status of <strong>{modelName}</strong> to:
            </p>
            <div className="flex justify-center py-2">
                <span className="inline-flex items-center rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-brown border border-gold/20">
                    {statusName}
                </span>
            </div>
            <p className="text-xs text-brown/60 text-center">
                This may affect visibility for clients.
            </p>
        </div>
      </Modal>
      

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