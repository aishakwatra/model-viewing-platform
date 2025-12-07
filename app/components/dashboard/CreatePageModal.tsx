"use client";
import { useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { createPortfolioPage } from "@/app/lib/portfolio";
import { getCurrentUser } from "@/app/lib/auth";

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePageModal({ isOpen, onClose, onSuccess }: CreatePageModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (user) {
        await createPortfolioPage(user.user_id, name);
        setName("");
        onSuccess();
        onClose();
      }
    } catch (err) {
      alert("Failed to create page");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-brown mb-4">New Portfolio Page</h2>
        <input
          autoFocus
          className="w-full rounded-xl border border-brown/20 px-4 py-2 mb-4 outline-none focus:ring-2 focus:ring-gold"
          placeholder="Page Name (e.g. Wedding Collection)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="gold" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </Card>
    </div>
  );
}