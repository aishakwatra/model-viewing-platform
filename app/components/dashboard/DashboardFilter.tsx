import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
// Removed import { filterTabs } from "@/app/lib/data";

interface DashboardFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
  categories: any[]; // New prop to accept dynamic categories
}

export function DashboardFilters({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  selectedDate,
  onDateChange,
  categories,
}: DashboardFiltersProps) {
  
  // Dynamically generate tabs based on DB categories
  const tabs = ["All Projects", ...categories.map((c) => c.model_category)];

  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
        <input
          type="text"
          placeholder="Search projects by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
        />
        <div className="relative w-full md:w-64">
          <input
            type="date"
            value={selectedDate || ''}
            onChange={(e) => onDateChange(e.target.value || null)}
            className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
          />
          {selectedDate && (
            <button 
              onClick={() => onDateChange(null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/40 hover:text-brown"
              aria-label="Clear date filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </div>
      </div>
      <div className="border-t border-brown/10 pt-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "gold" : "outline"}
              onClick={() => onTabChange(tab)}
              className="rounded-full px-4 text-xs"
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}