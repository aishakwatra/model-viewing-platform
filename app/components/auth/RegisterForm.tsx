"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Confirm";
import { signUp, uploadProfilePicture, saveCurrentUser, UserRole } from "@/app/lib/auth";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!fullName.trim()) {
        throw new Error("Full name is required");
      }
      if (!email.trim()) {
        throw new Error("Email is required");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      let photoUrl: string | undefined;

      // Upload profile picture if provided
      if (profilePicture) {
        // Note: We'll upload after creating user to get auth_user_id
        // For now, we'll create user first, then update with photo
      }

      // Create user account
      const result = await signUp(
        {
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          photoUrl,
        },
        role
      );

      if (result.success) {
        // Save user to local storage
        saveCurrentUser(result.user);

        // Show success modal
        setShowSuccessModal(true);

        // If success callback provided, call it
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account";
      
      // Provide more helpful error messages
      if (errorMessage.includes("pending approval")) {
        setError("Your account is awaiting approval. Please wait for an administrator to review your account before attempting to sign in.");
      } else if (errorMessage.includes("rejected")) {
        setError("Your previous account was rejected. Please contact support if you believe this is an error.");
      } else if (errorMessage.includes("already exists")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleModalClose() {
    setShowSuccessModal(false);
    router.push("/auth");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      setProfilePicture(file);
      setError(null);
    }
  }

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-brown">Create account</h2>
        <p className="text-sm text-brown/70 mt-1">Join our creative community</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

        <div>
          <label htmlFor="full-name" className="block text-sm font-medium text-brown/80 mb-1">
            Full Name
          </label>
          <input
            id="full-name"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="email-register" className="block text-sm font-medium text-brown/80 mb-1">
            Email
          </label>
          <input
            id="email-register"
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
          <label htmlFor="password-register" className="block text-sm font-medium text-brown/80 mb-1">
            Password
          </label>
          <input
            id="password-register"
            type="password"
            placeholder="Enter your password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
            className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brown/80 mb-1">
            Profile Picture (Optional)
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-brown/20 border-dashed rounded-lg cursor-pointer bg-brown/5 hover:bg-brown/10"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-brown/60">
                {profilePicture ? (
                  <>
                    <svg
                      className="w-8 h-8 mb-2 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-xs font-medium text-green-600">{profilePicture.name}</p>
                    <p className="text-xs">Click to change</p>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-8 h-8 mb-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="text-xs">Click to upload or drag and drop</p>
                    <p className="text-xs">PNG, JPG (up to 10MB)</p>
                  </>
                )}
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          </div>
        </div>

          <div>
            <label className="block text-sm font-medium text-brown/80 mb-2">I am a</label>
            <div className="flex items-center p-1 rounded-xl bg-brown/5 border border-brown/10">
              <Button
                type="button"
                variant={role === "user" ? "gold" : "ghost"}
                onClick={() => setRole("user")}
                disabled={loading}
                className="w-1/2"
              >
                User
              </Button>
              <Button
                type="button"
                variant={role === "creator" ? "gold" : "ghost"}
                onClick={() => setRole("creator")}
                disabled={loading}
                className="w-1/2"
              >
                Creator
              </Button>
            </div>
          </div>

          <Button variant="brown" className="w-full !mt-6" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="Account Created Successfully!"
        onCancelLabel="OK"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <p className="text-center text-brown/90">
            Your account has been created successfully!
          </p>
          <p className="text-center text-sm text-brown/70">
            Please wait for an administrator to approve your account before you can sign in.
          </p>
        </div>
      </Modal>
    </>
  );
}
