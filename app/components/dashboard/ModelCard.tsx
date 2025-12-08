"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Model } from "@/app/lib/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { EditIcon, TrashIcon, UploadIcon, ExternalLinkIcon } from "@/app/components/ui/Icons";
import { UploadVersion } from "@/app/components/dashboard/UploadVersion";
import { EditModelModal } from "@/app/components/dashboard/EditModelModal";

interface ModelCardProps {
  model: Model;
  statusOptions?: { id: number; status: string }[]; 
  onStatusChange: (modelId: string, newStatusId: string) => void;
  categories: any[];
  onDelete: (model: Model) => void;
  onToggleDownload: (versionId: string, canDownload: boolean) => Promise<boolean>;
}

export function ModelCard({ model, statusOptions = [], onStatusChange, categories, onDelete, onToggleDownload }: ModelCardProps) {
  const [selectedVersion, setSelectedVersion] = useState(model.version || "1.0");
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false); 
  
  const [isToggling, setIsToggling] = useState(false);
  const canDownload = model.versionDownloadStatus?.[selectedVersion] ?? false;

  const currentStatusId = statusOptions?.find(s => s.status === model.status)?.id || "";

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(model.id, e.target.value);
  };

  const handleToggleClick = async () => {
    const versionId = model.versionIds?.[selectedVersion];
    if (!versionId) return;

    setIsToggling(true);
    await onToggleDownload(versionId.toString(), !canDownload);
    setIsToggling(false);
  };

  const activeThumbnail = 
    model.versionThumbnails?.[selectedVersion] || 
    model.thumbnailUrl || 
    "/sangeet-stage.png";

  // Lookup the ID for the selected version string
  const selectedVersionId = model.versionIds?.[selectedVersion] || 0;

  return (
    <>
      {/* Upload New Version Modal */}
      <UploadVersion 
        isOpen={isUploadOpen}
        onClose={() => setUploadOpen(false)}
        modelId={model.id}
        modelName={model.name}
        onVersionAdded={() => window.location.reload()}
      />

      {/* Edit Model/Version Modal */}
      <EditModelModal 
        isOpen={isEditOpen} 
        onClose={() => setEditOpen(false)} 
        model={model}
        selectedVersion={selectedVersion}
        versionId={selectedVersionId} 
        categories={categories}       // <--- Pass the prop
        onSuccess={() => window.location.reload()}
      />

      <Card className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start transition-shadow hover:shadow-md">
        
        {/* Thumbnail Image */}
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-brown/10 bg-brown/5 sm:w-64">
          <Image
            src={activeThumbnail} 
            alt={`Thumbnail of ${model.name} v${selectedVersion}`}
            fill
            className="object-cover transition-opacity duration-300" 
          />
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              v{selectedVersion}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 self-stretch">
          
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-3">
              <h3 className="truncate text-base font-semibold text-brown md:text-lg leading-tight">
                {model.name}
              </h3>
              <p className="text-sm text-brown/60 font-medium">
                {model.category}
              </p>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-brown/70">Select Version:</span>
                <select
                    id={`version-${model.id}`}
                    value={selectedVersion} 
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    className="h-9 rounded-lg border border-brown/20 bg-white px-3 text-sm font-medium text-brown outline-none transition hover:border-brown/40 focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    {(model.versions && model.versions.length > 0 ? model.versions : ["1.0"]).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col gap-3">
               {/* Status Select */}
               <div className="relative">
                 <select
                    value={currentStatusId}
                    onChange={handleStatusChange}
                    disabled={statusOptions.length === 0}
                    className="h-10 w-full cursor-pointer rounded-lg border border-brown/20 bg-white pl-3 pr-8 text-sm font-medium text-brown outline-none transition hover:border-brown/40 focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:opacity-50 lg:w-64"
                  >
                    {statusOptions.length === 0 && <option value="">Loading...</option>}
                    {statusOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.status}
                      </option>
                    ))}
                  </select>
               </div>

               {/* Download Toggle Button - Explicitly Below */}
               <button
                  onClick={handleToggleClick}
                  disabled={isToggling}
                  className={`
                    flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-medium border transition-all w-full lg:w-64
                    ${canDownload 
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                    }
                  `}
               >
                  {isToggling ? (
                      <span className="opacity-70">Updating...</span>
                  ) : (
                      <>
                        <div className={`size-2 rounded-full ${canDownload ? "bg-green-500" : "bg-gray-400"}`} />
                        {canDownload ? "Download Enabled" : "Download Disabled"}
                      </>
                  )}
               </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-brown/5 mt-1">
            <Link 
              href={`/models/${model.id}?version=${selectedVersion}`} 
              className="flex-1 sm:flex-none"
            >
              <Button variant="gold" className="w-full gap-2 px-6 h-10 shadow-sm sm:w-auto text-sm">
                 <ExternalLinkIcon />
                 View Model
              </Button>
            </Link>

            <div className="h-6 w-px bg-brown/10 hidden sm:block" />

            <Button 
              variant="outline" 
              onClick={() => setUploadOpen(true)} 
              className="gap-2 h-10 px-4 text-sm font-medium border-brown/20 hover:bg-brown/5 hover:border-brown/30 text-brown/80"
            >
              <UploadIcon /> Upload New Version
            </Button>
            
            <div className="flex items-center gap-1 ml-auto">
              <button 
                className="p-2 text-brown/40 hover:text-brown hover:bg-brown/5 rounded-lg transition-colors" 
                title="Edit Details"
                onClick={() => setEditOpen(true)} // Open Edit Modal
              >
                  <EditIcon />
              </button>
              <button 
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                title="Delete Model"
                onClick={() => onDelete(model)} 
              >
                  <TrashIcon />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}