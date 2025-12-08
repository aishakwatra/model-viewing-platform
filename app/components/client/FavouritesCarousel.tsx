// app/components/client/FavouritesCarousel.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { FavouriteVersionCard } from './FavouriteVersionCard';
import { Button } from '@/app/components/ui/Button';

// Define the shape of a version
interface Version {
  id: string;
  versionNumber: string;
  imageUrl: string;
}

interface FavouritesCarouselProps {
  versions: Version[];
  modelId: string;
}

// Arrow SVG Icon for buttons
function ArrowIcon({ direction = 'left' }: { direction?: 'left' | 'right' }) {
  const d = direction === 'left' ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d}></path>
    </svg>
  );
}

export function FavouritesCarousel({ versions, modelId }: FavouritesCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Function to check scroll state
  const checkScrollability = () => {
    const el = containerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth);
    }
  };

  // Effect to update scroll state on mount and resize
  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [versions]);

  // Scroll handlers
  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = (containerRef.current.clientWidth / 3) * 2; // scroll by two-thirds of the container
      containerRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  // If there are 3 or fewer versions, just show a simple grid
  if (versions.length <= 3) {
    return (
       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {versions.map((version) => (
          <FavouriteVersionCard key={version.id} version={version} modelId={modelId} />
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        onScroll={checkScrollability}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-1"
      >
        {versions.map((version) => (
          <div key={version.id} className="snap-start shrink-0 w-[48%] md:w-[32%]">
             <FavouriteVersionCard version={version} modelId={modelId} />
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <Button
        variant="outline"
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full size-8 p-0 bg-white/80 backdrop-blur-sm shadow-md disabled:opacity-0 transition-opacity"
      >
        <ArrowIcon direction="left" />
      </Button>
      <Button
        variant="outline"
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full size-8 p-0 bg-white/80 backdrop-blur-sm shadow-md disabled:opacity-0 transition-opacity"
      >
        <ArrowIcon direction="right" />
      </Button>
    </div>
  );
}