# Authentication Quick Start Guide

## 🚀 What's Been Implemented

### Core Features
- ✅ User registration with role selection (User/Creator)
- ✅ User login with email & password
- ✅ Password hashing with bcrypt
- ✅ Session management via localStorage
- ✅ Protected routes
- ✅ Logout functionality
- ✅ Profile picture upload support
- ✅ Form validation

## 📁 File Structure

```
app/
├── lib/
│   ├── auth.ts                 # Core auth functions
│   └── validation.ts           # Form validation utilities
└── components/
    └── auth/
        ├── LoginForm.tsx       # Login form with logic
        ├── RegisterForm.tsx    # Registration form with logic
        ├── AuthProvider.tsx    # Global auth state
        ├── ProtectedRoute.tsx  # Route protection
        ├── LogoutButton.tsx    # Reusable logout button
        └── PasswordStrength.tsx # Password strength indicator
```

## 🎯 Quick Usage

### 1. Using the Auth Forms
They're already integrated in `/auth` page - no additional work needed!

### 2. Protect a Page
```tsx
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";

export default function MyPage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}
```

### 3. Add Logout Button
```tsx
import { LogoutButton } from "@/app/components/auth/LogoutButton";

<LogoutButton variant="brown" />
```

### 4. Get Current User
```tsx
import { getCurrentUser } from "@/app/lib/auth";

const user = getCurrentUser();
console.log(user?.email, user?.full_name);
```

### 5. Check if Authenticated
```tsx
import { isAuthenticated, getUserRole } from "@/app/lib/auth";

if (isAuthenticated()) {
  const role = getUserRole(); // "user" or "creator"
}
```

## 🔧 Configuration

### Role IDs (in database)
Update these in `app/lib/auth.ts` if your database uses different IDs:
```typescript
const ROLE_IDS = {
  user: 1,      // Regular user/client
  creator: 2,   // Creator
  admin: 3,     // Admin (if exists)
};
```

### Redirect Paths
After login, users are redirected based on role:
- Creators → `/dashboard`
- Users → `/P_ClientDashboard`

Change these in `LoginForm.tsx` and `RegisterForm.tsx` if needed.

## 🧪 Testing

### Create Test User
1. Go to `/auth`
2. Click "Register"
3. Fill form and submit
4. Should redirect automatically

### Test Login
1. Go to `/auth`
2. Enter credentials
3. Should redirect based on role

## ⚠️ Important Notes

### Before Deployment
1. **Install dependencies**:
   ```bash
   npm install bcryptjs @types/bcryptjs
   ```

2. **Database Setup**: Ensure your `user_roles` table has these entries:
   ```sql
   INSERT INTO user_roles (id, role) VALUES
     (1, 'user'),
     (2, 'creator'),
     (3, 'admin');
   ```

3. **Storage Setup** (if using profile pictures):
   - Create a bucket named `profile-pictures` in Supabase Storage
   - Set appropriate permissions

### Security Notes
- Passwords are hashed with bcrypt (10 rounds)
- User sessions stored in localStorage (consider upgrading to httpOnly cookies)
- No automatic session expiration (implement if needed)

## 🎨 Components Available

### Authentication Components
- `<LoginForm />` - Full login form with logic
- `<RegisterForm />` - Full registration form with logic
- `<LogoutButton />` - Customizable logout button
- `<PasswordStrength />` - Password strength indicator
- `<ProtectedRoute />` - Wrap pages that need auth
- `<AuthProvider />` - Global auth context (optional)

### Functions Available
- `signUp(userData, role)` - Register new user
- `signIn(email, password)` - Login user
- `logout()` - Clear session
- `getCurrentUser()` - Get logged-in user
- `saveCurrentUser(user)` - Save user to storage
- `isAuthenticated()` - Check if logged in
- `getUserRole()` - Get user's role
- `uploadProfilePicture(file, userId)` - Upload profile pic

### Validation Functions
- `validateEmail(email)`
- `validatePassword(password)`
- `validateFullName(name)`
- `validateFile(file, options)`
- `getPasswordStrength(password)`

## 🔄 Integration Examples

### Auto-Login User in Dashboard
```tsx
"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/auth";

export default function Dashboard() {
  const [userId, setUserId] = useState<number | null>(null);
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.user_id);
      // Now fetch user's data
    }
  }, []);
  
  return <div>User ID: {userId}</div>;
}
```

### Show Content Based on Role
```tsx
import { getUserRole } from "@/app/lib/auth";

export function RoleBasedContent() {
  const role = getUserRole();
  
  return (
    <div>
      {role === "creator" && <CreatorTools />}
      {role === "user" && <UserDashboard />}
      {!role && <LoginPrompt />}
    </div>
  );
}
```

### Protected Creator-Only Page
```tsx
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";

export default function CreatorDashboard() {
  return (
    <ProtectedRoute requireRole="creator">
      <div>Creator-only content</div>
    </ProtectedRoute>
  );
}
```

## 📚 Full Documentation
See `AUTH_INTEGRATION.md` for complete documentation including:
- Detailed API reference
- Security considerations
- Database schema
- Advanced usage patterns
- Future enhancement suggestions
