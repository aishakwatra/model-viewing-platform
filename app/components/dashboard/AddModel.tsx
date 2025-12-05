"use client";

import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { addModelToProject } from "@/app/lib/creatorData"; 
import { validateFile } from "@/app/lib/validation";

interface AddModelProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId: string; 
  categories: any[]; 
  onModelAdded?: () => void;
}

// Helper for TypeScript
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

export function AddModel({ isOpen, onClose, projectName, projectId, categories, onModelAdded }: AddModelProps) {
  const [modelName, setModelName] = useState("");
  const [category, setCategory] = useState("");
  // const [categories, setCategories] = useState<any[]>([]); // <--- REMOVED STATE
  
  const [modelFiles, setModelFiles] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [selectedThumbIndex, setSelectedThumbIndex] = useState<number>(0); 
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        // Internal fetch removed. We use the 'categories' prop now.
        
        // Reset state on open
        setError(null);
        setModelName("");
        setCategory("");
        setModelFiles([]);
        setImages([]);
        setSelectedThumbIndex(0);
    }
  }, [isOpen]); // Removed 'categories' dependency since it comes from props

  const handleModelFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];

      // CONSTANTS FOR MODELS
      const MAX_MODEL_SIZE = 200 * 1024 * 1024; 
      const ALLOWED_EXTS = ['.gltf', '.bin', '.png', '.jpg', '.jpeg'];

      for (const f of files) {
        // Check Size 
        const sizeValidation = validateFile(f, { 
            maxSize: MAX_MODEL_SIZE, 
            allowedTypes: [] // Empty array = skip type check in utility
        });

        if (!sizeValidation.isValid) {
            setError(`File "${f.name}" is too large. Max size is 200MB.`);
            return; 
        }

        // Manually Check Extension (More reliable for 3D files)
        const lowerName = f.name.toLowerCase();
        const hasValidExt = ALLOWED_EXTS.some(ext => lowerName.endsWith(ext));
        
        if (!hasValidExt) {
             setError(`File "${f.name}" has an invalid extension. Allowed: .gltf, .bin, textures (.png/.jpg)`);
             return;
        }

        validFiles.push(f);
      }

      setModelFiles(validFiles);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validImages: File[] = [];

      for (const f of filesArray) {
        // Strict check for images using utility defaults or custom
        const validation = validateFile(f, {
            maxSize: 10 * 1024 * 1024, // 10MB Limit for images
            allowedTypes: ["image/jpeg", "image/png", "image/webp"]
        });

        if (!validation.isValid) {
             setError(`Image "${f.name}": ${validation.errors[0]}`);
             return;
        }
        validImages.push(f);
      }

      // Append only valid images
      const combined = [...images, ...validImages].slice(0, 4);
      setImages(combined);
      if (selectedThumbIndex >= combined.length) setSelectedThumbIndex(0);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (index === selectedThumbIndex) setSelectedThumbIndex(0);
    else if (index < selectedThumbIndex) setSelectedThumbIndex(prev => prev - 1);
  };

  const handleAddModel = async () => {
    setError(null);

    // --- VALIDATION START ---
    if (!modelName.trim()) {
        setError("Please enter a Model Name.");
        return;
    }
    if (!category) {
        setError("Please select a Category.");
        return;
    }

    if (modelFiles.length === 0) {
        setError("Please upload a 3D Model folder.");
        return;
    }

    const gltfFile = modelFiles.find(f => f.name.toLowerCase().endsWith('.gltf'));
    if (!gltfFile) {
        setError("The uploaded folder must contain a .gltf file.");
        return;
    }
    
    if (images.length === 0) {
        setError("Please upload at least one image/snapshot.");
        return;
    }
    // --- VALIDATION END ---

    setSubmitting(true);
    
    const result = await addModelToProject(
        parseInt(projectId), 
        modelName, 
        parseInt(category), 
        modelFiles, 
        images,
        selectedThumbIndex
    );

    if (result.success) {
        if (onModelAdded) onModelAdded();
        onClose();
    } else {
        setError("Failed to add model: " + result.error);
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  // Derive state for folder UI
  const hasFiles = modelFiles.length > 0;
  const gltfFile = modelFiles.find(f => f.name.toLowerCase().endsWith('.gltf'));
  const isGltfFound = !!gltfFile;
  const isError = hasFiles && !isGltfFound;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-brown">Add New Model</h2>
            <p className="text-sm text-brown/70">to project: {projectName}</p>
          </div>
          <button onClick={onClose} className="text-brown/50 hover:text-brown">✕</button>
        </div>
        
        {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                {error}
            </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown/80 mb-1">Model Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full rounded-lg border border-brown/20 px-4 py-2 text-sm focus:ring-2 focus:ring-gold/60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown/80 mb-1">Category <span className="text-red-500">*</span></label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-brown/20 px-4 py-2 text-sm focus:ring-2 focus:ring-gold/60"
            >
              <option value="">Select Category</option>
              {/* Map over the PROPS categories now */}
              {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.model_category}</option>
              ))}
            </select>
          </div>

           {/* Model Folder Input */}
           <div>
            <label className="block text-sm font-medium text-brown/80 mb-1">
                3D Model Folder (.gltf) <span className="text-red-500">*</span>
            </label>
            
            <div className={`border-2 border-dashed rounded-xl p-3 text-center transition-colors 
                ${!hasFiles ? "border-brown/20 bg-brown/5" : ""} 
                ${hasFiles && isGltfFound ? "border-green-400 bg-green-50" : ""} 
                ${isError ? "border-red-400 bg-red-50" : ""}
            `}>
                {hasFiles ? (
                    <div className="text-sm text-brown">
                        {isGltfFound ? (
                           <>
                             <p className="font-semibold mb-1 text-green-700">Folder Valid</p>
                             <p className="text-xs opacity-70 mb-1">{modelFiles.length} files ready</p>
                             <p className="text-xs font-mono text-green-800 bg-green-100/50 rounded px-2 py-1 inline-block">
                                ✓ {gltfFile?.name}
                             </p>
                           </>
                        ) : (
                           <>
                             <p className="font-bold mb-1 text-red-700 text-base">NO .GLTF FILE FOUND</p>
                             <p className="text-xs text-red-600 mb-2">
                                Please upload a folder containing .gltf, .bin, and textures.
                             </p>
                             <p className="text-xs opacity-70">{modelFiles.length} files found (none are .gltf)</p>
                           </>
                        )}
                        
                        <button 
                            onClick={() => setModelFiles([])}
                            className="text-xs text-brown/60 underline mt-3 hover:text-brown block mx-auto"
                        >
                            Change Folder
                        </button>
                    </div>
                ) : (
                    <label className="cursor-pointer block py-2">
                         <span className="text-sm text-brown font-medium hover:underline">Select Folder</span>
                         <p className="text-[10px] text-brown/50 mt-1">
                            Please upload .gltf file, .bin, textures<br/>(complete model parts)
                         </p>
                         <input 
                            type="file" 
                            directory="" 
                            webkitdirectory="" 
                            multiple 
                            onChange={handleModelFolderChange} 
                            className="hidden" 
                        />
                    </label>
                )}
            </div>
          </div>

          {/* Snapshots & Cover Image Section */}
          <div>
            <label className="block text-sm font-medium text-brown/80 mb-2">
                Model Snapshots & Cover Image <span className="text-red-500">*</span>
                <span className="block text-xs text-brown/60 font-normal mt-1 leading-relaxed">
                  1. Upload up to 4 images.<br/>
                  2. <strong>Click on an image</strong> to select it as the cover thumbnail.
                </span>
            </label>
            
            <div className="flex flex-wrap gap-3 mb-2 pt-1">
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
                    <label className="size-24 flex flex-col gap-1 items-center justify-center border-2 border-dashed border-brown/20 rounded-lg cursor-pointer hover:bg-brown/5 hover:border-brown/40 transition-colors bg-white">
                        <span className="text-2xl text-brown/40">+</span>
                        <span className="text-[10px] text-brown/50 font-medium">Upload</span>
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