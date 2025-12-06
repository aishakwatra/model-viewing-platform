// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/auth/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to auth page if not logged in
        router.push("/auth");
      } else if (user.is_approved === false) {
        // Redirect to auth page if not approved
        router.push("/auth");
      }
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If no user or not approved after loading, they'll be redirected by useEffect
  if (!user || user.is_approved === false) {
    return null;
  }

  return (
    <main className="p-8">      

      <div className="mt-6 flex gap-4">
        <Link href="/P_ClientDashboard">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Go to Client Dashboard
          </button>
        </Link>
        
        <Link href="/P_AdminDashboard">
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            Go to Admin Dashboard
          </button>
        </Link>

        {/* --- NEW BUTTONS ADDED BELOW --- */}

        <Link href="/creator/dashboard">
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
            Creator Dashboard
          </button>
        </Link>

        <Link href="/auth">
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            Auth Page
          </button>
        </Link>
        
        <Link href="/models">
          <button className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors">
            Model Viewer
          </button>
        </Link>
      </div>
      
    </main>
  );
}