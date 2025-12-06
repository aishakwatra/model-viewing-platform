"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, logout as logoutUser } from "@/app/lib/auth";

interface User {
  user_id: number;
  auth_user_id: string;
  email: string;
  full_name: string | null;
  photo_url: string | null;
  user_role_id: number;
  created_at: string;
  is_approved?: boolean;
  user_roles?: {
    role: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user on mount
    const currentUser = getCurrentUser();
    console.log("🔍 AuthProvider: Loaded user from localStorage:", currentUser);
    console.log("🔍 AuthProvider: User approval status:", currentUser?.is_approved);
    setUser(currentUser);
    setLoading(false);
  }, []);

  function logout() {
    logoutUser();
    setUser(null);
  }

  function refreshUser() {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
