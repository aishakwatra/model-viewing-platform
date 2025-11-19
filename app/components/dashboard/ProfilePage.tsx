
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { ProfilePictureUpload } from "@/app/components/profile/ProfilePictureUpload";
import { PasswordChangeForm } from "@/app/components/profile/PasswordChangeForm";
import { ProfileStats } from "@/app/components/profile/ProfileStats";
import { getCurrentUser, saveCurrentUser, logout } from "@/app/lib/auth";
import {
  fetchUserProfile,
  updateUserProfile,
  uploadUserProfilePicture,
  deleteUserProfilePicture,
  getUserStatistics,
  UserProfile,
} from "@/app/lib/userProfile";

interface FormState {
  fullName: string;
  email: string;
}

export function ProfileClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formState, setFormState] = useState<FormState>({
    fullName: "",
    email: "",
  });
  const [loggingOut, setLoggingOut] = useState(false);

  const [stats, setStats] = useState({
    projects: 0,
    favourites: 0,
    comments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const profileSource = searchParams.get("from");
  const backHref = profileSource === "creator" ? "/creator/dashboard" : "/P_ClientDashboard";

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      setLoading(true);
      setError(null);

      const user = getCurrentUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      setCurrentUser(user);

      const [profile, statistics] = await Promise.all([
        fetchUserProfile(user.auth_user_id),
        getUserStatistics(user.user_id),
      ]);

      setUserProfile(profile);
      setFormState({
        fullName: profile.full_name || "",
        email: profile.email || "",
      });
      setStats(statistics);
    } catch (err) {
      console.error("Error loading user data:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  async function handleSaveChanges(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateUserProfile(currentUser.auth_user_id, {
        full_name: formState.fullName,
        email: formState.email,
      });

      if (result.success && result.user) {
        setUserProfile(result.user);
        setSuccess(result.message);

        // Update stored user data
        const updatedUser = { ...currentUser, ...result.user };
        saveCurrentUser(updatedUser);
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(file: File) {
    if (!currentUser) return;

    try {
      const photoUrl = await uploadUserProfilePicture(currentUser.auth_user_id, file);

      // Update local state
      const updatedProfile = { ...userProfile!, photo_url: photoUrl };
      setUserProfile(updatedProfile);

      // Update stored user data
      const updatedUser = { ...currentUser, photo_url: photoUrl };
      saveCurrentUser(updatedUser);
      setCurrentUser(updatedUser);

      setSuccess("Profile picture updated successfully");
    } catch (err) {
      throw err;
    }
  }

  async function handlePhotoDelete() {
    if (!currentUser) return;

    try {
      await deleteUserProfilePicture(currentUser.auth_user_id);

      // Update local state
      const updatedProfile = { ...userProfile!, photo_url: null };
      setUserProfile(updatedProfile);

      // Update stored user data
      const updatedUser = { ...currentUser, photo_url: null };
      saveCurrentUser(updatedUser);
      setCurrentUser(updatedUser);

      setSuccess("Profile picture removed successfully");
    } catch (err) {
      throw err;
    }
  }

  function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      logout();
      router.replace("/auth");
    } finally {
      setLoggingOut(false);
    }
  }

  async function handlePasswordChange(currentPassword: string, newPassword: string) {
    if (!currentUser) return;

    try {
      await updateUserProfile(currentUser.auth_user_id, {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (err) {
      throw err;
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-10 text-center">
        <div className="text-brown">Loading profile...</div>
      </div>
    );
  }

  if (error && !userProfile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
        <Card className="p-8 text-center">
          <div className="text-red-600">{error}</div>
          <Button variant="brown" onClick={loadUserData} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-2 text-brown hover:underline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brown md:text-3xl">
            Edit Account Information
          </h1>
          <p className="mt-1 text-sm text-brown/70">
            Update your profile, contact details, and account settings.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-brown/10 text-lg font-semibold text-brown">
            {formState.fullName
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0])
              .slice(0, 2)
              .join("") || "U"}
          </div>
          <Button
            variant="outline"
            className="rounded-xl border border-brown/20 px-4 py-2 text-sm font-medium text-brown transition hover:bg-brown/5"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Stats */}
        <ProfileStats stats={stats} loading={loading} />

        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-brown">Basic Information</h3>

          {/* Profile Picture */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-brown">
              Profile Picture
            </label>
            <ProfilePictureUpload
              currentPhotoUrl={userProfile?.photo_url || null}
              onUpload={handlePhotoUpload}
              onDelete={handlePhotoDelete}
              loading={saving}
            />
          </div>

          <form onSubmit={handleSaveChanges} className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Full Name */}
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-brown">Full Name</span>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(event) => handleInputChange("fullName", event.target.value)}
                  disabled={saving}
                  required
                  className="rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30 disabled:opacity-50"
                />
              </label>

              {/* Email Address */}
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-brown">Email Address</span>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => handleInputChange("email", event.target.value)}
                  disabled={saving}
                  required
                  className="rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30 disabled:opacity-50"
                />
              </label>

              {/* User Role (Read-only) */}
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-brown">Account Role</span>
                <input
                  type="text"
                  value={userProfile?.user_roles?.role || "N/A"}
                  disabled
                  className="rounded-xl border border-brown/20 bg-brown/5 px-3 py-2 text-sm text-brown/70 outline-none"
                />
              </label>

              {/* Member Since (Read-only) */}
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-brown">Member Since</span>
                <input
                  type="text"
                  value={
                    userProfile?.created_at
                      ? new Date(userProfile.created_at).toLocaleDateString()
                      : "N/A"
                  }
                  disabled
                  className="rounded-xl border border-brown/20 bg-brown/5 px-3 py-2 text-sm text-brown/70 outline-none"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-brown/60">
                Saving will update your account details across the entire platform.
              </p>
              <div className="flex gap-3">
                <Link
                  href={backHref}
                  className="inline-flex items-center rounded-xl border border-brown/20 px-4 py-2 text-sm font-medium text-brown transition hover:bg-brown/5"
                >
                  Cancel
                </Link>
                <Button type="submit" variant="gold" className="px-6" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Password Change */}
        <PasswordChangeForm onSubmit={handlePasswordChange} loading={saving} />
      </div>
    </div>
  );
}
