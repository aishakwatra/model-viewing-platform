import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  photoUrl?: string;
}

export type UserRole = "user" | "creator";

// Role IDs based on your schema (adjust these based on your actual user_roles table)
// Ensure these stay in sync with the values stored in public.user_roles
const ROLE_IDS = {
  user: 2,
  creator: 1,
  admin: 3,
};

/**
 * Sign up a new user
 * Creates user in both Supabase Auth and custom SQL users table
 * If role is 'creator', user status might need approval (implement as needed)
 */
export async function signUp(userData: SignUpData, role: UserRole = "user") {
  try {
    const { email, password, fullName, photoUrl } = userData;

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create auth user");

    const authUserId = authData.user.id; // This is the UUID from auth.users

    // Hash password using bcrypt for custom users table
    const passwordHash = await bcrypt.hash(password, 10);

    // Get the role ID
    const roleId = ROLE_IDS[role];

    // Step 2: Get the next user_id (since it's not auto-generated in your schema)
    const { data: existingUsers, error: countError } = await supabase
      .from("users")
      .select("user_id")
      .order("user_id", { ascending: false })
      .limit(1);

    const nextUserId = existingUsers && existingUsers.length > 0 
      ? existingUsers[0].user_id + 1 
      : 1;

    // Step 3: Create user in custom SQL users table with auth_user_id
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        user_id: nextUserId, // Generate next user_id
        auth_user_id: authUserId, // Link to Supabase Auth user
        email,
        password_hash: passwordHash,
        full_name: fullName,
        photo_url: photoUrl || null,
        user_role_id: roleId,
        is_approved: false,
      })
      .select()
      .single();

    if (insertError) {
      // If SQL insert fails, the auth user exists but has no profile
      // Log the detailed error for debugging
      console.error("Failed to create user profile:", insertError);
      throw new Error(`Failed to create user profile: ${insertError.message || 'Please contact support.'}`);
    }

    return {
      success: true,
      user: newUser,
      authUser: authData.user,
      message: "Account created! Waiting for admin approval.",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

/**
 * Sign in an existing user
 * Uses Supabase Auth for authentication
 */
export async function signIn(email: string, password: string) {
  try {
    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error("Invalid email or password");
    if (!authData.user) throw new Error("Authentication failed");

    const authUserId = authData.user.id;

    // Step 2: Fetch user profile from custom users table using auth_user_id
    const { data: user, error: fetchError } = await supabase
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

    if (fetchError || !user) {
      throw new Error("User profile not found");
    }

    // Check if user is approved
    if (!user.is_approved) {
      throw new Error("Your account is pending approval. Please wait for an administrator to approve your account.");
    }

    // Return user data with auth session
    return {
      success: true,
      user: user,
      session: authData.session,
      message: "Signed in successfully!",
    };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

/**
 * Get current user from local storage (client-side only)
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const userJson = localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Get current authenticated user from Supabase Auth session
 */
export async function getCurrentAuthUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    // Fetch user profile from custom users table
    const { data: profile, error: profileError } = await supabase
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
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !profile) return null;

    return profile;
  } catch (error) {
    console.error("Get current auth user error:", error);
    return null;
  }
}

/**
 * Save user to local storage (client-side only)
 */
export function saveCurrentUser(user: any) {
  if (typeof window === "undefined") return;

  localStorage.setItem("currentUser", JSON.stringify(user));
}

/**
 * Clear current user (logout)
 */
export async function logout() {
  // Sign out from Supabase Auth
  await supabase.auth.signOut();

  // Clear local storage
  if (typeof window !== "undefined") {
    localStorage.removeItem("currentUser");
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Get user role
 */
export function getUserRole(): string | null {
  const user = getCurrentUser();
  return user?.user_roles?.role || null;
}

/**
 * Upload profile picture to Supabase Storage
 */
export async function uploadProfilePicture(file: File, authUserId: string) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${authUserId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;

    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
