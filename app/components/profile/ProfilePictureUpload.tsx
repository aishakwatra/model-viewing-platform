"use client";

import { useState, useRef } from "react";
import { Button } from "@/app/components/ui/Button";

interface ProfilePictureUploadProps {
  currentPhotoUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
}

export function ProfilePictureUpload({
  currentPhotoUrl,
  onUpload,
  onDelete,
  loading = false,
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
      setPreviewUrl(currentPhotoUrl);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;

    if (!confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    setUploading(true);
    try {
      await onDelete();
      setPreviewUrl(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete image");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            className="size-20 rounded-full object-cover ring-2 ring-brown/10"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full bg-brown/10 text-2xl font-semibold text-brown ring-2 ring-brown/10">
            ?
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <div className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading || uploading}
          className="hidden"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || uploading}
            className="text-xs"
          >
            {previewUrl ? "Change Photo" : "Upload Photo"}
          </Button>
          {previewUrl && onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={loading || uploading}
              className="text-xs text-red-600 hover:bg-red-50"
            >
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-brown/60">JPG, PNG (max 5MB)</p>
      </div>
    </div>
  );
}
