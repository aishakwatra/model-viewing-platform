// app/components/dashboard/AddModel.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { fetchCategories, addModelToProject } from "@/app/lib/creatorData"; 

interface AddModelProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId: string; 
  onModelAdded?: () => void;
}

export function AddModel({ isOpen, onClose, projectName, projectId, onModelAdded }: AddModelProps) {
  const [modelName, setModelName] = useState("");
  const [category, setCategory] = useState("");
  const [objFilePath, setObjFilePath] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  
  // Image State
  const [images, setImages] = useState<File[]>([]);
  const [selectedThumbIndex, setSelectedThumbIndex] = useState<number>(0); // Default 0 forces selection
  const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
    if (isOpen) {
        fetchCategories().then(categories => {
            setCategories(categories || []);
        });
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const combined = [...images, ...filesArray].slice(0, 4);
      setImages(combined);
      // Ensure index is valid after adding
      if (selectedThumbIndex >= combined.length) setSelectedThumbIndex(0);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    // Adjust selection if the selected image was removed
    if (index === selectedThumbIndex) setSelectedThumbIndex(0);
    else if (index < selectedThumbIndex) setSelectedThumbIndex(prev => prev - 1);
  };

  const handleAddModel = async () => {
    if (!modelName || !category) {
        alert("Please fill in all required fields");
        return;
    }
    
    // Force validation: Must have at least 1 image to set a thumbnail
    if (images.length === 0) {
        alert("Please upload at least one image to serve as the thumbnail.");
        return;
    }

    setSubmitting(true);
    
    const result = await addModelToProject(
        parseInt(projectId), 
        modelName, 
        parseInt(category), 
        objFilePath,
        images,
        selectedThumbIndex // Pass the choice
    );

    if (result.success) {
        // Reset Form
        setModelName("");
        setObjFilePath("");
        setImages([]);
        setSelectedThumbIndex(0);
        if (onModelAdded) onModelAdded();
        onClose();
    } else {
        alert("Failed to add model: " + result.error);
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-brown">Add New Model</h2>
            <p className="text-sm text-brown/70">to project: {projectName}</p>
          </div>
          <button onClick={onClose} className="text-brown/50 hover:text-brown">✕</button>
        </div>
        
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown/80 mb-1">Model Name</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full rounded-lg border border-brown/20 px-4 py-2 text-sm focus:ring-2 focus:ring-gold/60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown/80 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-brown/20 px-4 py-2 text-sm focus:ring-2 focus:ring-gold/60"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.model_category}</option>
              ))}
            </select>
          </div>

           <div>
            <label className="block text-sm font-medium text-brown/80 mb-1">OBJ File Path</label>
            <input
              type="text"
              value={objFilePath}
              onChange={(e) => setObjFilePath(e.target.value)}
              placeholder="/uploads/..."
              className="w-full rounded-lg border border-brown/20 px-4 py-2 text-sm focus:ring-2 focus:ring-gold/60"
            />
          </div>

          {/* THUMBNAIL SELECTION UI */}
          <div>
            <label className="block text-sm font-medium text-brown/80 mb-2">
                Select Thumbnail <span className="text-red-500">*</span>
                <span className="block text-xs text-brown/50 font-normal">Click an image to set it as the cover for this version.</span>
            </label>
            
            <div className="flex flex-wrap gap-3 mb-2">
                {images.map((file, index) => (
                    <div 
                        key={index} 
                        onClick={() => setSelectedThumbIndex(index)}
                        className={`relative size-24 rounded-lg border-2 cursor-pointer overflow-hidden group transition-all ${
                            selectedThumbIndex === index 
                            ? "border-gold ring-2 ring-gold/30 shadow-md scale-105" 
                            : "border-brown/10 hover:border-brown/30"
                        }`}
                    >
                        <div className="w-full h-full bg-brown/5 flex items-center justify-center text-[10px] text-center p-1 break-all text-brown/60">
                             {file.name}
                        </div>
                        
                        {/* Selected Indicator */}
                        {selectedThumbIndex === index && (
                             <div className="absolute inset-0 border-[3px] border-gold rounded-lg pointer-events-none" />
                        )}
                        {selectedThumbIndex === index && (
                             <div className="absolute bottom-0 inset-x-0 bg-gold text-white text-[10px] font-bold text-center py-1">
                                 COVER
                             </div>
                        )}

                        <button 
                            onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                            className="absolute top-1 right-1 bg-red-500 text-white size-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                        >
                            ×
                        </button>
                    </div>
                ))}
                
                {images.length < 4 && (
                    <label className="size-24 flex flex-col gap-1 items-center justify-center border-2 border-dashed border-brown/20 rounded-lg cursor-pointer hover:bg-brown/5 hover:border-brown/40 transition-colors">
                        <span className="text-2xl text-brown/40">+</span>
                        <span className="text-[10px] text-brown/50 font-medium">Add Image</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="gold" onClick={handleAddModel} disabled={submitting}>
            {submitting ? "Adding..." : "Add Model"}
          </Button>
        </div>
      </Card>
    </div>
  );
}