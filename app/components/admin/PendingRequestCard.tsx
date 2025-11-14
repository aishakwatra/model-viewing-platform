"use client";

import { Button } from "@/app/components/ui/Button";

export interface PendingRequest {
  user_id: number;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface PendingRequestCardProps {
  request: PendingRequest;
  onApprove: (userId: number) => Promise<void>;
  onReject: (userId: number) => Promise<void>;
  isProcessing?: boolean;
  processingAction?: "approve" | "reject" | null;
}

export function PendingRequestCard({
  request,
  onApprove,
  onReject,
  isProcessing = false,
  processingAction = null,
}: PendingRequestCardProps) {
  const isApproving = isProcessing && processingAction === "approve";
  const isRejecting = isProcessing && processingAction === "reject";

  return (
    <div className="grid grid-cols-12 items-center px-4 py-3 border-b border-brown/10">
      <div className="col-span-3">
        <p className="text-sm font-medium text-brown">
          {request.full_name || "Unnamed Creator"}
        </p>
      </div>
      <div className="col-span-3">
        <p className="text-sm text-brown/80">{request.email}</p>
      </div>
      <div className="col-span-2">
        <p className="text-sm text-brown/80">Creator</p>
      </div>
      <div className="col-span-2">
        <p className="text-sm text-brown/80">
          {new Date(request.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="col-span-2 flex justify-end gap-2">
        <Button
          variant="gold"
          className="h-9 px-3 text-xs"
          onClick={() => onApprove(request.user_id)}
          disabled={isProcessing}
        >
          {isApproving ? "Approving..." : "Approve"}
        </Button>
        <Button
          variant="outline"
          className="h-9 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => onReject(request.user_id)}
          disabled={isProcessing}
        >
          {isRejecting ? "Rejecting..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
