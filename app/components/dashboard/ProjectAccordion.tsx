"use client"; 

import { useState, useMemo } from 'react';
import { Project } from "@/app/lib/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { ModelCard } from './ModelCard';
import { ChevronDownIcon } from "@/app/components/ui/Icons";
import { AddModel } from './AddModel';

function formatDate(dateString: string) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface ProjectAccordionProps {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
  activeFilter: string;
  onStatusChange: (modelId: string, newStatus: string) => void;
}

export function ProjectAccordion({ project, isOpen, onToggle, activeFilter, onStatusChange }: ProjectAccordionProps) {
  // THE FIX: Standardizing the state variable and setter names
  const [isAddModelOpen, setAddModelOpen] = useState(false);

  const filteredModels = useMemo(() => {
    if (activeFilter === "All Projects") {
      return project.models;
    }
    return project.models.filter((m) => m.category === activeFilter);
  }, [activeFilter, project.models]);

  const StatusBadge = ({ status }: { status: string }) => {
    const isComplete = status === "Complete";
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
        isComplete ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
      }`}>
        <span className={`size-1.5 rounded-full ${isComplete ? 'bg-green-600' : 'bg-orange-600'}`} />
        {status}
      </span>
    );
  };

  if (filteredModels.length === 0 && activeFilter !== "All Projects") {
    return null;
  }

  return (
    <>
      <AddModel 
        isOpen={isAddModelOpen}
        onClose={() => setAddModelOpen(false)}
        projectName={project.name}
      />

      <Card className="overflow-hidden p-0">
        <button onClick={onToggle} className="flex w-full items-center justify-between p-4 text-left">
          <div>
            <h2 className="font-semibold text-brown">{project.name}</h2>
            <p className="text-xs text-brown/60">
              Start Date: {formatDate(project.startDate)} • {project.modelCount} models • Last updated {project.lastUpdated}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={project.status} />
            <ChevronDownIcon isOpen={isOpen} />
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-brown/10 bg-brown/5 p-4">
            <div className="space-y-4">
               <Button 
                 variant="outline" 
                 className="w-full sm:w-auto text-xs"
                 // THE FIX: This now correctly calls the state setter function
                 onClick={() => setAddModelOpen(true)}
               >
                + Add New Model
              </Button>
              {filteredModels.map((model) => (
                <ModelCard 
                  key={model.id} 
                  model={model} 
                  onStatusChange={onStatusChange} 
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

