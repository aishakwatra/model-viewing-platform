# Migration Summary: Switch from auth_user_id to user_id for Data Queries

## Overview
This migration refactors the codebase to use `user_id` (integer) instead of `auth_user_id` (UUID) for all data queries. This change reduces storage space and improves query performance.

## Rationale
- **Space Efficiency**: UUIDs (36 characters) take up significantly more space than integers
- **Performance**: Integer comparisons and joins are faster than UUID operations
- **Clarity**: `auth_user_id` is now only used for linking the users table to Supabase Auth

## Changes Made

### 1. Library Files Updated

#### `app/lib/clientData.ts`
- ✅ `fetchUserProjects()`: Changed parameter from `authUserId: string` to `userId: number`
  - Query now uses `.eq("user_id", userId)` instead of `.eq("auth_user_id", authUserId)`
- ✅ `fetchUserFavourites()`: Changed parameter from `authUserId: string` to `userId: number`
  - Query now uses `.eq("user_id", userId)` instead of `.eq("auth_user_id", authUserId)`
- ✅ `toggleFavourite()`: Changed parameter from `authUserId: string` to `userId: number`
  - All queries now use `user_id` instead of `auth_user_id`
  - Insert statement changed to use `{ user_id: userId, ... }`

#### `app/lib/userProfile.ts`
- ✅ `UserProfile` interface: Added `user_id: number` field
- ✅ `fetchUserProfile()`: Now includes `user_id` in SELECT query
- ✅ `getUserStatistics()`: Changed parameter from `authUserId: string` to `userId: number`
  - All count queries now use `.eq("user_id", userId)`

#### `app/lib/auth.ts`
- ✅ `signIn()`: Added `user_id` to SELECT query and added `is_approved` check
- ✅ `getCurrentAuthUser()`: Added `user_id` and `is_approved` to SELECT query
- ✅ Both functions now return user objects with `user_id` field

### 2. Component Files Updated

#### `app/P_ClientDashboard/page.tsx`
- ✅ Changed state from `currentAuthUserId` to `currentUserId`
- ✅ Updated `initializeDashboard()` to use `user.user_id`
- ✅ Updated `loadUserData()` parameter from `authUserId: string` to `userId: number`
- ✅ Function calls now pass `user.user_id` instead of `user.auth_user_id`

#### `app/components/UserSelector.tsx`
- ✅ Changed props from `currentAuthUserId: string | null` to `currentUserId: number | null`
- ✅ Changed `onUserSelect` callback signature from `(authUserId: string)` to `(userId: number)`
- ✅ Updated user matching to use `user.user_id` instead of `user.auth_user_id`
- ✅ Updated button keys and comparisons to use `user_id`

#### `app/components/dashboard/ProfilePage.tsx`
- ✅ Updated `getUserStatistics()` call to use `user.user_id` instead of `user.auth_user_id`

#### `app/components/auth/AuthProvider.tsx`
- ✅ Updated `User` interface to include `user_id: number` and `is_approved?: boolean`

### 3. Database Changes

#### SQL Migration Script: `SQL_info/migration_remove_auth_user_id.sql`
This script removes the `auth_user_id` column from tables where it's no longer needed:

- ✅ `project_clients` - Removed auth_user_id (uses user_id for linking)
- ✅ `projects` - Removed auth_user_id (uses creator_id which references user_id)
- ✅ `user_favourites` - Removed auth_user_id (uses user_id for linking)
- ✅ `comments` - Removed auth_user_id (uses user_id for linking)
- ✅ `model_logs` - Removed auth_user_id (uses user_id for linking)
- ✅ `portfolio_pages` - Removed auth_user_id (uses creator_id which references user_id)

#### `users` table
- ✅ **KEPT** `auth_user_id` - This is the ONLY table that retains this column
- Purpose: Links to Supabase Auth user table (auth.users)

## Tables Summary

### Tables with auth_user_id REMOVED:
1. `project_clients` - Use `user_id`
2. `projects` - Use `creator_id` (references `users.user_id`)
3. `user_favourites` - Use `user_id`
4. `comments` - Use `user_id`
5. `model_logs` - Use `user_id`
6. `portfolio_pages` - Use `creator_id` (references `users.user_id`)

### Table with auth_user_id KEPT:
1. `users` - **ONLY** table that needs `auth_user_id` to link to Supabase Auth

## Deployment Steps

1. **Code Deployment**: Deploy updated application code
2. **Test**: Verify all functionality works with integer user_id
3. **Database Migration**: Run `migration_remove_auth_user_id.sql` in production
4. **Verification**: Run verification queries to ensure columns are dropped

## Rollback Plan

If issues occur:
1. Restore database from backup
2. Revert code changes to previous commit
3. Investigate issues before retrying

## Testing Checklist

- [ ] User login and authentication
- [ ] Project listing for clients
- [ ] Favourites functionality
- [ ] User profile display and updates
- [ ] User statistics (projects, favourites, comments counts)
- [ ] Comment creation and display
- [ ] Model logs
- [ ] Portfolio pages

## Benefits

1. **Storage Savings**: ~28 bytes saved per record (UUID vs INT)
2. **Performance**: Faster integer comparisons and joins
3. **Simplicity**: Clear separation - auth_user_id only for auth linking
4. **Scalability**: Better indexing and query performance at scale

## Files Modified

### Library Files (3)
- `app/lib/clientData.ts`
- `app/lib/userProfile.ts`
- `app/lib/auth.ts`

### Component Files (4)
- `app/P_ClientDashboard/page.tsx`
- `app/components/UserSelector.tsx`
- `app/components/dashboard/ProfilePage.tsx`
- `app/components/auth/AuthProvider.tsx`

### SQL Files (1)
- `SQL_info/migration_remove_auth_user_id.sql` (new)

## Migration Status
✅ All code changes completed
✅ No linter errors
⏳ Database migration pending (run SQL script manually)

## Notes
- The `users` table still contains both `user_id` and `auth_user_id`
- `auth_user_id` in users table is essential for Supabase Auth integration
- All other tables now rely solely on integer `user_id` for relationships
