import Link from "next/link";
import { Button } from '@/app/components/ui/Button';
import { HomeIcon, PortfolioIcon, PlusIcon, ProfileIcon } from '@/app/components/ui/Icons';
import { PortfolioPage } from "@/app/lib/portfolio";

interface DashboardNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onCreateProjectClick: () => void;
  profileHref?: string;
  portfolioPages: PortfolioPage[];
  onNewPageClick: () => void;
}

export function DashboardNav({ 
  activeView, 
  onViewChange, 
  onCreateProjectClick, 
  profileHref = "/profile",
  portfolioPages,
  onNewPageClick
}: DashboardNavProps) {

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-brown/5 border border-brown/10 overflow-x-auto max-w-[60vw] scrollbar-hide">
        <Button 
          variant={activeView === 'home' ? 'brown' : 'ghost'} 
          onClick={() => onViewChange('home')}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <HomeIcon /> Home
        </Button>
        
        {/* DYNAMIC PAGES */}
        {portfolioPages.map(page => (
          <Button 
            key={page.id}
            variant={activeView === page.id.toString() ? 'brown' : 'ghost'} 
            onClick={() => onViewChange(page.id.toString())}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <PortfolioIcon /> {page.portfolio_page_name} 
          </Button>
        ))}

        <Button 
            variant="ghost" 
            className="flex items-center gap-2 whitespace-nowrap"
            onClick={onNewPageClick}
        >
           <PlusIcon /> New Page
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <Link
          href={profileHref}
          className="inline-flex items-center gap-2 rounded-xl border border-brown/10 bg-white px-4 py-2 text-sm font-medium text-brown shadow-[0_4px_12px_rgba(92,32,25,0.08)] transition hover:bg-brown/5"
        >
          <ProfileIcon /> Profile
        </Link>
        <Button 
          variant='gold' 
          className="flex items-center gap-2"
          onClick={onCreateProjectClick}
        >
          <PlusIcon /> Create New Project
        </Button>
      </div>
    </div>
  );
}