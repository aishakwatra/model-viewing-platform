# User Profile Feature - Integration Documentation

## Overview
Complete user profile management system with Supabase integration, allowing users to view and update their profile information, change passwords, and upload profile pictures.

## Files Created

### Backend Functions (`app/lib/userProfile.ts`)

#### Core Functions

1. **`fetchUserProfile(userId)`**
   - Fetches complete user profile data
   - Returns user info with role information
   - Throws error if user not found

2. **`updateUserProfile(userId, updates)`**
   - Updates user profile information
   - Validates email uniqueness
   - Supports password changes with verification
   - Returns updated user data

3. **`uploadUserProfilePicture(userId, file)`**
   - Uploads profile picture to Supabase Storage
   - Updates user's `photo_url` in database
   - Returns public URL of uploaded image

4. **`deleteUserProfilePicture(userId)`**
   - Removes profile picture from storage
   - Sets `photo_url` to null in database

5. **`getUserStatistics(userId)`**
   - Fetches user activity statistics
   - Returns counts for: projects, favourites, comments

### Reusable Components

#### 1. `ProfilePictureUpload.tsx`
**Purpose**: Handle profile picture upload/delete with preview

**Props**:
```typescript
{
  currentPhotoUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
}
```

**Features**:
- Image preview before upload
- File validation (type, size)
- Upload progress indicator
- Delete confirmation
- Max file size: 5MB

#### 2. `PasswordChangeForm.tsx`
**Purpose**: Secure password change interface

**Props**:
```typescript
{
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  loading?: boolean;
}
```

**Features**:
- Current password verification
- Password confirmation matching
- Minimum length validation (6 chars)
- Success/error feedback
- Auto-clear on success

#### 3. `ProfileStats.tsx`
**Purpose**: Display user activity statistics

**Props**:
```typescript
{
  stats: {
    projects: number;
    favourites: number;
    comments: number;
  };
  loading?: boolean;
}
```

**Features**:
- Visual icons for each stat
- Loading state support
- Responsive grid layout

### Updated Main Component

#### `ProfileClientPage.tsx`
**Fully integrated profile page with**:
- Auto-load user data on mount
- Profile picture upload/delete
- Basic info editing (name, email)
- Read-only fields (role, member since)
- Password change form
- Activity statistics
- Success/error messaging
- Loading states
- Auto-redirect if not logged in

## Features Implemented

### ✅ Profile Information Management
- **View Profile**: Automatically loads logged-in user's data
- **Edit Name**: Update full name
- **Edit Email**: Change email (with uniqueness validation)
- **Profile Picture**: Upload, preview, and delete
- **Read-only Info**: Role and registration date

### ✅ Password Management
- **Change Password**: Secure password update
- **Current Password Verification**: Must provide current password
- **Password Validation**: 
  - Minimum 6 characters
  - Must be different from current
  - Confirmation matching

### ✅ Activity Statistics
- **Projects**: Number of accessible projects
- **Favourites**: Count of favorited models
- **Comments**: Total comments made

### ✅ User Experience
- **Auto-login Check**: Redirects to auth if not logged in
- **Loading States**: Shows loading during data fetch
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confirmation messages
- **Real-time Updates**: LocalStorage synced with database

## Data Flow

### Page Load Flow
```
1. User navigates to /profile
2. Check if user is logged in (localStorage)
3. If not logged in → redirect to /auth
4. If logged in → fetch user data from Supabase
5. Load profile info + statistics
6. Populate form fields
7. Display profile page
```

### Update Profile Flow
```
1. User edits name/email
2. Click "Save Changes"
3. Validate input
4. Send update to Supabase
5. If email changed → check uniqueness
6. Update database
7. Update localStorage
8. Show success message
9. Refresh UI with new data
```

### Upload Photo Flow
```
1. User selects image file
2. Validate file (type, size)
3. Show preview
4. Upload to Supabase Storage
5. Get public URL
6. Update user record with photo_url
7. Update localStorage
8. Show success message
```

### Change Password Flow
```
1. User enters current + new password
2. Validate input (length, matching)
3. Verify current password with bcrypt
4. Hash new password
5. Update database
6. Show success message
7. Clear form fields
```

## Database Schema Usage

### Tables
- **users**: Main user table (all fields)
- **user_roles**: For role display
- **project_clients**: Count accessible projects
- **user_favourites**: Count favorited models
- **comments**: Count user comments

### Storage Buckets
- **avatars**: Stores profile pictures
  - Path format: `profile-pictures/{userId}-{timestamp}.{ext}`

## Usage Examples

### Example 1: Fetch and Display Profile
```typescript
import { fetchUserProfile } from "@/app/lib/userProfile";

const profile = await fetchUserProfile(userId);
console.log(profile.full_name, profile.email);
```

