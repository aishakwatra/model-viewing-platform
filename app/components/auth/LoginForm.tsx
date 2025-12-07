"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { signIn, saveCurrentUser } from "@/app/lib/auth";
import { useAuth } from "@/app/components/auth/AuthProvider";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success) {
        console.log("✅ Sign in successful, user data:", result.user);
        console.log("✅ User approval status:", result.user.is_approved);
        
        // Save user to local storage
        saveCurrentUser(result.user);
        
        // Refresh the auth context to update the user state
        refreshUser();

        // Show success message (optional)
        if (onSuccess) {
          onSuccess();
        }

        const roleId = result.user.user_role_id;

        // 2. Get Role Name (String) - Handle Array vs Object response from Supabase
        const roleData = result.user.user_roles;
        let roleString = "";
        
        if (Array.isArray(roleData) && roleData.length > 0) {
            roleString = roleData[0]?.role || "";
        } else if (roleData && typeof roleData === 'object') {
            // @ts-ignore
            roleString = roleData.role || "";
        }

        console.log(`🔍 Role Detected -> ID: ${roleId}, Name: "${roleString}"`);

        // --- ROUTING LOGIC ---
        // Use window.location instead of router.push to force a full page reload
        // This ensures the auth context is fully updated before the new page loads
        
        // CREATOR
        if (roleId === 1 || roleString === "CREATOR") {
          console.log("➡️ Redirecting to Creator Dashboard");
          window.location.href = "/creator/dashboard";
        } 
        // ADMIN
        else if (roleId === 3 || roleString === "ADMIN") {
          console.log("➡️ Redirecting to Admin Dashboard");
          window.location.href = "/P_AdminDashboard";
        } 
        else if (roleId === 2 || roleString === "USER") {
          console.log("➡️ Redirecting to Client Dashboard");
          window.location.href = "/P_ClientDashboard";
        } 
        else {
          window.location.href = "/auth";
        }

      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      
      // Provide more specific error messages
      if (errorMessage.includes("pending approval")) {
        setError("Your account is awaiting approval. Please wait for an administrator to review your account.");
      } else if (errorMessage.includes("rejected")) {
        setError("Your account has been rejected. Please contact support if you believe this is an error.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-brown">Welcome back</h2>
      <p className="text-sm text-brown/70 mt-1">Sign in to your account</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email-login" className="block text-sm font-medium text-brown/80 mb-1">
            Email
          </label>
          <input
            id="email-login"
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
          <label htmlFor="password-login" className="block text-sm font-medium text-brown/80 mb-1">
            Password
          </label>
          <input
            id="password-login"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60 disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="rounded border-brown/30 text-brown focus:ring-gold/60"
            />
            <label htmlFor="remember-me" className="text-brown/80">
              Remember me
            </label>
          </div>
          <a href="#" className="font-medium text-brown hover:underline">
            Forgot password?
          </a>
        </div>

        <Button variant="brown" className="w-full !mt-6" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
