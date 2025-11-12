import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

export interface UserProfile {
  user_id: number;
  email: string;
  full_name: string | null;
  photo_url: string | null;
  user_role_id: number;
  created_at: string;
  user_roles?: {
    role: string;
  };
}

export interface ProfileUpdateData {
  full_name?: string;
  email?: string;
  photo_url?: string;
  current_password?: string;
  new_password?: string;
}

/**
 * Fetch user profile by user ID
 */
export async function fetchUserProfile(userId: number): Promise<UserProfile> {
  try {
    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id, email, full_name, photo_url, user_role_id, created_at")
      .eq("user_id", userId)
      .single();

    if (userError) {
      console.error("❌ Error fetching user:", userError);
      throw userError;
    }

    if (!userData) {
      throw new Error("User not found");
    }

    // Fetch user role separately
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("id", userData.user_role_id)
      .single();

    if (roleError) {
      console.warn("⚠️ Could not fetch user role:", roleError);
    }

    // Combine data
    const profile: UserProfile = {
      ...userData,
      user_roles: roleData ? { role: roleData.role } : undefined,
    };

    return profile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

/**
 * Update user profile - Simplified approach
 */
export async function updateUserProfile(
  userId: number,
  updates: ProfileUpdateData
): Promise<{ success: boolean; message: string; user?: UserProfile }> {
  try {
    console.log("🔄 Starting profile update for user:", userId);
    console.log("📝 Updates received:", { ...updates, current_password: "***", new_password: updates.new_password ? "***" : undefined });

    // Step 1: Handle password change if requested
    if (updates.new_password) {
      if (!updates.current_password) {
        throw new Error("Current password is required to change password");
      }

      // Fetch and verify current password
      const { data: currentUser, error: fetchError } = await supabase
        .from("users")
        .select("password_hash")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching user for password verification:", fetchError);
        throw new Error("Failed to verify current password");
      }

      if (!currentUser) {
        throw new Error("User not found");
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        updates.current_password,
        currentUser.password_hash
      );

      if (!isPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      console.log("✅ Current password verified");

      // Hash and update new password
      const newPasswordHash = await bcrypt.hash(updates.new_password, 10);
      
      const { error: passwordUpdateError } = await supabase
        .from("users")
        .update({ password_hash: newPasswordHash })
        .eq("user_id", userId);

      if (passwordUpdateError) {
        console.error("❌ Error updating password:", passwordUpdateError);
        throw new Error("Failed to update password");
      }

      console.log("✅ Password updated successfully");
    }

    // Step 2: Check email uniqueness if email is being changed
    if (updates.email) {
      const { data: existingUser, error: emailCheckError } = await supabase
        .from("users")
        .select("user_id")
        .eq("email", updates.email)
        .neq("user_id", userId)
        .maybeSingle();

      if (emailCheckError) {
        console.error("❌ Error checking email:", emailCheckError);
        throw new Error("Failed to validate email");
      }

      if (existingUser) {
        throw new Error("Email is already taken");
      }
    }

    // Step 3: Update profile fields (name, email, photo_url)
    const profileFields: { [key: string]: any } = {};
    
    if (updates.full_name !== undefined) {
      profileFields.full_name = updates.full_name;
    }
    if (updates.email !== undefined) {
      profileFields.email = updates.email;
    }
    if (updates.photo_url !== undefined) {
      profileFields.photo_url = updates.photo_url;
    }

    // Only update if there are fields to update
    if (Object.keys(profileFields).length > 0) {
      console.log("📝 Updating profile fields:", Object.keys(profileFields));
      
      const { error: profileUpdateError } = await supabase
        .from("users")
        .update(profileFields)
        .eq("user_id", userId);

      if (profileUpdateError) {
        console.error("❌ Error updating profile fields:", profileUpdateError);
        throw new Error(`Failed to update profile: ${profileUpdateError.message}`);
      }

      console.log("✅ Profile fields updated successfully");
    }

    // Step 4: Fetch updated user data
    const { data: updatedUser, error: fetchUpdatedError } = await supabase
      .from("users")
      .select("user_id, email, full_name, photo_url, user_role_id, created_at")
      .eq("user_id", userId)
      .single();

    if (fetchUpdatedError) {
      console.error("❌ Error fetching updated user:", fetchUpdatedError);
      throw new Error("Failed to fetch updated profile");
    }

    if (!updatedUser) {
      throw new Error("User not found after update");
    }

    // Step 5: Fetch user role separately
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("id", updatedUser.user_role_id)
      .single();

    if (roleError) {
      console.warn("⚠️ Could not fetch user role:", roleError);
    }

    // Construct final user object
    const finalUser: UserProfile = {
      ...updatedUser,
      user_roles: roleData ? { role: roleData.role } : undefined,
    };

    console.log("✅ Profile update completed successfully");

    return {
      success: true,
      message: updates.new_password 
        ? "Profile and password updated successfully" 
        : "Profile updated successfully",
      user: finalUser,
    };
  } catch (error) {
    console.error("❌ Error in updateUserProfile:", error);
    if (error instanceof Error) {
      throw error; // Re-throw with original message
    }
    throw new Error("An unexpected error occurred while updating profile");
  }
}

/**
 * Upload user profile picture
 */
export async function uploadUserProfilePicture(
  userId: number,
  file: File
): Promise<string> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Update user's photo_url
    const { error: updateError } = await supabase
      .from("users")
      .update({ photo_url: publicUrl })
      .eq("user_id", userId);

    if (updateError) throw updateError;

    return publicUrl;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

/**
 * Delete user profile picture
 */
export async function deleteUserProfilePicture(userId: number): Promise<void> {
  try {
    // Get current photo URL
    const { data: user } = await supabase
      .from("users")
      .select("photo_url")
      .eq("user_id", userId)
      .single();

    if (user?.photo_url) {
      // Extract file path from URL
      const urlParts = user.photo_url.split("/");
      const filePath = urlParts.slice(-2).join("/"); // Get last two parts (folder/filename)

      // Delete from storage
      await supabase.storage.from("avatars").remove([filePath]);
    }

    // Update user record
    await supabase
      .from("users")
      .update({ photo_url: null })
      .eq("user_id", userId);
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    throw error;
  }
}

/**
 * Get user statistics (for profile page)
 */
export async function getUserStatistics(userId: number) {
  try {
    const [projectsCount, favouritesCount, commentsCount] = await Promise.all([
      // Count projects user has access to (for clients) or created (for creators)
      supabase
        .from("project_clients")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),

      // Count favourites
      supabase
        .from("user_favourites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),

      // Count comments
      supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    return {
      projects: projectsCount.count || 0,
      favourites: favouritesCount.count || 0,
      comments: commentsCount.count || 0,
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return {
      projects: 0,
      favourites: 0,
      comments: 0,
    };
  }
}
