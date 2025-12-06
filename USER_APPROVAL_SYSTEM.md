# User Approval System Implementation

## Overview
This document describes the user approval system that handles different user states: new users, pending approval, approved, and rejected users.

## User States

### 1. **New User** (Not Found)
- Email doesn't exist in the `users` table
- User has just created an account or hasn't registered yet
- **Action**: Allow registration with the "Create Account" button

### 2. **Pending/Unapproved User** (`is_approved = false`)
- Email exists in `users` table with `is_approved = false`
- User has registered but admin hasn't approved yet
- **Sign In**: Shows message "Your account is pending approval. Please wait for an administrator to approve your account before signing in."
- **Register**: Shows message "Your account is awaiting approval. Please wait for an administrator to review your account before attempting to sign in."
- **Access**: Cannot access any protected pages

### 3. **Approved User** (`is_approved = true`)
- Email exists in `users` table with `is_approved = true`
- User has been approved by admin
- **Action**: Can sign in and access pages based on their role

### 4. **Rejected User** (Auth exists, but not in users table)
- User was deleted from `users` table by admin (rejected)
- May still exist in Supabase Auth
- **Sign In**: After attempting sign in, if auth succeeds but user not found in users table, shows "Your account has been rejected by an administrator. Please contact support if you believe this is an error."
- **Register**: If trying to register with same email, shows "Your previous account was rejected. Please contact support if you believe this is an error."

## Implementation Details

### Files Modified

#### 1. `app/lib/auth.ts`
**New Function**: `checkUserApprovalStatus(email)`
- Checks if email exists in users table
- Returns user approval status: 'approved', 'pending', or 'not_found'

**Updated**: `signIn(email, password)`
- Checks approval status before attempting sign in
- Shows specific error messages for pending users
- Detects rejected users (auth exists but no user profile)
- Prevents unapproved users from signing in

**Updated**: `signUp(userData, role)`
- Checks if email already exists before creating account
- Shows appropriate error messages:
  - If pending: "Your account is pending approval..."
  - If approved: "An account with this email already exists..."
  - If rejected (auth signup fails): "Your previous account was rejected..."

#### 2. `app/lib/admin.ts`
**Updated**: `rejectUser(userId)`
- Deletes user from `users` table
- Attempts to delete user from Supabase Auth (if admin privileges available)
- Note: Even if auth deletion fails, user is effectively rejected since they're removed from users table

#### 3. `app/components/auth/LoginForm.tsx`
- Updated error handling to show user-friendly messages
- Differentiates between pending and rejected account errors

#### 4. `app/components/auth/RegisterForm.tsx`
- Updated error handling to show specific messages for:
  - Pending approval state
  - Rejected account
  - Existing account

#### 5. `middleware.ts` (NEW)
- Server-side middleware to protect routes
- Redirects unauthenticated users to `/auth` page
- Checks for Supabase auth cookies

#### 6. `app/hooks/useProtectedRoute.ts` (NEW)
- Client-side hook to protect routes
- Checks user authentication and approval status
- Redirects to `/auth` if:
  - User is not logged in
  - User is not approved (`is_approved = false`)

#### 7. `app/page.tsx`
- Updated root page to redirect unauthenticated users to `/auth`
- Uses `useAuth` hook to check user status

## User Flow

### Registration Flow
```
User enters email/password
↓
Check if email exists in users table
↓
├─ Exists & Pending → Show "awaiting approval" error
├─ Exists & Approved → Show "account exists" error
├─ Auth signup fails (rejected) → Show "account rejected" error
└─ Not exists → Create account with is_approved=false
   ↓
   Show success modal: "Please wait for admin approval"
```

### Login Flow
```
User enters email/password
↓
Check approval status by email
↓
├─ Pending → Show "pending approval" error
├─ Not found → Attempt sign in
│  ↓
│  Auth succeeds but no user profile
│  ↓
│  Show "account rejected" error
└─ Approved → Sign in successfully
   ↓
   Redirect based on role
```

### Route Protection
```
User attempts to access protected page
↓
Middleware checks for auth cookies
↓
├─ No cookies → Redirect to /auth
└─ Has cookies → Allow access
   ↓
   Client-side hook checks user.is_approved
   ↓
   ├─ is_approved = false → Redirect to /auth
   └─ is_approved = true → Allow access
```

## Protected Routes

The following routes are protected and require authentication + approval:
- `/creator/*` - Creator dashboard and related pages
- `/P_AdminDashboard` - Admin dashboard
- `/P_ClientDashboard` - Client dashboard
- `/profile` - User profile
- `/dashboard` - General dashboard
- `/P_Explore` - Model exploration page
- `/P_ModelViewer` - Model viewer
- `/P_AboutUs` - About us page
- `/` - Root page (redirects to auth if not logged in)

## Public Routes

The following routes are accessible without authentication:
- `/auth` - Authentication page (login/register)
- `/api/*` - API routes
- Static assets (images, CSS, JS, fonts)

## Testing Scenarios

### Scenario 1: New User Registration
1. Go to `/auth`
2. Click "Signup here"
3. Fill in details and click "Create Account"
4. Should see success modal: "Please wait for admin approval"
5. Try to sign in → Should see "pending approval" error
6. Try to access `/P_ClientDashboard` directly → Should redirect to `/auth`

### Scenario 2: Admin Approval
1. Admin goes to `/P_AdminDashboard`
2. Views pending users
3. Clicks "Approve" on a user
4. User can now sign in successfully

### Scenario 3: Admin Rejection
1. Admin goes to `/P_AdminDashboard`
2. Views pending users
3. Clicks "Reject" on a user
4. User is deleted from users table (and possibly from auth)
5. If user tries to sign in → Shows "account rejected" error
6. If user tries to register again → Shows "account rejected" error (if auth still exists)

### Scenario 4: Unapproved User Access Attempt
1. User with pending account tries to type URL directly (e.g., `/P_ClientDashboard`)
2. Middleware checks for auth cookies → May allow if cookies exist
3. Client-side hook checks `is_approved` → Redirects to `/auth`
4. Error message shows "pending approval"

## Error Messages Summary

| Scenario | Error Message |
|----------|--------------|
| Sign in with pending account | "Your account is pending approval. Please wait for an administrator to approve your account before signing in." |
| Sign in with rejected account | "Your account has been rejected by an administrator. Please contact support if you believe this is an error." |
| Register with pending account | "Your account is awaiting approval. Please wait for an administrator to review your account before attempting to sign in." |
| Register with approved account | "An account with this email already exists. Please sign in instead." |
| Register with rejected account | "Your previous account was rejected. Please contact support if you believe this is an error." |

## Notes

- The system queries Supabase `users` table by email to check approval status
- Rejected users are identified when auth succeeds but no user profile exists
- The `rejectUser` function attempts to delete from both `users` table and Supabase Auth
- If admin API is not available, rejected users may still exist in auth but won't have access since they're not in the users table
- All protected routes are guarded by both server-side middleware and client-side hooks for maximum security
