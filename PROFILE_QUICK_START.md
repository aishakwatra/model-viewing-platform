# User Profile - Quick Start Guide

## 🎉 What's Been Implemented

A complete user profile management system with Supabase integration!

## ✨ Features

### For Users
- ✅ **View Profile** - Auto-loads your data
- ✅ **Edit Name & Email** - Update basic info
- ✅ **Upload Profile Picture** - With preview and validation
- ✅ **Change Password** - Secure password updates
- ✅ **Activity Stats** - See your projects, favourites, comments
- ✅ **Auto-save** - Updates sync to database and localStorage

## 📁 Files Created

### Backend (`app/lib/`)
- `userProfile.ts` - All profile-related functions

### Components (`app/components/profile/`)
- `ProfilePictureUpload.tsx` - Reusable photo uploader
- `PasswordChangeForm.tsx` - Reusable password changer
- `ProfileStats.tsx` - Reusable stats display

### Updated
- `ProfilePage.tsx` - Fully integrated with Supabase

## 🚀 How to Use

### Access Profile Page
```
Navigate to: /profile
Or click "Profile" button in any dashboard
```

### Update Your Name/Email
1. Edit the fields
2. Click "Save Changes"
3. ✅ Done! Changes saved to database

### Upload Profile Picture
1. Click "Upload Photo"
2. Select image (PNG/JPG, max 5MB)
3. ✅ Auto-uploaded!

### Change Password
1. Scroll to "Change Password" section
2. Enter current password
3. Enter new password (min 6 chars)
4. Confirm new password
5. Click "Change Password"
6. ✅ Password updated!

## 🔧 Quick API Reference

### Fetch Profile
```typescript
import { fetchUserProfile } from "@/app/lib/userProfile";
const profile = await fetchUserProfile(userId);
```

### Update Profile
```typescript
import { updateUserProfile } from "@/app/lib/userProfile";
await updateUserProfile(userId, {
  full_name: "New Name",
  email: "new@email.com"
});
```

### Change Password
```typescript
await updateUserProfile(userId, {
  current_password: "old123",
  new_password: "new456"
});
```

### Upload Photo
```typescript
import { uploadUserProfilePicture } from "@/app/lib/userProfile";
const url = await uploadUserProfilePicture(userId, fileObject);
```

### Get Stats
```typescript
import { getUserStatistics } from "@/app/lib/userProfile";
const stats = await getUserStatistics(userId);
// Returns: { projects: 5, favourites: 12, comments: 8 }
```

## 🎨 Reusable Components

### ProfilePictureUpload
```typescript
<ProfilePictureUpload
  currentPhotoUrl={user.photo_url}
  onUpload={handleUpload}
  onDelete={handleDelete}
/>
```

### PasswordChangeForm
```typescript
<PasswordChangeForm onSubmit={handlePasswordChange} />
```

### ProfileStats
```typescript
<ProfileStats stats={{ projects: 5, favourites: 12, comments: 8 }} />
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ Current password verification
- ✅ Email uniqueness check
- ✅ File type/size validation
- ✅ Authentication required
- ✅ Auto-redirect if not logged in

## ⚙️ Configuration

### Supabase Storage Setup
**Important**: Create a storage bucket for profile pictures:

1. Go to Supabase Dashboard
2. Navigate to Storage
3. Create bucket named: `avatars`
4. Set public access policy

### Update Role IDs (if needed)
In `app/lib/userProfile.ts`, role IDs should match your database:
```typescript
// Your user_roles table should have:
// 1 = user
// 2 = creator
// 3 = admin (if exists)
```

## 📊 Data Flow

```
User Login → Load Profile → Edit Info → Save → Update DB + localStorage
```

## 🧪 Testing Checklist

- [ ] Visit `/profile` - Should auto-load your data
- [ ] Update name - Should save successfully
- [ ] Update email - Should save successfully
- [ ] Upload photo - Should show preview and save
- [ ] Delete photo - Should remove photo
- [ ] Change password - Should work and allow re-login
- [ ] View stats - Should show correct counts
- [ ] Click back button - Should return to dashboard

## ❗ Common Issues

### Profile doesn't load?
→ Make sure you're logged in. Check localStorage for `currentUser`

### Email update fails?
→ Email might already be taken by another user

### Photo upload fails?
→ Check file size (<5MB) and type (PNG/JPG only)
→ Verify Supabase Storage bucket `avatars` exists

### Password change fails?
→ Verify current password is correct
→ New password must be at least 6 characters

## 💡 Pro Tips

1. **Auto-sync**: All changes automatically sync to localStorage
2. **Back navigation**: Use the back button to return to your dashboard
3. **Stats update**: Activity stats refresh on each page load
4. **Form validation**: All fields are validated before saving

## 🎯 Next Steps

### Optional Enhancements
- Add email verification for email changes
- Add profile bio/description field
- Add social media links
- Add account deletion option
- Add privacy settings
- Add activity history log

## 📖 Full Documentation

See `USER_PROFILE_INTEGRATION.md` for complete technical documentation.

---

**Everything is ready to use!** Just login and visit `/profile` 🎉
