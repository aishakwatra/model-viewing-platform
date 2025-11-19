"use client"; // Ensure this is at the top

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link
import { Model } from "@/app/lib/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

const statusOptions = [
  "Under Revision",
  "Awaiting Review",
  "Approved",
  "Released for Download",
];

interface ModelCardProps {
  model: Model;
  onStatusChange: (modelId: string, newStatus: string) => void;
}

export function ModelCard({ model, onStatusChange }: ModelCardProps) {
  // 1. Track the selected version in local state
  // We default to model.version (which is currently the latest version from your data fetch)
  const [selectedVersion, setSelectedVersion] = useState(model.version);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(model.id, e.target.value);
  };

  return (
    <Card className="grid grid-cols-1 items-start gap-x-6 gap-y-4 p-4 md:grid-cols-[240px_1fr_280px]">
      
      {/* Column 1: Image */}
      <div className="w-full">
        <Image
          src={model.thumbnailUrl}
          alt={`Thumbnail of ${model.name}`}
          width={240}
          height={180}
          className="w-full h-auto rounded-lg object-cover border border-brown/15"
        />
      </div>
      
      {/* Column 2: Model Info */}
      <div className="flex flex-col h-full">
        <h3 className="font-medium text-brown">{model.name}</h3>
        <span className="text-xs bg-pink text-brown/80 rounded-full px-2 py-0.5 self-start mt-1">{model.category}</span>
        
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor={`version-${model.id}`} className="text-xs text-brown/60">Version:</label>
          {/* 2. Bind the select to our state */}
          <select
            id={`version-${model.id}`}
            value={selectedVersion} 
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="w-full max-w-[100px] rounded-md border border-brown/20 bg-white px-2 py-1 text-xs text-brown outline-none focus:ring-2 focus:ring-gold/60"
          >
            {model.versions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Column 3: Actions */}
      <div className="flex flex-col justify-between h-full items-stretch">
        <select
          value={model.status}
          onChange={handleStatusChange}
          className="w-full rounded-lg border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-gold/60"
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2 text-xs w-full mt-2">
          <Link 
            href={`/models/${model.id}?version=${selectedVersion}`} 
            className="contents"
          >
            <Button variant="outline" className="text-brown/70">Open Model</Button>
          </Link>
          
          <Button variant="outline" className="text-brown/70">Upload New Version</Button>
          <Button variant="outline" className="text-brown/70">Edit Function</Button>
          <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700">Delete Function</Button>
        </div>
      </div>
    </Card>
  );
}