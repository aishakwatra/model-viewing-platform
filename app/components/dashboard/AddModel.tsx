"use client";

import { useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { filterTabs } from "@/app/lib/data";

interface AddModelProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
}

// Get the category options from the existing filter tabs, excluding "All Projects"
const categoryOptions = filterTabs.slice(1);

export function AddModel({ isOpen, onClose, projectName }: AddModelProps) {
  const [modelName, setModelName] = useState("");
  const [category, setCategory] = useState(categoryOptions[0]);
  const [objFilePath, setObjFilePath] = useState("");

  const handleAddModel = () => {
    // In a real application, this would handle form validation and data submission
    console.log("Adding model to project:", projectName, { modelName, category, objFilePath });
    onClose(); // Close the modal after submission
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-brown">Add New Model</h2>
            <p className="text-sm text-brown/70">to project: {projectName}</p>
          </div>
          <button onClick={onClose} className="text-brown/50 hover:text-brown">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="model-name" className="block text-sm font-medium text-brown/80 mb-1">Model Name</label>
            <input
              id="model-name"
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g., Main Stage Design"
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
            />
          </div>
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-brown/80 mb-1">Category</label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-gold/60"
            >
              {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="obj-file" className="block text-sm font-medium text-brown/80 mb-1">OBJ File Path (Placeholder)</label>
            <input
              id="obj-file"
              type="text"
              value={objFilePath}
              onChange={(e) => setObjFilePath(e.target.value)}
              placeholder="e.g., /uploads/main_stage.obj"
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleAddModel}>
            Add Model
          </Button>
        </div>
      </Card>
    </div>
  );
}

