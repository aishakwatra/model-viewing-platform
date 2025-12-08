// app/components/client/ClientFunctionCard.tsx
import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

interface ClientFunction {
  id: string;
  name: string;
  category: string;
  version: string;
  imageUrl: string;
  status?: string;
}

// Update props to accept an optional customHref
interface ClientFunctionCardProps {
  func: ClientFunction;
  customHref?: string; 
}

export function ClientFunctionCard({ func, customHref }: ClientFunctionCardProps) {
  // Use the custom link if provided, otherwise default to the standard model viewer
  const targetLink = customHref || `/models/${func.id}?version=${func.version}`;

  // Helper to determine status color
  const isApproved = func.status === "Approved" || func.status === "Released for Download";
  const statusColors = isApproved 
    ? "bg-green-100 text-green-700" 
    : "bg-orange-100 text-orange-700";

  return (
    <div className="rounded-2xl border border-pink-200 bg-white p-4 h-full flex flex-col justify-between">
      <div className="flex flex-col items-start gap-3 w-full">
        {/* Thumbnail Container */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-brown/5">
          {/* Status Badge (Overlay) */}
          {func.status && (
            <div className="absolute top-2 right-2 z-10">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm ${statusColors}`}>
                {func.status}
              </span>
            </div>
          )}
          
          <Image
            src={func.imageUrl || "/sangeet-stage.png"} 
            alt={`Thumbnail of ${func.name}`}
            fill
            className="object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
        
        <div className="w-full space-y-1">
          <h3 className="font-semibold text-brown truncate" title={func.name}>
            {func.name}
          </h3>
          
          {/* Category (Bold) */}
          <p className="text-xs font-bold text-brown/60 truncate">
            {func.category}
          </p>
          
          {/* Version (Below Category) */}
          <p className="text-xs text-brown/60">
            Latest Version: v{func.version}
          </p>
        </div>
      </div>
      
      <Link 
        href={targetLink} 
        className="mt-4 block w-full"
      >
        <Button variant="brown" className="w-full">
          Open Function
        </Button>
      </Link>
    </div>
  );
}