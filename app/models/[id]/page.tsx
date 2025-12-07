"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase"; 
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { ModelViewer } from "@/app/components/ModelViewer";
import { FavouriteIcon } from "@/app/components/ui/Icons";
import { getCurrentUser } from "@/app/lib/auth";
import { Modal } from "@/app/components/ui/Confirm";

import { CommentList } from "@/app/components/model/CommentList";
import { CommentForm } from "@/app/components/model/CommentForm";
import { toggleFavourite, fetchUserFavourites } from "@/app/lib/clientData";

import { 
  fetchModelDetails, 
  fetchModelVersions, 
  fetchComments, 
  ModelDetail, 
  ModelVersion,
  Comment ,
  deleteComment      
} from "@/app/lib/modelData";

export default function ModelViewerPage() {
  // Hooks
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  // Params & Query
  const modelId = params?.id;
  const versionParam = searchParams.get('version'); 

  const [model, setModel] = useState<ModelDetail | null>(null);
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<ModelVersion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]); // <--- New Comments State
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDeleteCommentModalOpen, setDeleteCommentModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [downloadingImage, setDownloadingImage] = useState(false);

  const [isFavourited, setIsFavourited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const [isZipping, setIsZipping] = useState(false);

  // Load Data on Mount
  useEffect(() => {
    if (modelId) {
      loadData(Number(modelId));
    }
  }, [modelId]);

  // Handle URL Version Changes
  useEffect(() => {
    if (versions.length > 0) {
        selectVersionBasedOnUrl();
    }
  }, [versionParam, versions]);

  useEffect(() => {
    if (activeVersion) {
        loadVersionComments(activeVersion.id);
    }
  }, [activeVersion]);

  
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    async function checkFavouriteStatus() {
      if (!currentUser || !activeVersion) {
        setIsFavourited(false);
        return;
      }
      
      try {
        // Fetch all favourites for this user to see if this version is included
        const favourites = await fetchUserFavourites(currentUser.user_id);
        const isFav = favourites.some((f: any) => f.model_version_id === activeVersion.id);
        setIsFavourited(isFav);
      } catch (err) {
        console.error("Error checking favourites:", err);
      }
    }
    
    checkFavouriteStatus();
  }, [currentUser, activeVersion]);

  const handleToggleFav = async () => {
    if (!currentUser) return alert("Please log in to favourite models.");
    if (!activeVersion) return;
    
    const prevState = isFavourited;
    setIsFavourited(!prevState);
    setFavLoading(true);

    try {
        const result = await toggleFavourite(currentUser.user_id, activeVersion.id);
        // Ensure state matches server result (result.action is 'added' or 'removed')
        setIsFavourited(result.action === 'added');
    } catch (err) {
        // Revert on error
        setIsFavourited(prevState);
        alert("Failed to update favourite");
    } finally {
        setFavLoading(false);
    }
  };


  const getUserRole = (user: any) => {
    if (!user || !user.user_roles) return "";
    // Handle array (Supabase join) or object
    if (Array.isArray(user.user_roles) && user.user_roles.length > 0) {
        return user.user_roles[0].role;
    }
    if (typeof user.user_roles === 'object') {
        return user.user_roles.role;
    }
    return "";
  };


  const userRole = getUserRole(currentUser);
  const isCreator = userRole?.toLowerCase() === "creator";
  const dashboardHref = isCreator ? "/creator/dashboard" : "/P_ClientDashboard";

  let pageBackgroundColor = "bg-beige"; 
  
  if (isCreator) {
      pageBackgroundColor = "bg-beige"; 
  } else {
      pageBackgroundColor = "bg-white"; 
  }

  async function loadData(id: number) {
    try {
      setLoading(true);
      const [modelData, versionsData] = await Promise.all([
        fetchModelDetails(id),
        fetchModelVersions(id)
      ]);

      if (modelData) setModel(modelData);
      if (versionsData) setVersions(versionsData);
      
    } catch (err) {
      console.error("Error loading model data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadVersionComments(versionId: number) {
      setLoadingComments(true);
      const data = await fetchComments(versionId);
      setComments(data);
      setLoadingComments(false);
  }

  // --- VERSION LOGIC ---
  function selectVersionBasedOnUrl() {
      // Default to latest
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
      const { data } = supabase.storage.from("Models").getPublicUrl(path);
      setModelUrl(data.publicUrl);
    }
  }

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVer = e.target.value;
    router.push(`/models/${modelId}?version=${selectedVer}`);
  };

  // --- IMAGE & CAROUSEL LOGIC ---
  
  const handleDownloadImage = async (imageUrl: string) => {
    try {
      setDownloadingImage(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = imageUrl.split('/').pop() || 'reference-image.png';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      window.open(imageUrl, '_blank');
    } finally {
      setDownloadingImage(false);
    }
  };

  const handleNavigateImage = useCallback((direction: 'next' | 'prev') => {
    if (!activeVersion?.model_images || !selectedImage) return;
    
    const images = activeVersion.model_images;
    const currentIndex = images.findIndex(img => img.image_path === selectedImage);
    
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % images.length;
    } else {
      newIndex = (currentIndex - 1 + images.length) % images.length;
    }

    setSelectedImage(images[newIndex].image_path);
  }, [activeVersion, selectedImage]);

  // Keyboard Navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedImage) return;
      
      if (e.key === 'ArrowRight') handleNavigateImage('next');
      if (e.key === 'ArrowLeft') handleNavigateImage('prev');
      if (e.key === 'Escape') setSelectedImage(null);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, handleNavigateImage]);


  const handleDeleteClick = (commentId: number) => {
    setCommentToDelete(commentId);
    setDeleteCommentModalOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    setIsDeletingComment(true);
    try {
        const result = await deleteComment(commentToDelete);
        if (result.success) {
            // Refresh comments list
            if (activeVersion) {
                loadVersionComments(activeVersion.id);
            }
            setDeleteCommentModalOpen(false);
            setCommentToDelete(null);
        } else {
            alert("Failed to delete comment");
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsDeletingComment(false);
    }
  };

  const handleDownloadZip = () => {
    // 1. Basic Checks
    if (!modelUrl || !activeVersion || !model) return;
    
    // Prevent multiple clicks if already processing
    if (isZipping) return;

    // Set Loading State
    setIsZipping(true);
    
    // Construct API URL
    const apiUrl = `/api/download-zip?url=${encodeURIComponent(modelUrl)}&name=${encodeURIComponent(model.model_name + '-v' + activeVersion.version)}`;
    
    // Trigger Browser Download
    const link = document.createElement('a');
    link.href = apiUrl;
    link.setAttribute('download', `${model.model_name}-v${activeVersion.version}.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset state after a delay 
    //prevents double-clicking while the browser prepares the stream.
    setTimeout(() => {
        setIsZipping(false);
    }, 3000);
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className={`min-h-screen ${pageBackgroundColor} flex items-center justify-center text-brown animate-pulse`}>
        Loading Model...
      </div>
    );
  }

  if (!model) {
    return (
      <div className={`min-h-screen ${pageBackgroundColor} flex flex-col items-center justify-center gap-4`}>
        <div className="text-brown">Model not found.</div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <>

    <Modal 
        isOpen={isDeleteCommentModalOpen} 
        onClose={() => setDeleteCommentModalOpen(false)}
        title="Delete Comment"
        onConfirm={confirmDeleteComment}
        onConfirmLabel={isDeletingComment ? "Deleting..." : "Delete"}
        onCancelLabel="Cancel"
      >
        <div className="space-y-2">
            <p className="text-brown/80">
                Are you sure you want to delete this comment?
            </p>
            <p className="text-xs text-brown/60">
                This action cannot be undone.
            </p>
        </div>
      </Modal>

      {/* IMAGE EXPANSION MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative w-full max-w-6xl flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()} 
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Navigation Buttons (Left) */}
            <button
               onClick={() => handleNavigateImage('prev')}
               className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>

            {/* Main Image Container */}
            <div className="relative w-full h-[75vh] flex items-center justify-center">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={selectedImage} 
                 alt="Expanded View" 
                 className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
               />
            </div>

             {/* Navigation Buttons (Right) */}
             <button
               onClick={() => handleNavigateImage('next')}
               className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            {/* Footer: Count & Download */}
            <div className="flex items-center justify-between w-full max-w-2xl px-4">
              <span className="text-white/60 text-sm">
                 {/* Image Counter */}
                 {(activeVersion?.model_images.findIndex(img => img.image_path === selectedImage) ?? 0) + 1} 
                 {' / '} 
                 {activeVersion?.model_images.length}
              </span>
              
              <Button 
                variant="gold" 
                onClick={() => handleDownloadImage(selectedImage)}
                disabled={downloadingImage}
                className="shadow-lg min-w-[140px]"
              >
                {downloadingImage ? "Downloading..." : "Download Image"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN PAGE CONTENT */}
      <div className={`${pageBackgroundColor} min-h-screen pb-12 transition-colors duration-300`}>
        {/* Top Bar */}
        <div className="border-b border-brown/10 bg-white shadow-sm sticky top-0 z-10">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6 md:px-8">
            <Breadcrumbs
              items={[
                { href: dashboardHref, label: "Dashboard" },
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
              {!isCreator && (
                <button 
                  onClick={handleToggleFav}
                  disabled={favLoading}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    isFavourited 
                        ? "text-gold hover:text-gold/80" 
                        : "text-brown/40 hover:text-brown"
                  }`}
                  title={isFavourited ? "Remove from favourites" : "Add to favourites"}
                >
                  <FavouriteIcon filled={isFavourited} />
                  {isFavourited ? "Favourited" : "Favourite"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mx-auto mt-6 w-full max-w-7xl space-y-6 px-6 md:px-8">
          
          {/* 3D Viewer Component */}
          {modelUrl ? (
            <ModelViewer modelPath={modelUrl} />
          ) : (
            <div className="aspect-video w-full flex items-center justify-center bg-brown/5 text-brown/40 rounded-2xl border-2 border-dashed border-brown/10">
              No 3D file uploaded.
            </div>
          )}

          {/* Grid Layout for Metadata & Comments */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            
           <Card className="p-0 overflow-hidden h-fit flex flex-col">
               <div className="px-5 py-3 text-sm font-medium bg-brown text-white flex justify-between items-center">
                  <span>Comments</span>
                  <span className="text-xs text-white/60 font-normal">{comments.length} total</span>
               </div>
               
               {/* Comment List */}
               <CommentList 
                  comments={comments} 
                  loading={loadingComments}
                  currentUserId={currentUser?.user_id || null} // Pass User ID
                  onDelete={handleDeleteClick} // Pass Handler
               />
               
               {/* Comment Form */}
               {activeVersion && (
                 <CommentForm 
                    versionId={activeVersion.id} 
                    onPosted={() => loadVersionComments(activeVersion.id)} 
                 />
               )}
            </Card>

            {/* Right Column: Info Panel */}
            <div className="space-y-6">
              <Card className="p-5">
                <div className="space-y-4">
                  
                  {/* Model Header */}
                  <div>
                    <h3 className="text-lg font-semibold text-brown">{model.model_name}</h3>
                    <p className="text-sm text-brown/70">
                      {model.model_categories?.model_category || "Uncategorized"}
                    </p>
                  </div>

                  {/* Metadata Grid */}
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
                  
                  {/* Reference Images Grid */}
                  {activeVersion?.model_images && activeVersion.model_images.length > 0 && (
                    <div className="pt-4 border-t border-brown/10">
                      <h4 className="text-sm font-medium text-brown mb-3">Reference Images</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {activeVersion.model_images.map((img) => (
                          <div 
                            key={img.id} 
                            className="relative aspect-square rounded-lg overflow-hidden border border-brown/10 bg-brown/5 cursor-pointer hover:opacity-90 transition-all hover:ring-2 hover:ring-gold/50"
                            onClick={() => setSelectedImage(img.image_path)} 
                          >
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img 
                               src={img.image_path} 
                               alt={`Reference for version ${activeVersion.version}`} 
                               className="w-full h-full object-cover"
                             />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3D File Download */}
                  <div className="pt-2">
                     {activeVersion?.can_download ? (
                        <Button 
                          variant="brown" 
                          className="w-full transition-all duration-200" 
                          // Disable button while "zipping" 
                          disabled={!modelUrl || isZipping}
                          onClick={handleDownloadZip}
                        >
                          
                          {isZipping ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Starting Download...
                            </span>
                          ) : (
                            "Download 3D Files (ZIP)"
                          )}
                        </Button>
                     ) : (
                       <Button 
                         variant="outline" 
                         className="w-full cursor-not-allowed opacity-60 bg-gray-50 text-gray-500 border-gray-200" 
                         disabled
                       >
                          Download Disabled
                       </Button>
                     )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}