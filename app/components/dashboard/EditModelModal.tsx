"use client";

import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { 
  fetchCategories, 
  updateModelAndVersion, 
  uploadModelImages
} from "@/app/lib/creatorData"; 
import { supabase } from "@/app/lib/supabase"; 
import { Model } from "@/app/lib/types";

interface EditModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: Model;
  selectedVersion: string; 
  onSuccess?: () => void;
}

type ImageItem = 
  | { type: "existing"; url: string; id: string } 
  | { type: "new"; file: File; preview: string; id: string };

export function EditModelModal({ isOpen, onClose, model, selectedVersion, onSuccess }: EditModelModalProps) {
  // Metadata State
  const [modelName, setModelName] = useState(model.name);
  const [categoryId, setCategoryId] = useState<number | "">(""); 
  const [categories, setCategories] = useState<any[]>([]);
  
  // Real ID State
  const [realVersionId, setRealVersionId] = useState<number | null>(null);
  
  // File State
  const [newModelFiles, setNewModelFiles] = useState<File[]>([]); 
  
  // Image State
  const [imageList, setImageList] = useState<ImageItem[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Initialize Metadata & Version ID
  useEffect(() => {
    if (isOpen) {
        // Fetch Categories
        fetchCategories().then(cats => {
            setCategories(cats || []);
            const currentCat = cats.find((c: any) => c.model_category === model.category);
            if (currentCat) setCategoryId(currentCat.id);
        });

        // Pre-fill Name
        setModelName(model.name);

        // Fetch Real Version ID
        const fetchVersionId = async () => {
            const versionNum = parseInt(selectedVersion);
            const { data, error } = await supabase
                .from("model_versions")
                .select("id")
                .eq("model_id", model.id)
                .eq("version", versionNum)
                .single();
            
            if (data && !error) {
                setRealVersionId(data.id);
            } else {
                console.error("Could not find version ID:", error);
                setError("Failed to load version details.");
            }
        };
        fetchVersionId();
    }
  }, [isOpen, model, selectedVersion]);

  useEffect(() => {
      if (isOpen && realVersionId) {
          const fetchImages = async () => {
              const { data, error } = await supabase
                  .from("model_images")
                  .select("id, image_path")
                  .eq("model_version_id", realVersionId);
              
              if (data) {
                  const existingItems: ImageItem[] = data.map(img => ({
                      type: "existing",
                      url: img.image_path,
                      id: img.id.toString()
                  }));
                  
                  setImageList(existingItems);

                  const currentCoverUrl = model.versionThumbnails?.[selectedVersion] || model.thumbnailUrl;
                  
                  // --- FIX IS HERE ---
                  // We check (i.type === 'existing') to confirm it has a .url property
                  const coverItem = existingItems.find(i => 
                      i.type === 'existing' && i.url === currentCoverUrl
                  );
                  
                  if (coverItem) {
                      setCoverId(coverItem.id);
                  } else if (existingItems.length > 0) {
                      setCoverId(existingItems[0].id);
                  }
              }
          };
          fetchImages();
          
          setImagesToDelete([]);
          setNewModelFiles([]);
      }
  }, [isOpen, realVersionId, model, selectedVersion]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newItems: ImageItem[] = files.map(f => ({
          type: "new",
          file: f,
          preview: URL.createObjectURL(f),
          id: "new-" + f.name + Date.now() 
      }));
      
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
      if (!modelName || !categoryId) return alert("Name and Category required");
      if (imageList.length === 0) return alert("Must have at least one image");
      if (!coverId) return alert("Please select a cover image");
      if (!realVersionId) return alert("Error: Version ID not loaded. Please close and reopen.");

      setLoading(true);
      setError(null);

      try {
          const versionNum = parseInt(selectedVersion);

          // 1. Separate New Files
          const newFiles = imageList
            .filter((i): i is ImageItem & { type: "new" } => i.type === "new")
            .map(i => i.file);
          
          let finalCoverUrl = "";
          const coverItem = imageList.find(i => i.id === coverId);
          
          if (coverItem?.type === "existing") {
              finalCoverUrl = coverItem.url;
          }

          // 2. Upload New Images
          let uploadedUrls: string[] = [];
          if (newFiles.length > 0) {
             const uploadRes = await uploadModelImages(parseInt(model.id), realVersionId, versionNum, newFiles);
             
             if (uploadRes.success && uploadRes.imageUrls) {
                 uploadedUrls = uploadRes.imageUrls;
                 
                 // If cover was one of the NEW images
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

          // Fallback
          if (!finalCoverUrl && uploadedUrls.length > 0) finalCoverUrl = uploadedUrls[0];
          if (!finalCoverUrl && imageList.length > 0 && imageList[0].type === "existing") finalCoverUrl = imageList[0].url;

          // 3. Execute Update
          const result = await updateModelAndVersion(parseInt(model.id), realVersionId, versionNum, {
             modelName,
             categoryId: Number(categoryId),
             newThumbnailUrl: finalCoverUrl,
             imagesToDelete,
             newImages: [], 
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
                            <img 
                                src={item.type === "existing" ? item.url : item.preview} 
                                alt="preview"
                                className="w-full h-full object-cover" 
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