// app/components/admin/UserProjectsModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/app/components/ui/Confirm";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import {
  fetchUserProjects,
  fetchAllProjects,
  addUserToProject,
  removeUserFromProject,
  type UserProject,
  type Project,
  type ApprovedUser,
} from "@/app/lib/admin";

interface UserProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ApprovedUser | null;
}

export function UserProjectsModal({ isOpen, onClose, user }: UserProjectsModalProps) {
  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProjectToRemove, setSelectedProjectToRemove] = useState<UserProject | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [projects, allProj] = await Promise.all([
        fetchUserProjects(user.user_id),
        fetchAllProjects(),
      ]);
      setUserProjects(projects);
      setAllProjects(allProj);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToProject = async (projectId: number) => {
    if (!user) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      await addUserToProject(user.user_id, projectId);
      await loadData();
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user to project");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFromProject = async () => {
    if (!user || !selectedProjectToRemove) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      await removeUserFromProject(user.user_id, selectedProjectToRemove.project_id);
      await loadData();
      setShowRemoveConfirm(false);
      setSelectedProjectToRemove(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove user from project");
    } finally {
      setActionLoading(false);
    }
  };

  const getAvailableProjects = () => {
    if (!user) return [];
    
    const userProjectIds = new Set(userProjects.map(p => p.project_id));
    return allProjects.filter(p => {
      // Don't show projects where user is creator (can't be added as client to own project)
      if (p.creator_id === user.user_id) return false;
      // Don't show projects user is already part of
      return !userProjectIds.has(p.id);
    });
  };

  if (!user) return null;

  const roleName = user.user_roles?.role || "User";
  const initials = user.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Manage Projects - ${user.full_name || user.email}`}
        onCancelLabel="Close"
        size="large"
      >
        <div className="space-y-4">
          {/* User Info */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-brown/10 text-sm font-semibold text-brown">
                {initials}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brown">{user.full_name || "No name"}</h3>
                <p className="text-xs text-brown/70">{user.email}</p>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                  {roleName}
                </span>
              </div>
            </div>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Projects List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-brown">
                Projects ({userProjects.length})
              </h3>
              <Button
                variant="brown"
                className="text-xs px-3 py-1"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading}
              >
                + Add to Project
              </Button>
            </div>

            {loading ? (
              <Card className="p-4 text-center text-sm text-brown/70">
                Loading projects...
              </Card>
            ) : userProjects.length === 0 ? (
              <Card className="p-4 text-center text-sm text-brown/70">
                Not assigned to any projects yet.
              </Card>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {userProjects.map((project) => (
                  <Card key={project.project_id} className="p-3 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-brown">{project.project_name}</h4>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${
                        project.relationship === "creator" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {project.relationship === "creator" ? "Creator" : "Client"}
                      </span>
                    </div>
                    {project.relationship === "client" && (
                      <Button
                        variant="outline"
                        className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setSelectedProjectToRemove(project);
                          setShowRemoveConfirm(true);
                        }}
                        disabled={actionLoading}
                      >
                        Remove
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add to Project Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => !actionLoading && setShowAddModal(false)}
        title="Add User to Project"
        onCancelLabel="Cancel"
      >
        <div className="space-y-3 mt-4">
          <p className="text-sm text-brown/70">
            Select a project to add {user.full_name || user.email} as a client.
          </p>
          {getAvailableProjects().length === 0 ? (
            <Card className="p-4 text-center text-sm text-brown/70">
              No available projects to add this user to.
            </Card>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {getAvailableProjects().map((project) => (
                <Card
                  key={project.id}
                  className="p-3 hover:bg-brown/5 cursor-pointer transition-colors"
                  onClick={() => !actionLoading && handleAddToProject(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-brown">{project.project_name}</h4>
                      <p className="text-xs text-brown/60">
                        Creator: {project.creator?.full_name || project.creator?.email || "Unknown"}
                      </p>
                    </div>
                    <Button
                      variant="brown"
                      className="text-xs px-3 py-1"
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={showRemoveConfirm}
        onClose={() => !actionLoading && setShowRemoveConfirm(false)}
        onConfirm={handleRemoveFromProject}
        onConfirmLabel={actionLoading ? "Removing..." : "Remove"}
        onCancelLabel="Cancel"
        title="Remove User from Project"
      >
        <p className="text-sm text-brown/70">
          Are you sure you want to remove {user.full_name || user.email} from the project "{selectedProjectToRemove?.project_name}"?
        </p>
      </Modal>
    </>
  );
}
