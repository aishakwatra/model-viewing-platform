"use client";

import { Button } from '@/app/components/ui/Button';
import { HomeIcon, PortfolioIcon, PlusIcon } from '@/app/components/ui/Icons';

interface DashboardNavProps {
  activeView: string;
  onViewChange: (view: 'home' | 'portfolio') => void;
  onCreateProjectClick: () => void; // 1. ADD NEW PROP
}

export function DashboardNav({ activeView, onViewChange, onCreateProjectClick }: DashboardNavProps) {
  const portfolioPages = [
    { id: 'portfolio', name: 'Portfolio Page 1' }
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-brown/5 border border-brown/10">
        <Button 
          variant={activeView === 'home' ? 'brown' : 'ghost'} 
          onClick={() => onViewChange('home')}
          className="flex items-center gap-2"
        >
          <HomeIcon /> Home
        </Button>
        {portfolioPages.map(page => (
          <Button 
            key={page.id}
            variant={activeView === page.id ? 'brown' : 'ghost'} 
            onClick={() => onViewChange('portfolio')}
            className="flex items-center gap-2"
          >
            <PortfolioIcon /> {page.name}
          </Button>
        ))}
        <Button variant="ghost" className="flex items-center gap-2">
           <PlusIcon /> New Page
        </Button>
      </div>
      
      <Button 
        variant='gold' 
        className="flex items-center gap-2"
        onClick={onCreateProjectClick} // 2. ATTACH ONCLICK HANDLER
      >
        <PlusIcon /> Create New Project
      </Button>
    </div>
  );
}

