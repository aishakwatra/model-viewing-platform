"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { ModelViewer } from "@/app/components/ModelViewer";
import { BadgeApproved } from "@/app/components/ui/Badge";
import { FavouriteIcon } from "@/app/components/ui/Icons";
import { Avatar } from "@/app/components/Avatar";

// --- TYPES ---
interface ModelDetail {
  id: number;
  model_name: string;
  project_id: number;
  created_at: string;
  projects: { project_name: string };
  model_categories: { model_category: string };
  model_status: { status: string };
}

interface ModelVersion {
  id: number;
  version: number;
  obj_file_path: string; 
  created_at: string;
}

export default function ModelViewerPage() {
  // Hooks
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams(); // To read ?version=...
  
  // Params & Query
  const modelId = params?.id;
  const versionParam = searchParams.get('version'); 

  // State
  const [model, setModel] = useState<ModelDetail | null>(null);
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<ModelVersion | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Load Data on Mount
  useEffect(() => {
    if (modelId) {
      loadModelData(Number(modelId));
    }
  }, [modelId]);

  // 2. Handle URL Version Changes (e.g. user clicks browser back button)
  useEffect(() => {
    if (versions.length > 0) {
        selectVersionBasedOnUrl();
    }
  }, [versionParam, versions]);

  // --- DATA FETCHING ---
  async function loadModelData(id: number) {
    try {
      setLoading(true);

      // A. Fetch Metadata
      const { data: modelData, error: modelError } = await supabase
        .from("models")
        .select(`
          id,
          model_name,
          project_id,
          created_at,
          projects ( project_name ),
          model_categories ( model_category ),
          model_status ( status )
        `)
        .eq("id", id)
        .single();

      if (modelError) throw modelError;
      setModel(modelData as any);

      // B. Fetch All Versions
      const { data: versionData, error: versionError } = await supabase
        .from("model_versions")
        .select("*")
        .eq("model_id", id)
        .order("version", { ascending: false }); // Latest first

      if (versionError) throw versionError;

      if (versionData && versionData.length > 0) {
        setVersions(versionData);
        // The useEffect [versionParam, versions] will handle setting the active version
      }
    } catch (err) {
      console.error("Error loading model:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- LOGIC ---

  function selectVersionBasedOnUrl() {
      // Default to latest (first in list)
      let targetVersion = versions[0];

      // If URL has specific version, try to find it
      if (versionParam) {
          const found = versions.find(v => v.version.toString() === versionParam);
          if (found) targetVersion = found;
      }

      setActiveVersion(targetVersion);
      updateModelUrl(targetVersion.obj_file_path);
  }

  function updateModelUrl(path: string) {
    if (path.startsWith("http")) {
      setModelUrl(path);
    } else {
      const { data } = supabase.storage.from("models").getPublicUrl(path);
      setModelUrl(data.publicUrl);
    }
  }

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVer = e.target.value;
    
    // Update URL to reflect choice (shallow routing prevents full reload)
    // This keeps the UI in sync with the URL
    router.push(`/models/${modelId}?version=${selectedVer}`);
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center text-brown animate-pulse">
        Loading Model...
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center gap-4">
        <div className="text-brown">Model not found.</div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="bg-beige min-h-screen pb-12">
      {/* Top Bar */}
      <div className="border-b border-brown/10 bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6 md:px-8">
          <Breadcrumbs
            items={[
              { href: "/creator/dashboard", label: "Dashboard" },
              { label: model.projects?.project_name || "Project" },
              { label: model.model_name },
            ]}
          />
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label htmlFor="version-select" className="text-sm font-medium text-brown/80">
                Version:
              </label>
              {versions.length > 0 ? (
                <select
                  id="version-select"
                  className="rounded-xl border border-brown/20 bg-white px-4 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-gold/60"
                  value={activeVersion?.version}
                  onChange={handleVersionChange}
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.version}>
                      {v.version}.0
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-brown/60">No versions</span>
              )}
            </div>
            <button className="flex items-center gap-2 text-sm text-brown/70 hover:text-brown">
              <FavouriteIcon />
              Favourite
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto mt-6 w-full max-w-7xl space-y-6 px-6 md:px-8">
        {/* 3D Viewer */}
        {modelUrl ? (
          <ModelViewer modelPath={modelUrl} />
        ) : (
          <div className="aspect-video w-full flex items-center justify-center bg-brown/5 text-brown/40 rounded-2xl border-2 border-dashed border-brown/10">
            No 3D file uploaded for this version.
          </div>
        )}

        {/* Metadata & Actions */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          
          {/* Left Column: Comments Placeholder */}
          <Card className="p-0 overflow-hidden">
             <div className="px-5 py-3 text-sm font-medium bg-brown text-white">Comments</div>
             <div className="p-10 text-center text-sm text-brown/60">
                Comments logic coming soon...
             </div>
          </Card>

          {/* Right Column: Info Panel */}
          <div className="space-y-6">
            <Card className="p-5">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-brown">{model.model_name}</h3>
                  <p className="text-sm text-brown/70">
                    {model.model_categories?.model_category || "Uncategorized"}
                  </p>
                </div>
                <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-brown/10 pt-4">
                  <dt className="text-brown/60">Version:</dt>
                  <dd className="font-medium text-brown">{activeVersion?.version}.0</dd>
                  <dt className="text-brown/60">Updated:</dt>
                  <dd className="text-brown">
                     {activeVersion ? new Date(activeVersion.created_at).toLocaleDateString() : "N/A"}
                  </dd>
                  <dt className="text-brown/60">Status:</dt>
                  <dd>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
                       {model.model_status?.status || "Active"}
                    </span>
                  </dd>
                </dl>
                <div className="pt-2">
                   <a href={modelUrl || "#"} download target="_blank">
                      <Button variant="brown" className="w-full" disabled={!modelUrl}>
                        Download 3D File
                      </Button>
                   </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}