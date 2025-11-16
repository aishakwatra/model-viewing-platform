# Authentication Integration Documentation

## Overview
This document explains the authentication system integrated into the application, including signup, login, and session management.

## Files Created

### 1. Authentication Core (`app/lib/auth.ts`)
**Purpose**: Core authentication functions and user management

**Functions**:
- `signUp(userData, role)` - Creates a new user account
  - Validates email uniqueness
  - Hashes password with bcrypt
  - Sets appropriate role (user/creator)
  - Returns success/error with user data
  
- `signIn(email, password)` - Authenticates existing user
  - Validates credentials
  - Verifies password hash
  - Returns user data without password
  
- `getCurrentUser()` - Gets current user from localStorage
- `saveCurrentUser(user)` - Saves user to localStorage
- `logout()` - Clears user session
- `isAuthenticated()` - Checks if user is logged in
- `getUserRole()` - Gets current user's role
- `uploadProfilePicture(file, userId)` - Uploads profile picture to Supabase Storage

### 2. Login Form (`app/components/auth/LoginForm.tsx`)
**Features**:
- Email and password inputs with validation
- Remember me checkbox
- Error handling and display
- Loading states
- Automatic redirect based on user role:
  - Creators → `/dashboard`
  - Users → `/P_ClientDashboard`

### 3. Register Form (`app/components/auth/RegisterForm.tsx`)
**Features**:
- Full name, email, password inputs
- Profile picture upload (optional)
- Role selection (User/Creator)
- Form validation:
  - Required fields check
  - Minimum password length (6 chars)
  - File size validation (max 10MB)
  - File type validation (images only)
- Success/error message display
- Creator account notice (may require approval)

### 4. Auth Provider (`app/components/auth/AuthProvider.tsx`)
**Purpose**: Global authentication state management

**Usage**:
```tsx
import { AuthProvider, useAuth } from "@/app/components/auth/AuthProvider";

// Wrap your app
<AuthProvider>
  {children}
</AuthProvider>

// Use in components
const { user, loading, logout, refreshUser } = useAuth();
```

### 5. Protected Route (`app/components/auth/ProtectedRoute.tsx`)
**Purpose**: Protect pages requiring authentication

**Usage**:
```tsx
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";

// Require any authenticated user
<ProtectedRoute>
  <YourPage />
</ProtectedRoute>

// Require specific role
<ProtectedRoute requireRole="creator">
  <CreatorDashboard />
</ProtectedRoute>

// Custom redirect
<ProtectedRoute redirectTo="/login">
  <YourPage />
</ProtectedRoute>
```

### 6. Logout Button (`app/components/auth/LogoutButton.tsx`)
**Purpose**: Reusable logout button component

**Usage**:
```tsx
import { LogoutButton } from "@/app/components/auth/LogoutButton";

<LogoutButton variant="brown" />
<LogoutButton>Sign Out</LogoutButton>
```

## Database Schema

### Users Table
```sql
CREATE TABLE public.users (
  user_id integer NOT NULL PRIMARY KEY,
  user_role_id integer NOT NULL,
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  full_name character varying,
  photo_url character varying,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
```

### User Roles Table
```sql
CREATE TABLE public.user_roles (
  id integer NOT NULL PRIMARY KEY,
  role character varying NOT NULL UNIQUE
);
```

**Expected Roles**:
- ID 1: "user" (Regular user/client)
- ID 2: "creator" (Content creator)
- ID 3: "admin" (Administrator)

## Authentication Flow

### Sign Up Flow
1. User fills registration form
2. Form validates input (required fields, password length, file size)
3. Optional profile picture is stored
4. `signUp()` function:
   - Checks if email exists
   - Hashes password with bcrypt
   - Creates user in database
   - Returns success with user data
5. User data saved to localStorage
6. Redirect based on role:
   - Creator → `/dashboard`
   - User → `/P_ClientDashboard`

