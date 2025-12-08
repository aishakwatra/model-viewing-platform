import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

interface ClientFunction {
  id: string;
  name: string;
  category: string;
  version: string;
  imageUrl: string;
}

// Update props to accept an optional customHref
interface ClientFunctionCardProps {
  func: ClientFunction;
  customHref?: string; 
}

export function ClientFunctionCard({ func, customHref }: ClientFunctionCardProps) {
  // Use the custom link if provided, otherwise default to the standard model viewer
  const targetLink = customHref || `/models/${func.id}?version=${func.version}`;

  return (
    <div className="rounded-2xl border border-pink-200 bg-white p-4">
      <div className="flex flex-col items-start gap-3">
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-brown/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image
            src={func.imageUrl || "/sangeet-stage.png"} 
            alt={`Thumbnail of ${func.name}`}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-brown">{func.name}</h3>
          <p className="text-xs text-brown/60">{func.category}</p>
          <p className="text-xs text-brown/60">Latest Version: v{func.version}</p>
        </div>
      </div>
      
      <Link 
        href={targetLink} 
        className="mt-4 block"
      >
        <Button variant="brown" className="w-full">
          Open Function
        </Button>
      </Link>
    </div>
  );
}