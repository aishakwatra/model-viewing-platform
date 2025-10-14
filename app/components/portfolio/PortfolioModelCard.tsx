import Image from 'next/image';
import { Model } from '../../../app/lib/types';
import { Card } from '../../../app/components/ui/Card';

interface PortfolioModelCardProps {
  model: Model;
}

export function PortfolioModelCard({ model }: PortfolioModelCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square w-full">
        <Image
          src={model.thumbnailUrl}
          alt={`Thumbnail of ${model.name}`}
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-brown">{model.name}</h3>
        <p className="text-xs text-brown/60">{model.category}</p>
      </div>
    </Card>
  );
}
