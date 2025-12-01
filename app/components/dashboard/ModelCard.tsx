// app/components/dashboard/ModelCard.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Model } from "@/app/lib/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { EditIcon, TrashIcon, UploadIcon, ExternalLinkIcon } from "@/app/components/ui/Icons";

interface ModelCardProps {
  model: Model;
  statusOptions?: { id: number; status: string }[]; 
  onStatusChange: (modelId: string, newStatusId: string) => void;
}

export function ModelCard({ model, statusOptions = [], onStatusChange }: ModelCardProps) {
  const [selectedVersion, setSelectedVersion] = useState(model.version || "1.0");
  
  const currentStatusId = statusOptions?.find(s => s.status === model.status)?.id || "";

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(model.id, e.target.value);
  };

  // --- THUMBNAIL LOGIC ---
  // Since we "forced" the user to select one, we can trust this map exists.
  // Fallback to model.thumbnailUrl (latest) if exact version match fails logic check.
  const activeThumbnail = 
    model.versionThumbnails?.[selectedVersion] || 
    model.thumbnailUrl || 
    "/sangeet-stage.png"; // Just in case of legacy data before schema change

  return (
    <Card className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start transition-shadow hover:shadow-md">
      
      {/* Thumbnail Image */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-brown/10 bg-brown/5 sm:w-64">
        <img
          src={activeThumbnail} 
          alt={`Thumbnail of ${model.name} v${selectedVersion}`}
          className="object-cover transition-opacity duration-300" 
        />
        {/* Version Badge overlay */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            v{selectedVersion}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 self-stretch">
        
        {/* Header Row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-3">
            <h3 className="truncate text-base font-semibold text-brown md:text-lg leading-tight">
              {model.name}
            </h3>
            <p className="text-sm text-brown/60 font-medium">
              {model.category}
            </p>
            
             {/* Version Selector */}
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

          <div className="w-full lg:w-auto">
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
          </div>
        </div>

        {/* Footer Actions */}
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

          <Button variant="outline" className="gap-2 h-10 px-4 text-sm font-medium border-brown/20 hover:bg-brown/5 hover:border-brown/30 text-brown/80">
            <UploadIcon /> Upload New Version
          </Button>
          
          <div className="flex items-center gap-1 ml-auto">
            <button className="p-2 text-brown/40 hover:text-brown hover:bg-brown/5 rounded-lg transition-colors" title="Edit Details">
                <EditIcon />
            </button>
            <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Model">
                <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}