"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { postComment } from "@/app/lib/modelData";
import { getCurrentUser } from "@/app/lib/auth";

interface CommentFormProps {
  versionId: number;
  onPosted: () => void; // Callback to refresh the list
}

export function CommentForm({ versionId, onPosted }: CommentFormProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    const user = getCurrentUser();
    if (!user) {
      alert("You must be logged in to comment.");
      return;
    }

    setSubmitting(true);
    
    const result = await postComment(versionId, user.user_id, text);
    
    setSubmitting(false);

    if (result.success) {
      setText(""); // Clear input
      onPosted();  // Refresh parent list
    } else {
      alert("Failed to post comment. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-brown/10 bg-white">
      <div className="relative">
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full rounded-xl border border-brown/20 bg-brown/5 px-3 py-2 pr-2 text-sm text-brown placeholder-brown/40 outline-none focus:ring-2 focus:ring-gold/60 focus:bg-white resize-none min-h-[80px] transition-all"
        />
      </div>
      <div className="mt-2 flex justify-end">
        <Button 
            type="submit" 
            variant="brown" 
            disabled={submitting || !text.trim()} 
            className="h-8 px-4 text-xs font-medium"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}