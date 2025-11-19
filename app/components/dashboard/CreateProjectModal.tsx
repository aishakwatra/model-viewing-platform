"use client";

import { useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: () => void; 
}

const availableClients = [
  { id: 'client-1', name: 'Sarah Johnson', email: 'sarah.j@event.com' },
  { id: 'client-2', name: 'Rajesh Patel', email: 'rajesh.p@corp.com' },
  { id: 'client-3', name: 'Michael Chen', email: 'michael.c@main.com' },
  { id: 'client-4', name: 'Michael Chen', email: 'mike.chen@partner.com' }, 
];


export function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const handleCreate = () => {
   
    console.log("Creating project:", { 
      projectName, 
      startDate, 
      linkedClients: selectedClients 
    });

  
    if (onProjectCreated) {
      onProjectCreated();
    }

    setProjectName("");
    setStartDate("");
    setSelectedClients([]);
    onClose(); 
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
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-gold/60"
            />
          </div>
          
          <div>
            <label htmlFor="client-select" className="block text-sm font-medium text-brown/80 mb-1">Associated Client(s)</label>
            <select
              id="client-select"
              multiple 
              value={selectedClients}
              onChange={handleClientChange}
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-gold/60"
              size={4}
            >
              {availableClients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-brown/60 mt-1">Hold Ctrl (Cmd on Mac) to select multiple clients.</p>
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