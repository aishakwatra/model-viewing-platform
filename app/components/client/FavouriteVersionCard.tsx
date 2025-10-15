// app/components/client/FavouriteVersionCard.tsx
import Image from "next/image";
import Link from "next/link";

interface Version {
  id: string;
  versionNumber: string;
  imageUrl: string;
}

export function FavouriteVersionCard({ version }: { version: Version }) {
  return (
    <Link href="/models" className="block group">
      <div className="rounded-xl overflow-hidden bg-white border border-brown/10 group-hover:border-brown/20 transition-all shadow-sm">
        <div className="relative aspect-[4/3] w-full bg-beige">
          <Image
            src={version.imageUrl}
            alt={`Version ${version.versionNumber}`}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-3 bg-pink-50 text-center">
          <p className="font-semibold text-sm text-brown">Version {version.versionNumber}</p>
        </div>
      </div>
    </Link>
  );
}