"use client";

import { useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState("");

  const handleCreate = () => {
    // In a real app, you would handle form validation and database submission here.
    console.log("Creating project:", { projectName, startDate });
    onClose(); // Close the modal after submission
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
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleCreate}>
            Create Project
          </Button>
        </div>
      </Card>
    </div>
  );
}
