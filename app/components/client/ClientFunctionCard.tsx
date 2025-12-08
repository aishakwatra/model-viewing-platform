import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

interface ClientFunction {
  id: string;
  name: string;
  category: string;
  version: string;
  imageUrl: string;
  status?: string; // <--- NEW OPTIONAL FIELD
}

interface ClientFunctionCardProps {
  func: ClientFunction;
  customHref?: string; 
}

export function ClientFunctionCard({ func, customHref }: ClientFunctionCardProps) {
  const targetLink = customHref || `/models/${func.id}?version=${func.version}`;

  // Helper to determine badge color
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("approved") || s.includes("released") || s.includes("complete")) {
      return "bg-green-100 text-green-700 border-green-200";
    }
    if (s.includes("draft") || s.includes("progress") || s.includes("revision")) {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="rounded-2xl border border-pink-200 bg-white p-4 flex flex-col h-full">
      <div className="flex flex-col items-start gap-3 flex-1">
        
        {/* Image Container with Status Badge Overlay */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-brown/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            src={func.imageUrl || "/sangeet-stage.png"} 
            alt={`Thumbnail of ${func.name}`}
            fill
            className="object-cover"
          />
          
          {/* STATUS BADGE */}
          {func.status && (
            <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] font-semibold border shadow-sm ${getStatusColor(func.status)}`}>
              {func.status}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-brown line-clamp-1" title={func.name}>
            {func.name}
          </h3>
          <p className="text-xs text-brown/60">{func.category}</p>
          <p className="text-xs text-brown/60">Latest Version: v{func.version}</p>
        </div>
      </div>
      
      <Link 
        href={targetLink} 
        className="mt-4 block"
      >
        <Button variant="brown" className="w-full">
          Open Model
        </Button>
      </Link>
    </div>
  );
}