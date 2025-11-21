"use client";

import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { fetchClients, createNewProject } from "@/app/lib/creatorData"; // Import the service
import { getCurrentUser } from "@/app/lib/auth";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: () => void; 
}

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  
  // Data State
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch clients when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingClients(true);
      fetchClients()
        .then((clients) => {
          setAvailableClients(clients || []);
        })
        .catch(console.error)
        .finally(() => setLoadingClients(false));
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    setSubmitting(true);
    const user = getCurrentUser();

    if (user) {
      // Convert selected string IDs back to numbers
      const clientIds = selectedClients.map(id => parseInt(id));
      
      const result = await createNewProject(
        user.user_id,
        projectName,
        startDate,
        clientIds
      );

      if (result.success) {
        setProjectName("");
        setStartDate("");
        setSelectedClients([]);
        if (onProjectCreated) onProjectCreated();
        onClose();
      } else {
        alert("Failed to create project: " + result.error);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-brown">Create a New Project</h2>
          <button onClick={onClose} className="text-brown/50 hover:text-brown">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-brown/80 mb-1">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Spring Wedding Collection"
              disabled={submitting}
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
            />
          </div>
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-brown/80 mb-1">Project Start Date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-gold/60"
            />
          </div>
          
          <div>
            <label htmlFor="client-select" className="block text-sm font-medium text-brown/80 mb-1">Associated Client(s)</label>
            {loadingClients ? (
                <div className="text-xs text-brown/50 p-2">Loading clients...</div>
            ) : availableClients.length > 0 ? (
                <select
                  id="client-select"
                  multiple 
                  value={selectedClients}
                  onChange={handleClientChange}
                  disabled={submitting}
                  className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-gold/60 h-32"
                >
                  {availableClients.map(client => (
                    <option key={client.user_id} value={client.user_id}>
                      {client.full_name || client.email}
                    </option>
                  ))}
                </select>
            ) : (
                <div className="text-sm text-brown/50 border border-brown/10 rounded-lg p-3 bg-brown/5">
                    No approved clients found.
                </div>
            )}
            <p className="text-xs text-brown/60 mt-1">Hold Ctrl/Cmd to select multiple.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleCreate} disabled={submitting}>
            {submitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </Card>
    </div>
  );
}



