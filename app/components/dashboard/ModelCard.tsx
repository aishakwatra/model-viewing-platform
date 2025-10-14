import Image from 'next/image';
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
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(model.id, e.target.value);
  };

  return (
    // THE FIX: Changed the grid layout for better spacing on larger screens.
    // 'md:grid-cols-[240px_1fr_280px]' allocates more specific widths.
    <Card className="grid grid-cols-1 items-start gap-x-6 gap-y-4 p-4 md:grid-cols-[240px_1fr_280px]">
      
      {/* Column 1: Larger Image */}
      {/* Increased width to 240px on medium screens and up */}
      <div className="w-full">
        <Image
          src={model.thumbnailUrl}
          alt={`Thumbnail of ${model.name}`}
          width={240} // Increased base width
          height={180} // Increased base height
          className="w-full h-auto rounded-lg object-cover border border-brown/15"
        />
      </div>
      
      {/* Column 2: Model Info */}
      <div className="flex flex-col h-full">
        <h3 className="font-medium text-brown">{model.name}</h3>
        <span className="text-xs bg-pink text-brown/80 rounded-full px-2 py-0.5 self-start mt-1">{model.category}</span>
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor={`version-${model.id}`} className="text-xs text-brown/60">Version:</label>
          <select
            id={`version-${model.id}`}
            defaultValue={model.version}
            className="w-full max-w-[100px] rounded-md border border-brown/20 bg-white px-2 py-1 text-xs text-brown outline-none focus:ring-2 focus:ring-gold/60"
          >
            {model.versions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Column 3: Actions and Status */}
      {/* A fixed width of 280px ensures the buttons don't feel squeezed */}
      <div className="flex flex-col justify-between h-full items-stretch">
        <select
          value={model.status}
          onChange={handleSelectChange}
          className="w-full rounded-lg border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-gold/60"
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2 text-xs w-full mt-2">
          <Button variant="outline" className="text-brown/70">Open Model</Button>
          <Button variant="outline" className="text-brown/70">Upload New Version</Button>
          <Button variant="outline" className="text-brown/70">Edit Function</Button>
          <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700">Delete Function</Button>
        </div>
      </div>
    </Card>
  );
}

