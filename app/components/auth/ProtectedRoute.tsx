"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string; // Optional: require specific role
  redirectTo?: string; // Optional: custom redirect path
}

export function ProtectedRoute({
  children,
  requireRole,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not authenticated, redirect to auth page
        router.push(redirectTo);
      } else if (requireRole && user.user_roles?.role !== requireRole) {
        // User doesn't have required role
        router.push("/unauthorized");
      }
    }
  }, [user, loading, requireRole, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-beige">
        <div className="text-brown">Loading...</div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!user || (requireRole && user.user_roles?.role !== requireRole)) {
    return null;
  }

  return <>{children}</>;
}
