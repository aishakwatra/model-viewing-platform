"use client";

import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { fetchClients, createNewProject, updateProject } from "@/app/lib/creatorData";
import { getCurrentUser } from "@/app/lib/auth";
import { Project } from "@/app/lib/types"; 

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projectToEdit?: Project | null; 
}

export function ProjectModal({ isOpen, onClose, onSuccess, projectToEdit }: ProjectModalProps) {
  // Form State
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  // Data State
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset or Populate Form when Modal Opens or projectToEdit changes
  useEffect(() => {
    if (isOpen) {
      // Load Clients
      setLoadingClients(true);
      fetchClients()
        .then((clients) => setAvailableClients(clients || []))
        .catch((err) => console.error(err))
        .finally(() => setLoadingClients(false));

      if (projectToEdit) {
        // 2. EDIT MODE: Pre-fill data
        setProjectName(projectToEdit.name);
        setStartDate(projectToEdit.startDate);
        
        // 3. PRE-FILL CLIENTS
        // Convert numbers to strings because HTML select values are strings
        if (projectToEdit.clientIds) {
            setSelectedClients(projectToEdit.clientIds.map(id => id.toString()));
        } else {
            setSelectedClients([]);
        }
      } else {
        // CREATE MODE: Reset
        setProjectName("");
        setStartDate("");
        setSelectedClients([]);
      }
    }
  }, [isOpen, projectToEdit]);

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    setSubmitting(true);
    const user = getCurrentUser();

    if (user) {
      const clientIds = selectedClients.map(id => parseInt(id));
      let result;

      if (projectToEdit) {
        // UPDATE MODE
        result = await updateProject(
          parseInt(projectToEdit.id),
          projectName,
          startDate,
          clientIds
        );
      } else {
        // CREATE MODE
        result = await createNewProject(
          user.user_id,
          projectName,
          startDate,
          clientIds
        );
      }

      if (result.success) {
        if (onSuccess) onSuccess(); 
        onClose();
      } else {
        alert(`Failed to ${projectToEdit ? "update" : "create"} project.`);
      }
    }
    setSubmitting(false);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map(option => option.value);
    setSelectedClients(values);
  };

  if (!isOpen) return null;

  const isEdit = !!projectToEdit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-brown">
            {isEdit ? "Edit Project" : "Create a New Project"}
          </h2>
          <button onClick={onClose} className="text-brown/50 hover:text-brown">✕</button>
        </div>
        
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown/80 mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-lg border border-brown/20 px-4 py-2 text-sm focus:ring-2 focus:ring-gold/60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brown/80 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-brown/20 px-4 py-2 text-sm focus:ring-2 focus:ring-gold/60"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brown/80 mb-1">
              {isEdit ? "Update Clients (Overwrites existing)" : "Associated Clients"}
            </label>
            <select
              multiple
              value={selectedClients}
              onChange={handleClientChange}
              className="w-full rounded-lg border border-brown/20 px-4 py-2 text-sm focus:ring-2 focus:ring-gold/60 h-32"
            >
              {availableClients.map(client => (
                <option key={client.user_id} value={client.user_id}>
                  {client.full_name || client.email}
                </option>
              ))}
            </select>
            <p className="text-xs text-brown/60 mt-1">Hold Ctrl/Cmd to select multiple.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="gold" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : (isEdit ? "Save Changes" : "Create Project")}
          </Button>
        </div>
      </Card>
    </div>
  );
}