### Sign In Flow
1. User enters email and password
2. `signIn()` function:
   - Fetches user by email
   - Verifies password hash
   - Returns user data (without password)
3. User data saved to localStorage
4. Redirect based on role

### Session Management
- User data stored in `localStorage`
- No automatic expiration (implement if needed)
- Manual logout clears localStorage
- Page refresh retrieves user from localStorage

## Security Considerations

### Current Implementation
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Email uniqueness validation
- ✅ Password minimum length (6 characters)
- ✅ Input sanitization (trim whitespace)
- ✅ File type and size validation

### Recommended Improvements
- 🔧 Implement JWT tokens for better security
- 🔧 Add password strength requirements
- 🔧 Add email verification
- 🔧 Implement password reset functionality
- 🔧 Add rate limiting for login attempts
- 🔧 Use httpOnly cookies instead of localStorage
- 🔧 Add CSRF protection
- 🔧 Implement session expiration
- 🔧 Add two-factor authentication (2FA)

## Usage Examples

### Example 1: Add Logout to Header
```tsx
import { LogoutButton } from "@/app/components/auth/LogoutButton";
import { getCurrentUser } from "@/app/lib/auth";

export function Header() {
  const user = getCurrentUser();
  
  return (
    <header>
      {user && (
        <div>
          <span>Welcome, {user.full_name}</span>
          <LogoutButton />
        </div>
      )}
    </header>
  );
}
```

### Example 2: Protect a Page
```tsx
// app/dashboard/page.tsx
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute requireRole="creator">
      <div>Creator Dashboard Content</div>
    </ProtectedRoute>
  );
}
```

### Example 3: Show Different Content Based on Role
```tsx
"use client";
import { getCurrentUser, getUserRole } from "@/app/lib/auth";

export function ConditionalContent() {
  const role = getUserRole();
  
  if (role === "creator") {
    return <CreatorView />;
  } else if (role === "user") {
    return <UserView />;
  }
  
  return <PublicView />;
}
```

### Example 4: Auto-load User Data on Client Dashboard
```tsx
"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/auth";

export default function ClientDashboard() {
  const [userId, setUserId] = useState<number | null>(null);
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserId(user.user_id);
    }
  }, []);
  
  // Use userId to fetch data...
}
```

## Integration with Existing Pages

### Client Dashboard
The Client Dashboard currently has a `UserSelector` for impersonation. You can:

**Option A**: Keep user selector for testing/admin purposes
**Option B**: Auto-load logged-in user's data
**Option C**: Hybrid - auto-load but allow admins to impersonate

```tsx
// Example hybrid approach
const user = getCurrentUser();
const isAdmin = user?.user_roles?.role === "admin";

// Auto-set user ID if not admin
useEffect(() => {
  if (user && !isAdmin) {
    setCurrentUserId(user.user_id);
  }
}, [user, isAdmin]);

// Only show UserSelector for admins
{isAdmin && <UserSelector ... />}
```

## Environment Variables
No additional environment variables needed. Uses existing Supabase configuration:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Dependencies Added
```json
{
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.6"
}
```

Install with:
```bash
npm install bcryptjs @types/bcryptjs
```

## Testing the Authentication

### Test User Creation
1. Navigate to `/auth`
2. Click "Register" tab
3. Fill in form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Role: User or Creator
4. Click "Create Account"
5. Should redirect to appropriate dashboard

### Test Login
1. Navigate to `/auth`
2. Enter credentials
3. Click "Sign In"
4. Should redirect based on role

### Test Protected Routes
1. Logout
2. Try accessing `/dashboard` directly
3. Should redirect to `/auth`

## Future Enhancements
- Email verification system
- Password reset via email
- Social login (Google, GitHub, etc.)
- Remember me functionality (longer sessions)
- Account activation for creators
- Admin approval workflow for creators
- Profile editing functionality
- Change password feature
- Account deletion
- Login history/audit log
