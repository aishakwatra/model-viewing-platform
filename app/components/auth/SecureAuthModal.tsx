"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/components/ui/Confirm";
import { Button } from "@/app/components/ui/Button";
import { supabase } from "@/app/lib/supabase";
import bcrypt from "bcryptjs";

interface SecureAuthModalProps {
  isOpen: boolean;
  requiredRole?: "admin" | "creator" | "user";
  onAuthSuccess?: (user: any) => void;
}

export function SecureAuthModal({ 
  isOpen, 
  requiredRole = "admin",
  onAuthSuccess 
}: SecureAuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoleMessage, setShowRoleMessage] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setError(null);
      setShowRoleMessage(false);
      setAuthenticatedUser(null);
    }
  }, [isOpen]);

  /**
   * Verify user credentials and role directly from Supabase
   * WITHOUT using localStorage
   */
  async function verifyUserFromDatabase(email: string, password: string) {
    try {
      // Step 1: Try Supabase Auth first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      let user = null;

      // If Supabase Auth succeeds
      if (!authError && authData.user) {
        const authUserId = authData.user.id;

        // Fetch user profile from custom users table using auth_user_id
        const { data: userProfile, error: fetchError } = await supabase
          .from("users")
          .select(
            `
            user_id,
            auth_user_id,
            email,
            full_name,
            photo_url,
            user_role_id,
            created_at,
            is_approved,
            user_roles (
              role
            )
          `
          )
          .eq("auth_user_id", authUserId)
          .single();

        if (fetchError || !userProfile) {
          throw new Error("User profile not found in database");
        }

        user = userProfile;
      } else {
        // Step 2: Fallback to custom password verification (for legacy users)
        const { data: userProfile, error: fetchError } = await supabase
          .from("users")
          .select(
            `
            user_id,
            auth_user_id,
            email,
            password_hash,
            full_name,
            photo_url,
            user_role_id,
            created_at,
            is_approved,
            user_roles (
              role
            )
          `
          )
          .eq("email", email)
          .single();

        if (fetchError || !userProfile) {
          throw new Error("Invalid email or password");
        }

        // Verify password using bcrypt
        const passwordMatch = await bcrypt.compare(password, userProfile.password_hash);
        if (!passwordMatch) {
          throw new Error("Invalid email or password");
        }

        user = userProfile;
      }

      // Check if user is approved
      if (!user.is_approved) {
        throw new Error("Your account is pending approval. Please wait for an administrator to approve your account.");
      }

      // Verify user role directly from database
      return {
        success: true,
        user: user,
        roleId: user.user_role_id,
      };
    } catch (error) {
      console.error("Database verification error:", error);
      throw error;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Verify user directly from database
      const result = await verifyUserFromDatabase(email, password);

      if (result.success) {
        const { user, roleId } = result;

        // Map role IDs to role names
        const roleMap: Record<number, string> = {
          1: "creator",
          2: "user", 
          3: "admin",
        };

        const userRole = roleMap[roleId] || "unknown";

        // Store authenticated user for role message
        setAuthenticatedUser({ ...user, roleName: userRole });

        // Check if user has required role
        if (requiredRole === "admin" && roleId !== 3) {
          setError("Access denied. Admin privileges required.");
          setLoading(false);
          return;
        }

        // Show role-specific message
        setShowRoleMessage(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function handleRoleMessageConfirm() {
    if (!authenticatedUser) return;

    const roleId = authenticatedUser.user_role_id;

    // Call success callback if provided
    if (onAuthSuccess) {
      onAuthSuccess(authenticatedUser);
    }

    // Redirect based on role
    if (roleId === 3) {
      // Admin - stay on admin dashboard and enable data access
      setShowRoleMessage(false);
      // The parent component will handle enabling data access
    } else if (roleId === 1) {
      // Creator - redirect to creator dashboard
      router.push("/creator/dashboard");
    } else if (roleId === 2) {
      // User/Client - redirect to client dashboard
      router.push("/P_ClientDashboard");
    }
  }

  // Show role message modal
  if (showRoleMessage && authenticatedUser) {
    const roleMessages: Record<string, { title: string; message: string }> = {
      admin: {
        title: "Welcome, Administrator",
        message: "You have been authenticated as an administrator. You now have full access to the admin dashboard and all administrative functions.",
      },
      creator: {
        title: "Welcome, Creator",
        message: "You have been authenticated as a creator. You will be redirected to the creator dashboard.",
      },
      user: {
        title: "Welcome, User",
        message: "You have been authenticated as a client. You will be redirected to the client dashboard.",
      },
    };

    const roleInfo = roleMessages[authenticatedUser.roleName] || {
      title: "Welcome",
      message: "Authentication successful.",
    };

    return (
      <Modal
        isOpen={true}
        onClose={() => {}} // Prevent closing without confirming
        onConfirm={handleRoleMessageConfirm}
        onConfirmLabel="OK"
        title={roleInfo.title}
      >
        <p className="text-sm text-brown/70">{roleInfo.message}</p>
      </Modal>
    );
  }

  // Show login form modal
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing - must authenticate
      title="Authentication Required"
      hideActions={true}
    >
      <div className="mt-4">
        <p className="text-sm text-brown/70 mb-4">
          Please sign in to verify your identity and access this page.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="secure-email" className="block text-sm font-medium text-brown/80 mb-1">
              Email
            </label>
            <input
              id="secure-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="secure-password" className="block text-sm font-medium text-brown/80 mb-1">
              Password
            </label>
            <input
              id="secure-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60 disabled:opacity-50"
            />
          </div>

          <Button 
            variant="brown" 
            className="w-full justify-center" 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
