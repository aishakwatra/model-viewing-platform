"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { PendingRequestCard, PendingRequest } from "./PendingRequestCard";

interface PendingRequestsListProps {
  fetchRequests: () => Promise<PendingRequest[]>;
  approveRequest: (userId: number) => Promise<void>;
  rejectRequest: (userId: number) => Promise<void>;
}

export function PendingRequestsList({ fetchRequests, approveRequest, rejectRequest }: PendingRequestsListProps) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
      setProcessingId(null);
      setProcessingAction(null);
    }
  }, [fetchRequests]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (userId: number) => {
    setProcessingId(userId);
    setProcessingAction("approve");
    try {
      await approveRequest(userId);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve request");
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleReject = async (userId: number) => {
    setProcessingId(userId);
    setProcessingAction("reject");
    try {
      await rejectRequest(userId);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject request");
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 text-center text-brown/70">
        Loading pending requests...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 space-y-4">
        <div className="text-sm text-red-600">{error}</div>
        <Button variant="brown" onClick={loadRequests}>
          Retry
        </Button>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-6 text-center text-brown/70">
        No pending creator requests at the moment.
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="grid grid-cols-12 border-b border-brown/10 bg-brown/5 px-4 py-3 text-xs font-semibold text-brown">
        <div className="col-span-3">Name</div>
        <div className="col-span-3">Email</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-2">Requested Date</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      {requests.map((request) => (
        <PendingRequestCard
          key={request.user_id}
          request={request}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={processingId === request.user_id}
          processingAction={processingAction}
        />
      ))}
    </Card>
  );
}
