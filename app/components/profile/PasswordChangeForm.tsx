"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

interface PasswordChangeFormProps {
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  loading?: boolean;
}

export function PasswordChangeForm({ onSubmit, loading = false }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-brown">Change Password</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            Password changed successfully!
          </div>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-brown">Current Password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={loading || submitting}
            className="rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30 disabled:opacity-50"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-brown">New Password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading || submitting}
            minLength={6}
            className="rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30 disabled:opacity-50"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-brown">Confirm New Password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || submitting}
            minLength={6}
            className="rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30 disabled:opacity-50"
          />
        </label>

        <Button
          type="submit"
          variant="brown"
          disabled={loading || submitting}
          className="w-full sm:w-auto"
        >
          {submitting ? "Changing Password..." : "Change Password"}
        </Button>
      </form>
    </Card>
  );
}