### Example 2: Update Profile
```typescript
import { updateUserProfile } from "@/app/lib/userProfile";

const result = await updateUserProfile(userId, {
  full_name: "New Name",
  email: "newemail@example.com",
});

if (result.success) {
  console.log("Updated!", result.user);
}
```

### Example 3: Change Password
```typescript
import { updateUserProfile } from "@/app/lib/userProfile";

await updateUserProfile(userId, {
  current_password: "oldpass123",
  new_password: "newpass456",
});
```

### Example 4: Upload Profile Picture
```typescript
import { uploadUserProfilePicture } from "@/app/lib/userProfile";

const photoUrl = await uploadUserProfilePicture(userId, fileObject);
console.log("Uploaded to:", photoUrl);
```

### Example 5: Get User Stats
```typescript
import { getUserStatistics } from "@/app/lib/userProfile";

const stats = await getUserStatistics(userId);
console.log(`Projects: ${stats.projects}, Favourites: ${stats.favourites}`);
```

## Component Reusability

All components are designed to be reusable:

### Use ProfilePictureUpload Anywhere
```typescript
import { ProfilePictureUpload } from "@/app/components/profile/ProfilePictureUpload";

<ProfilePictureUpload
  currentPhotoUrl={user.photo_url}
  onUpload={async (file) => {
    const url = await uploadUserProfilePicture(user.user_id, file);
    // Handle success
  }}
  onDelete={async () => {
    await deleteUserProfilePicture(user.user_id);
    // Handle success
  }}
/>
```

### Use PasswordChangeForm Anywhere
```typescript
import { PasswordChangeForm } from "@/app/components/profile/PasswordChangeForm";

<PasswordChangeForm
  onSubmit={async (current, newPass) => {
    await updateUserProfile(userId, {
      current_password: current,
      new_password: newPass,
    });
  }}
/>
```

### Use ProfileStats Anywhere
```typescript
import { ProfileStats } from "@/app/components/profile/ProfileStats";

<ProfileStats stats={{ projects: 5, favourites: 12, comments: 8 }} />
```

## Integration with Existing Pages

### From Client Dashboard
```
/P_ClientDashboard → Profile button → /profile?from=client
```

### From Creator Dashboard
```
/creator/dashboard → Profile button → /profile?from=creator
```

Back button navigates to appropriate dashboard based on `from` parameter.

## Security Considerations

### ✅ Implemented
- Password hashing with bcrypt
- Current password verification for changes
- Email uniqueness validation
- File type and size validation
- Authentication check before data access

### 🔒 Best Practices
- Only logged-in users can access
- Users can only edit their own profile
- Passwords never returned in queries
- Old profile pictures deleted on new upload

## Error Handling

### Common Errors Handled
- User not found
- Invalid current password
- Email already taken
- File too large
- Invalid file type
- Network errors

### User-Friendly Messages
All errors are caught and displayed with clear, actionable messages:
- "Current password is incorrect"
- "Email is already taken"
- "File size must be less than 5MB"
- etc.

## LocalStorage Sync

Profile updates automatically sync with localStorage to ensure:
- User data stays fresh across pages
- No need to re-fetch on every navigation
- Consistent user experience

## Future Enhancements

### Possible Additions
- 🔧 Email verification for email changes
- 🔧 Account deletion
- 🔧 Privacy settings
- 🔧 Notification preferences
- 🔧 Two-factor authentication
- 🔧 Activity log/history
- 🔧 Export user data
- 🔧 Multiple profile pictures/gallery
- 🔧 Social media links
- 🔧 Bio/description field

## Testing

### Test Profile Page
1. Login with any account
2. Navigate to `/profile`
3. Should see your profile data auto-loaded

### Test Update Name/Email
1. Change name or email
2. Click "Save Changes"
3. Should see success message
4. Refresh page - changes should persist

### Test Upload Photo
1. Click "Upload Photo"
2. Select image (PNG/JPG, <5MB)
3. Should see preview
4. Image uploads automatically

### Test Change Password
1. Scroll to "Change Password" section
2. Enter current + new password
3. Click "Change Password"
4. Should see success message
5. Logout and login with new password

## Troubleshooting

### Issue: Profile doesn't load
**Solution**: Check if user is logged in. Clear localStorage and login again.

### Issue: Email update fails
**Solution**: Email might be taken. Try a different email.

### Issue: Photo upload fails
**Solution**: 
- Check file size (<5MB)
- Check file type (PNG/JPG only)
- Verify Supabase Storage bucket exists and is accessible

### Issue: Password change fails
**Solution**: Verify current password is correct and new password meets requirements.

## Summary

Complete, production-ready profile management system with:
- ✅ Full CRUD operations
- ✅ Secure password management
- ✅ Profile picture upload
- ✅ User statistics
- ✅ Reusable components
- ✅ Comprehensive error handling
- ✅ Auto-sync with localStorage
- ✅ Mobile-responsive design
