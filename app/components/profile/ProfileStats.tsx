"use client";

import { Card } from "@/app/components/ui/Card";

interface ProfileStatsProps {
  stats: {
    projects: number;
    favourites: number;
    comments: number;
  };
  loading?: boolean;
}

export function ProfileStats({ stats, loading = false }: ProfileStatsProps) {
  const statItems = [
    { label: "Projects", value: stats.projects, icon: "📁" },
    { label: "Favourites", value: stats.favourites, icon: "⭐" },
    { label: "Comments", value: stats.comments, icon: "💬" },
  ];

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-brown">Activity</h3>
      <div className="grid grid-cols-3 gap-4">
        {statItems.map((item) => (
          <div key={item.label} className="text-center">
            <div className="mb-1 text-2xl">{item.icon}</div>
            <div className="text-2xl font-bold text-brown">
              {loading ? "..." : item.value}
            </div>
            <div className="text-xs text-brown/60">{item.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
