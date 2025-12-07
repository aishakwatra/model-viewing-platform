"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { fetchPageModels } from "@/app/lib/portfolio";
import { ClientFunctionCard } from "@/app/components/client/ClientFunctionCard";

interface PageModel {
  id: string;
  name: string;
  category: string;
  thumbnailUrl: string;
  version: string;
}

export default function PortfolioPageView() {
  const params = useParams();
  const pageId = params.pageId as string;
  
  const [models, setModels] = useState<PageModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPageModels();
  }, [pageId]);

  async function loadPageModels() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPageModels(parseInt(pageId));
      setModels(data);
    } catch (err) {
      console.error("Error loading portfolio page models:", err);
      setError("Failed to load portfolio page");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          <p className="mt-4 text-brown/70">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center space-y-4">
            <div className="text-red-600 font-semibold">Error</div>
            <div className="text-brown/70">{error}</div>
            <Link href="/P_ClientDashboard">
              <Button variant="gold">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige">
      {/* Header */}
      <div className="border-b border-brown/10 bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/P_ClientDashboard"
                className="text-brown/60 hover:text-brown transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="size-6" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-brown">Portfolio Showcase</h1>
                <p className="text-xs text-brown/60">{models.length} models</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-8">
        {models.length === 0 ? (
          <Card className="p-12 text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="mx-auto size-16 text-brown/30 mb-4" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <h3 className="text-lg font-semibold text-brown mb-2">No Models Yet</h3>
            <p className="text-brown/60">This portfolio page doesn't have any models yet.</p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => (
              <ClientFunctionCard 
                key={model.id} 
                func={{
                  id: model.id,
                  name: model.name,
                  category: model.category,
                  version: model.version,
                  imageUrl: model.thumbnailUrl
                }}
                customHref={`/portfolio/${pageId}/${model.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
