// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Always redirect to auth page
    // If user is not logged in or not approved, they'll see login
    // If user is logged in and approved, they'll be redirected to their dashboard
    if (!loading) {
      router.push("/auth");
    }
  }, [loading, router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-brown/5">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brown border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-brown">Redirecting to authentication...</p>
      </div>
    </div>
  );
}