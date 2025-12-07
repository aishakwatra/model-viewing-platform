"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/auth/AuthProvider';

/**
 * Hook to protect routes from unapproved or unauthenticated users
 * Redirects to /auth if user is not authenticated or not approved
 */
export function useProtectedRoute() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // No user logged in
      if (!user) {
        router.push('/auth');
        return;
      }

      // User is not approved
      if (user.is_approved === false) {
        router.push('/auth');
        return;
      }
    }
  }, [user, loading, router]);

  return { user, loading };
}
