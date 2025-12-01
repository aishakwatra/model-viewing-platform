"use client"; 

import { useState, useMemo } from 'react';
import { Project } from "@/app/lib/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { ModelCard } from './ModelCard';
import { ChevronDownIcon, EditIcon, PlusIcon } from "@/app/components/ui/Icons"; 
import { AddModel } from './AddModel';

function formatDate(dateString: string) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface ProjectAccordionProps {
  project: Project;
  modelStatuses: any[];
  isOpen: boolean;
  onToggle: () => void;
  activeFilter: string;
  onStatusChange: (modelId: string, newStatusId: string) => void;
  onEditProject: (project: Project) => void;
}

export function ProjectAccordion({ 
  project, 
  modelStatuses, 
  isOpen, 
  onToggle, 
  activeFilter, 
  onStatusChange,
  onEditProject
}: ProjectAccordionProps) {
  
  const [isAddModelOpen, setAddModelOpen] = useState(false);

  const filteredModels = useMemo(() => {
    if (activeFilter === "All Projects") {
      return project.models;
    }
    return project.models.filter((m) => m.category === activeFilter);
  }, [activeFilter, project.models]);

  if (filteredModels.length === 0 && activeFilter !== "All Projects") {
    return null;
  }

  return (
    <>
      <AddModel 
        isOpen={isAddModelOpen}
        onClose={() => setAddModelOpen(false)}
        projectName={project.name}
        projectId={project.id}
      />

      <Card className="overflow-hidden p-0 transition-shadow hover:shadow-md">
        
        {/* HEADER - Clean, clickable area */}
        <div 
          onClick={onToggle} 
          className="flex w-full cursor-pointer items-center justify-between bg-white p-5 hover:bg-brown/5 transition-colors"
        >
          {/* Left Side: Project Info */}
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-brown">
                  {project.name}
                </h2>
             </div>
             <p className="text-xs font-medium text-brown/60">
               Started: {formatDate(project.startDate)} • {project.modelCount} models
             </p>
          </div>

          {/* Right Side: Status + Toggle Icon */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-medium">
               <span className="size-1.5 rounded-full bg-orange-600" />
               {project.status}
            </span>
            <ChevronDownIcon isOpen={isOpen} />
          </div>
        </div>

        {/* BODY (Expanded Content) */}
        {isOpen && (
          <div className="border-t border-brown/10 bg-brown/5 p-5">
            
            {/* ACTION BAR: Add Model + Edit Project */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
               
               {/* 1. Add New Model Button */}
               <Button 
                 variant="outline" 
                 className="h-9 text-xs font-medium bg-white border-brown/20 hover:bg-white hover:border-brown/40 hover:text-brown shadow-sm gap-2"
                 onClick={() => setAddModelOpen(true)}
               >
                <PlusIcon /> Add New Model
              </Button>

              {/* 2. Edit Project Button (Placed Next to it) */}
              <Button 
                 variant="outline" 
                 className="h-9 text-xs font-medium bg-white border-brown/20 hover:bg-white hover:border-brown/40 hover:text-brown shadow-sm gap-2"
                 onClick={() => onEditProject(project)}
               >
                <EditIcon /> Edit Project
              </Button>

            </div>

            {/* Models Grid/List */}
            <div className="space-y-4">
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <ModelCard 
                    key={model.id} 
                    model={model} 
                    statusOptions={modelStatuses}
                    onStatusChange={onStatusChange} 
                  />
                ))
              ) : (
                <div className="text-center py-8 text-sm text-brown/40 border-2 border-dashed border-brown/10 rounded-xl">
                  No models in this project yet. Click "Add New Model" to get started.
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </>
  );
}