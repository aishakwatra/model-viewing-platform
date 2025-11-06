// app/components/client/ClientFunctionCard.tsx
import { Button } from "@/app/components/ui/Button";
import Link from "next/link";
import Image from "next/image"; // 1. IMPORT NEXT/IMAGE

// Define the shape of a function's data
interface ClientFunction {
  id: string;
  name: string;
  category: string;
  version: string;
  imageUrl: string; // 2. CHANGED from 'icon' to 'imageUrl'
}

// The card component itself
export function ClientFunctionCard({ func }: { func: ClientFunction }) {
  return (
    <div className="rounded-2xl border border-pink-200 bg-white p-4">
      <div className="flex flex-col items-start gap-3">
        {/* 3. IMAGE IMPLEMENTATION */}
        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
          <Image
            src={func.imageUrl}
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
      <Link href="/models" className="mt-4 block">
        <Button variant="brown" className="w-full">
          Open Function
        </Button>
      </Link>
    </div>
  );
}