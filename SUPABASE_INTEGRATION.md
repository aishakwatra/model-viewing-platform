# Supabase Integration for Client Dashboard

## Overview
This document explains the Supabase integration implemented for the Client Dashboard feature.

## Files Created

### 1. `app/lib/supabase.ts`
- **Purpose**: Supabase client initialization and TypeScript type definitions
- **Exports**: 
  - `supabase` - The configured Supabase client
  - Database type interfaces matching the SQL schema

### 2. `app/lib/clientData.ts`
- **Purpose**: Data fetching functions for client dashboard
- **Functions**:
  - `fetchUserProjects(userId)` - Fetches all projects accessible by a user via `project_clients` table
  - `fetchUserFavourites(userId)` - Fetches user's favorite model versions
  - `fetchProjectModels(projectId)` - Fetches all models for a specific project
  - `fetchModelVersions(modelId)` - Fetches all versions of a model
  - `toggleFavourite(userId, modelVersionId)` - Adds/removes a favorite

### 3. `app/components/UserSelector.tsx`
- **Purpose**: Reusable component for user impersonation
- **Features**:
  - Dropdown selector showing all users from the database
  - Displays user name, email, and ID
  - Highlights currently selected user

## Database Schema Usage

### Key Tables
- **users**: Stores user information
- **projects**: Stores project details
- **project_clients**: Links users to projects they can access
- **project_status**: Lookup table for project status
- **models**: Stores 3D models linked to projects
- **model_versions**: Stores different versions of models
- **user_favourites**: Stores user's favorite model versions
- **model_images**: Stores image paths for model versions

### Data Flow
1. User selects their ID via `UserSelector`
2. System queries `project_clients` to find accessible project IDs
3. For each project ID, fetch full project details from `projects`
4. When project is expanded, fetch models from `models` table
5. Favourites are fetched from `user_favourites` joined with `model_versions`

## Page Updates

### `app/P_ClientDashboard/page.tsx`
- Integrated `UserSelector` component in header
- Replaced dummy data with Supabase queries
- Added loading and error states
- Projects now load from database based on selected user
- Favourites now load from database and are grouped by model
- Projects expand to show their models when clicked

## Environment Variables
Ensure `.env` contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## User Impersonation Flow
Since there's no login system yet:
1. User clicks "Select User" button in header
2. Dropdown shows all users from database
3. Selecting a user loads their projects and favourites
4. The selected user's info is displayed in the header

## Future Enhancements
- Add authentication system
- Add ability to toggle favourites from the UI
- Fetch actual model images from storage
- Add pagination for large datasets
- Cache frequently accessed data
- Add real-time updates with Supabase subscriptions

## Component Reusability
All components are designed to be reusable:
- `UserSelector` can be used on any page requiring user selection
- Data fetching functions in `clientData.ts` can be imported anywhere
- Type definitions in `supabase.ts` ensure type safety across the app
