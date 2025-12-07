"use client";

import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { 
  updateModelAndVersion, 
  uploadModelImages,
  fetchVersionImages
} from "@/app/lib/creatorData"; 
import { Model } from "@/app/lib/types";
import Image from "next/image";
import { validateFile } from "@/app/lib/validation";

interface EditModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: Model;
  selectedVersion: string;
  versionId: number; 
  categories: any[]; 
  onSuccess?: () => void;
}

type ImageItem = 
  | { type: "existing"; url: string; id: string } 
  | { type: "new"; file: File; preview: string; id: string }

export function EditModelModal({ isOpen, onClose, model, selectedVersion, versionId, categories, onSuccess }: EditModelModalProps) {
  const [modelName, setModelName] = useState(model.name);
  const [categoryId, setCategoryId] = useState<number | "">(""); 
  
  const [newModelFiles, setNewModelFiles] = useState<File[]>([]); 
  const [imageList, setImageList] = useState<ImageItem[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        // Name
        setModelName(model.name);
        
        // Category ID (Find it from the passed prop)
        const currentCat = categories.find((c: any) => c.model_category === model.category);
        if (currentCat) setCategoryId(currentCat.id);
        
        // Reset Files
        setImagesToDelete([]);
        setNewModelFiles([]);
        setError(null);
    }
  }, [isOpen, model, categories]);

  // 2. Fetch Images (The only async part left)
  useEffect(() => {
      if (isOpen && versionId) {
          const loadImages = async () => {
              // Clean helper function
              const data = await fetchVersionImages(versionId);
              
              const existingItems: ImageItem[] = data.map((img: any) => ({
                  type: "existing",
                  url: img.image_path,
                  id: img.id.toString()
              }));
              
              setImageList(existingItems);

              // Set Cover
              const currentCoverUrl = model.versionThumbnails?.[selectedVersion] || model.thumbnailUrl;
              const coverItem = existingItems.find(i => i.type === 'existing' && i.url === currentCoverUrl);
              
              if (coverItem) setCoverId(coverItem.id);
              else if (existingItems.length > 0) setCoverId(existingItems[0].id);
          };
          loadImages();
      }
  }, [isOpen, versionId, model, selectedVersion]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {

        const files = Array.from(e.target.files);
        const newItems: ImageItem[] = [];
      
        for (const f of files) {
        // Validate
        const validation = validateFile(f, {
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ["image/jpeg", "image/png", "image/webp"]
        });

        if (!validation.isValid) {
            alert(`Error with "${f.name}": ${validation.errors[0]}`);
            continue; // Skip this file, try the next
        }

        // Add if valid
        newItems.push({
            type: "new",
            file: f,
            preview: URL.createObjectURL(f),
            id: "new-" + f.name + Date.now() 
        });
      }
      
      
      const combined = [...imageList, ...newItems].slice(0, 4);
      setImageList(combined);
      
      if (!coverId && combined.length > 0) {
          setCoverId(combined[0].id);
      }
    }
  };



  const removeImage = (id: string) => {
    const itemToRemove = imageList.find(i => i.id === id);
    if (itemToRemove?.type === "existing") {
        setImagesToDelete(prev => [...prev, itemToRemove.url]);
    }
    
    const newList = imageList.filter(i => i.id !== id);
    setImageList(newList);

    if (id === coverId && newList.length > 0) {
        setCoverId(newList[0].id);
    } else if (newList.length === 0) {
        setCoverId(null);
    }
  };

  const handleSave = async () => {
      // 1. VALIDATION
      if (!modelName || !categoryId) return alert("Name and Category required");
      if (imageList.length === 0) return alert("Must have at least one image");
      if (!coverId) return alert("Please select a cover image");
      
      // Use the prop directly. If it's 0 or missing, something is wrong with the parent.
      if (!versionId) return alert("Error: Missing Version ID.");

      setLoading(true);
      setError(null);

      try {
          const versionNum = parseInt(selectedVersion);

          // 2. Separate New Files for Upload
          const newFiles = imageList
            .filter((i): i is ImageItem & { type: "new" } => i.type === "new")
            .map(i => i.file);
          
          // 3. Determine Cover URL
          let finalCoverUrl = "";
          const coverItem = imageList.find(i => i.id === coverId);
          
          // Case A: Cover is an existing image -> Use its URL directly
          if (coverItem?.type === "existing") {
              finalCoverUrl = coverItem.url;
          }

          // 4. Upload New Images (if any)
          let uploadedUrls: string[] = [];
          if (newFiles.length > 0) {
             // Use 'versionId' PROP here
             const uploadRes = await uploadModelImages(parseInt(model.id), versionId, versionNum, newFiles);
             
             if (uploadRes.success && uploadRes.imageUrls) {
                 uploadedUrls = uploadRes.imageUrls;
                 
                 // Case B: Cover is one of the NEW images -> Find matching URL by index
                 if (coverItem?.type === "new") {
                     const indexInNew = newFiles.indexOf(coverItem.file);
                     if (indexInNew !== -1) {
                         finalCoverUrl = uploadedUrls[indexInNew];
                     }
                 }
             } else {
                 throw new Error(uploadRes.error || "Failed to upload images");
             }
          }

          // Fallback: If cover calculation failed (rare), pick the first available image
          if (!finalCoverUrl) {
              if (uploadedUrls.length > 0) finalCoverUrl = uploadedUrls[0];
              else if (imageList.length > 0 && imageList[0].type === "existing") finalCoverUrl = imageList[0].url;
          }

          // 5. EXECUTE UPDATE
          const result = await updateModelAndVersion(parseInt(model.id), versionId, versionNum, {
             modelName,
             categoryId: Number(categoryId),
             newThumbnailUrl: finalCoverUrl,
             imagesToDelete,
             newImages: [], // Passed empty because we handled uploads manually above
             newModelFiles: newModelFiles.length > 0 ? newModelFiles : undefined
          });

          if (result.success) {
              if (onSuccess) onSuccess();
              onClose();
          } else {
              throw new Error(result.error || "Update failed");
          }

      } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : "Update failed");
      } finally {
          setLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold text-brown">Edit Model</h2>
            <p className="text-sm text-brown/70">Version {selectedVersion}</p>
          </div>
          <button onClick={onClose} className="text-brown/50 hover:text-brown">✕</button>
        </div>

        {error && (
            <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded">
                {error}
            </div>
        )}

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-brown/80 mb-1">Model Name</label>
                <input value={modelName} onChange={e => setModelName(e.target.value)} className="w-full rounded-lg border border-brown/20 px-4 py-2 text-sm focus:ring-2 focus:ring-gold/60" />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-brown/80 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full rounded-lg border border-brown/20 px-4 py-2 text-sm focus:ring-2 focus:ring-gold/60"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.model_category}</option>
                  ))}
                </select>
            </div>

            <div className="border-t border-brown/10 pt-4">
                <label className="block text-sm font-medium text-brown/80 mb-1">Replace 3D File (Optional)</label>
                <div className={`border-2 border-dashed rounded-xl p-3 text-center transition-colors ${newModelFiles.length > 0 ? "border-green-300 bg-green-50" : "border-brown/20"}`}>
                    {newModelFiles.length > 0 ? (
                        <div>
                            <p className="text-sm text-green-700 font-medium">{newModelFiles.length} files selected</p>
                            <button onClick={() => setNewModelFiles([])} className="text-xs text-red-500 underline mt-1">Remove</button>
                        </div>
                    ) : (
                        <label className="cursor-pointer block py-2">
                            <span className="text-xs text-brown/60 font-medium hover:underline">Click to upload new folder (.gltf)</span>
                            <input 
                                type="file" 
                                directory="" 
                                webkitdirectory="" 
                                multiple 
                                onChange={e => e.target.files && setNewModelFiles(Array.from(e.target.files))} 
                                className="hidden" 
                            />
                        </label>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-brown/80 mb-2">Edit Images</label>
                <div className="flex flex-wrap gap-3">
                    {imageList.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => setCoverId(item.id)}
                            className={`relative size-20 rounded-lg cursor-pointer overflow-hidden border-2 transition-all ${
                                coverId === item.id ? "border-gold ring-2 ring-gold/30" : "border-transparent hover:border-brown/20"
                            }`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <Image 
                                src={item.type === "existing" ? item.url : item.preview} 
                                alt="preview"
                                fill                                  
                                sizes="(max-width: 768px) 100vw, 33vw" 
                            />
                            <button 
                                onClick={(e) => { e.stopPropagation(); removeImage(item.id); }} 
                                className="absolute top-0 right-0 bg-red-500 text-white size-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                                ×
                            </button>
                            {coverId === item.id && (
                                <div className="absolute bottom-0 w-full bg-gold text-white text-[8px] font-bold text-center py-0.5">
                                    COVER
                                </div>
                            )}
                        </div>
                    ))}
                    {imageList.length < 4 && (
                        <label className="size-20 flex items-center justify-center border-2 border-dashed border-brown/20 rounded-lg cursor-pointer hover:bg-brown/5 transition-colors">
                            <span className="text-2xl text-brown/40">+</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                        </label>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="gold" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </Card>
    </div>
  );
}