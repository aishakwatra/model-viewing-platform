"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { ModelViewer } from "@/app/components/ModelViewer";
import { Button } from "@/app/components/ui/Button";

interface PortfolioModelDetail {
  id: number;
  model_name: string;
  category: string;
  creator_name: string;
  file_url: string | null;
}

export default function DeepPortfolioViewerPage() {
  const params = useParams();
  const router = useRouter();
  
  // We capture both IDs from the URL
  const pageId = params?.pageId as string;
  const modelId = params?.modelId as string;

  const [data, setData] = useState<PortfolioModelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (modelId) {
      loadPortfolioModel(Number(modelId));
    }
  }, [modelId]);

  async function loadPortfolioModel(id: number) {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Model, Category, and Creator (Same as before)
      const { data: modelData, error: modelError } = await supabase
        .from("models")
        .select(`
          model_name,
          model_categories ( model_category ),
          projects (
            users!projects_creator_id_fkey (
              full_name,
              email
            )
          )
        `)
        .eq("id", id)
        .single();

      if (modelError) throw modelError;

      // 2. Fetch LATEST 3D File
      const { data: versionData, error: versionError } = await supabase
        .from("model_versions")
        .select("obj_file_path")
        .eq("model_id", id)
        .order("version", { ascending: false })
        .limit(1)
        .single();

      if (versionError) {
        console.warn("No versions found for model");
      }

      // 3. Process URL
      let fileUrl = null;
      if (versionData?.obj_file_path) {
        if (versionData.obj_file_path.startsWith("http")) {
          fileUrl = versionData.obj_file_path;
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("Models")
            .getPublicUrl(versionData.obj_file_path);
          fileUrl = publicUrlData.publicUrl;
        }
      }

      // 4. Format Data
      // @ts-ignore
      const projectUser = modelData.projects?.users;
      const creatorName = projectUser?.full_name || projectUser?.email || "Unknown Creator";
      // @ts-ignore
      const category = modelData.model_categories?.model_category || "Uncategorized";

      setData({
        id,
        model_name: modelData.model_name,
        category,
        creator_name: creatorName,
        file_url: fileUrl
      });

    } catch (err) {
      console.error("Error loading portfolio model:", err);
      setError("Failed to load model.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Back Navigation
  const handleBack = () => {
    // Navigate back to the specific Portfolio Page the user came from
    router.push(`/portfolio/${pageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-brown animate-pulse">Loading Model...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center gap-4">
        <p className="text-brown/60">Model not found or unavailable.</p>
        <Button onClick={handleBack}>Return to Portfolio</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige flex flex-col items-center py-12 md:py-20">
      
      {/* "Go Back" Header (Optional but recommended for deep navigation) */}
      <div className="w-full max-w-5xl px-6 mb-6">
        <button 
            onClick={handleBack}
            className="text-brown/60 hover:text-brown text-sm flex items-center gap-2 transition-colors"
        >
            ← Back to Portfolio
        </button>
      </div>

      <div className="w-full max-w-5xl px-6 flex flex-col gap-6">
        
        {/* 3D Viewer */}
        <div className="w-full">
          {data.file_url ? (
            <ModelViewer modelPath={data.file_url} />
          ) : (
            <div className="aspect-video w-full flex items-center justify-center bg-brown/5 text-brown/40 rounded-2xl border-2 border-dashed border-brown/10">
              No 3D asset available.
            </div>
          )}
        </div>

        {/* Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-t border-brown/10 pt-4 gap-4">
          
          {/* Left: Model Details */}
          <div>
            <h1 className="text-2xl font-bold text-brown leading-tight">
              {data.model_name}
            </h1>
            <p className="text-sm font-medium text-gold mt-1">
              {data.category}
            </p>
          </div>

          {/* Right: Creator Credit */}
          <div className="text-left sm:text-right">
            <p className="text-xs text-brown/50 uppercase tracking-wider font-semibold">
              Created By
            </p>
            <p className="text-lg font-medium text-brown">
              {data.creator_name}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}