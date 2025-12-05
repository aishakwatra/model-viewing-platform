"use client";

import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { addNewVersionToModel } from "@/app/lib/creatorData"; 

interface UploadVersionProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
  modelName: string;
  onVersionAdded?: () => void;
}

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

export function UploadVersion({ isOpen, onClose, modelId, modelName, onVersionAdded }: UploadVersionProps) {
  const [modelFiles, setModelFiles] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [selectedThumbIndex, setSelectedThumbIndex] = useState<number>(0); 
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setError(null);
        setModelFiles([]);
        setImages([]);
        setSelectedThumbIndex(0);
    }
  }, [isOpen]);

  const handleModelFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      setModelFiles(Array.from(e.target.files));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const combined = [...images, ...filesArray].slice(0, 4);
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

  const handleUpload = async () => {
    setError(null);

    // --- VALIDATION START ---
    if (modelFiles.length === 0) {
        setError("Please upload the model folder.");
        return;
    }

    const gltfFile = modelFiles.find(f => f.name.toLowerCase().endsWith('.gltf'));
    if (!gltfFile) {
        setError("The uploaded folder must contain a .gltf file.");
        return;
    }
    
    if (images.length === 0) {
        setError("Please upload at least one image to serve as the thumbnail.");
        return;
    }
    // --- VALIDATION END ---

    setSubmitting(true);
    
    const result = await addNewVersionToModel(
        parseInt(modelId), 
        modelFiles, 
        images,
        selectedThumbIndex
    );

    if (result.success) {
        if (onVersionAdded) onVersionAdded();
        onClose();
    } else {
        setError("Failed to upload version: " + result.error);
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
            <h2 className="text-lg font-semibold text-brown">Upload New Version</h2>
            <p className="text-sm text-brown/70">for model: <span className="font-medium">{modelName}</span></p>
          </div>
          <button onClick={onClose} className="text-brown/50 hover:text-brown">✕</button>
        </div>
        
        {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                {error}
            </div>
        )}

        <div className="space-y-6">
           {/* Model Folder Input */}
           <div>
            <label className="block text-sm font-medium text-brown/80 mb-2">
                3D Model Folder (.gltf) <span className="text-red-500">*</span>
            </label>
            
            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors 
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
                    <label className="cursor-pointer block">
                         <div className="mb-2 text-brown/40">
                             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        </div>
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
                Version Snapshots & Cover Image <span className="text-red-500">*</span>
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
          <Button variant="gold" onClick={handleUpload} disabled={submitting}>
            {submitting ? "Uploading..." : "Upload Version"}
          </Button>
        </div>
      </Card>
    </div>
  );
}