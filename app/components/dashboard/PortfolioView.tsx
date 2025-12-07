"use client";

import { useState, useEffect } from "react";
import { fetchPageModels, addModelToPage, removeModelFromPage } from "@/app/lib/portfolio";
import { PortfolioModelCard } from "@/app/components/portfolio/PortfolioModelCard";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Project } from "@/app/lib/types";
import { Modal } from "@/app/components/ui/Confirm"; 
import { TrashIcon } from "@/app/components/ui/Icons";

interface PortfolioViewProps {
  pageId: number;
  allProjects: Project[];
  onDeletePage: () => void;
}

export function PortfolioView({ pageId, allProjects, onDeletePage }: PortfolioViewProps) {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMode, setAddMode] = useState(false);

  // State for Deletion Modal
  const [modelToRemove, setModelToRemove] = useState<string | null>(null);
  const [isRemoveModalOpen, setRemoveModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [isDeletePageModalOpen, setDeletePageModalOpen] = useState(false);

  // Load models for this page
  useEffect(() => {
    loadPage();
  }, [pageId]);

  async function loadPage() {
    setLoading(true);
    const data = await fetchPageModels(pageId);
    setModels(data);
    setLoading(false);
  }

  async function handleAdd(modelId: string) {
    await addModelToPage(pageId, parseInt(modelId));
    setAddMode(false);
    loadPage(); 
  }

  function handleRemoveClick(modelId: string) {
    setModelToRemove(modelId);
    setRemoveModalOpen(true);
  }

  async function confirmRemove() {
    if (!modelToRemove) return;
    
    setIsRemoving(true);
    try {
        await removeModelFromPage(pageId, parseInt(modelToRemove));
        loadPage();
    } catch (err) {
        console.error(err);
        alert("Failed to remove model");
    } finally {
        setIsRemoving(false);
        setRemoveModalOpen(false);
        setModelToRemove(null);
    }
  }

  const availableModels = allProjects.flatMap(p => p.models)
    .filter(m => m.status === "Approved" || m.status === "Released for Download")
    .filter(m => !models.some(existing => existing.id === m.id));

  if (loading) return <div className="text-center py-10 text-brown/60">Loading Page...</div>;

  return (
    <>
      {/* Confirm delete */}
      <Modal 
        isOpen={isRemoveModalOpen} 
        onClose={() => setRemoveModalOpen(false)}
        title="Remove Model"
        onConfirm={confirmRemove}
        onConfirmLabel={isRemoving ? "Removing..." : "Remove from Page"}
        onCancelLabel="Cancel"
      >
        <div className="space-y-2">
            <p className="text-brown/80">
                Are you sure you want to remove this model from the portfolio page?
            </p>
            <p className="text-xs text-brown/60">
                The model itself will not be deleted, only its reference on this page.
            </p>
        </div>
      </Modal>

      <Modal 
        isOpen={isDeletePageModalOpen} 
        onClose={() => setDeletePageModalOpen(false)}
        title="Delete Portfolio Page"
        onConfirm={() => {
            setDeletePageModalOpen(false);
            onDeletePage(); 
        }}
        onConfirmLabel="Yes, Delete Page"
        onCancelLabel="Cancel"
      >
        <div className="space-y-3">
            <div className="rounded-lg bg-red-50 p-3 border border-red-100">
                <p className="text-sm font-semibold text-red-800 mb-1">
                    ⚠️ Permanent Action
                </p>
                <p className="text-sm text-red-700">
                    Are you sure you want to delete this entire page?
                </p>
            </div>
            <p className="text-xs text-brown/60">
                This will delete the page layout. The models themselves will NOT be deleted from the database.
            </p>
        </div>
      </Modal>

      <div className="space-y-6">
        {/* 2. UPDATED HEADER SECTION WITH DELETE BUTTON */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brown">Page Content</h2>
          
          <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 h-9 text-xs gap-2"
                onClick={() => setDeletePageModalOpen(true)}
              >
                  <TrashIcon /> Delete Page
              </Button>
              
              <div className="h-6 w-px bg-brown/10 mx-1"></div>

              <Button variant="gold" onClick={() => setAddMode(!isAddMode)}>
                  {isAddMode ? "Done Adding" : "+ Add Models"}
              </Button>
          </div>
        </div>

        {isAddMode && (
           <Card className="p-4 bg-brown/5 border-brown/10 mb-6">
              <h3 className="text-sm font-bold text-brown mb-3">Select a Model to Add:</h3>
              {availableModels.length === 0 ? (
                  <p className="text-sm text-brown/60">No approved models available to add.</p>
              ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {availableModels.map(m => (
                          <div 
                             key={m.id} 
                             onClick={() => handleAdd(m.id)}
                             className="cursor-pointer bg-white p-2 rounded-lg border border-brown/10 hover:border-gold hover:ring-2 hover:ring-gold/20 transition-all text-center"
                          >
                              <div className="aspect-video relative mb-2 bg-gray-100 rounded overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={m.thumbnailUrl} alt={m.name} className="object-cover w-full h-full" />
                              </div>
                              <p className="text-xs font-medium text-brown truncate">{m.name}</p>
                          </div>
                      ))}
                  </div>
              )}
           </Card>
        )}

        {models.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-brown/10 rounded-xl">
              <p className="text-brown/60">This page is empty.</p>
              <button onClick={() => setAddMode(true)} className="text-gold hover:underline text-sm mt-2">Add your first model</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {models.map(model => (
              <div key={model.id} className="relative group">
                  <PortfolioModelCard model={model} />
                
                  <button 
                      onClick={() => handleRemoveClick(model.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white size-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-md hover:bg-red-600 hover:scale-110"
                      title="Remove from page"
                  >
                      ✕
                  </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}