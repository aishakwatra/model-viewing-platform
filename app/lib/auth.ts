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
const ROLE_IDS = {
  user: 1, // Regular user/client
  creator: 2, // Creator (needs approval)
  admin: 3, // Admin (if exists)
};

/**
 * Sign up a new user
 * If role is 'creator', user status might need approval (implement as needed)
 */
export async function signUp(userData: SignUpData, role: UserRole = "user") {
  try {
    const { email, password, fullName, photoUrl } = userData;

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Get the role ID
    const roleId = ROLE_IDS[role];

    // For creators, you might want to add additional logic
    // For now, we'll just create the user with the appropriate role
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        photo_url: photoUrl || null,
        user_role_id: roleId,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return {
      success: true,
      user: newUser,
      message:
        role === "creator"
          ? "Account created! Creator accounts may require approval."
          : "Account created successfully!",
    };
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  try {
    // Fetch user by email
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select(
        `
        user_id,
        email,
        password_hash,
        full_name,
        photo_url,
        user_role_id,
        created_at,
        user_roles (
          role
        )
      `
      )
      .eq("email", email)
      .single();

    if (fetchError || !user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    let isPasswordValid = false;
    
    // Check if password_hash is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    const isBcryptHash = /^\$2[ayb]\$/.test(user.password_hash);
    
    if (isBcryptHash) {
      // Proper bcrypt hash - use bcrypt.compare
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      // Legacy/placeholder hash - direct comparison (TEMPORARY - FOR TESTING ONLY)
      console.warn("⚠️ WARNING: Using plain text password comparison for user:", email);
      console.warn("⚠️ Please update this user's password hash to a proper bcrypt hash!");
      isPasswordValid = password === user.password_hash;
    }

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Return user data (without password hash)
    const { password_hash, ...userWithoutPassword } = user;

    return {
      success: true,
      user: userWithoutPassword,
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
 * Save user to local storage (client-side only)
 */
export function saveCurrentUser(user: any) {
  if (typeof window === "undefined") return;

  localStorage.setItem("currentUser", JSON.stringify(user));
}

/**
 * Clear current user (logout)
 */
export function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("currentUser");
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
export async function uploadProfilePicture(file: File, userId: number) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
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
