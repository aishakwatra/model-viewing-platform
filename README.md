# 3D Model Viewer Platform
A collaboration platform designed to bridge the gap between 3D Creators and Clients. This application allows creators to manage projects and showcase 3D assets, clients to review and interact with assigned models, and admins to oversee the entire ecosystem.

## 1. Admin Role

### User Management
- Administrators can access a dedicated interface to review pending sign-up requests and explicitly approve or reject new user accounts.
- The system allows admins to manage the entire user base by assigning or updating specific Creator and Client roles to ensure appropriate access levels.

### Project Oversight
- Admins possess a global view of the platform that lists every project created by any user, providing total visibility into platform activity.
- The dashboard includes tools to manually add, remove, or edit the specific clients assigned to a creator's project, facilitating seamless collaboration management.

### Category Management
- Create, read, and delete model categories (e.g., Wedding, Reception) to keep the platform organized.
- The system enforces data integrity by preventing the deletion of any category that is currently associated with an active model.
  
### Reporting System
- The platform generates comprehensive Excel reports using exceljs that aggregate key performance metrics.
- Metrics: Reports include:
  - Project & model counts per creator
  - A leaderboard of most favourited projects
  - Active client statistics

## 2. Creator Role

### Project Management
- Preators can initialize new projects by defining a project name, setting an event start date, and selecting specific clients for exclusive access.
- The system allows creators to edit existing project details or permanently delete projects, with built-in cascade warnings to alert them that all associated models and files will also be removed.

### 3D Model Management
- Creators can upload complex 3D assets by selecting a complete folder containing .gltf, .bin, and texture files, with a strict file size limit of 200MB per upload to ensure performance.
- The platform supports uploading up to 4 reference snapshots per model version, with a 10MB size limit per image, and allows the creator to click and select any uploaded image as the cover thumbnail.
- Creators can maintain a history of their work by uploading new versions to existing models, which are automatically tracked and ordered by the system.
- Permissions can be managed at a granular level, allowing creators to toggle a "Download Enabled" status for specific versions that grants clients access to the source files.
- Models can be updated with status tags such as "In Revision" or "Approved," and creators can modify metadata or replace the 3D source files for any version at any time.

### Portfolio Creation
- Creators can generate public-facing Portfolio Pages to showcase their best work to prospective clients.
- The system provides curation tools that allow creators to select specific "Approved" models to display on these portfolios while keeping other drafts private.

### View Model
- Creators access the unified ModelViewerPage to inspect assets and review feedback
- The Creator's view is streamlined for management; specifically, the "Favourite" button is hidden from their interface to distinguish their role from that of a consumer
- Engage with client feedback via the comments section.

## 3. Client (User) Role

### Dashboard Navigation
- Clients can browse the Explore Tab to view a directory of Creators and access their public, curated Portfolio Pages.
- The Projects Tab provides a filtered view of only the specific projects assigned to the client, along with all the models contained within them.
- Clients can use the Favourites Tab to quickly access a personalized carousel of model versions they have previously "starred" for easy reference.

### Interactive Viewing
- Clients utilize the same interactive 3D canvas as creators, supporting full orbit, zoom, and pan controls to inspect model details
- The interface conditionally renders a "Favourite" button exclusively for clients, allowing them to add specific versions to their personal collection
- Download reference snapshots or full 3D assets (ZIP), if enabled by the creator.
- Clients can use a dropdown menu to seamlessly switch between different versions of a model to compare changes over time

### Feedback & Organization
- Clients can leave feedback/comments on specific model versions, which are timestamped and logged for the creator to review.
- The commenting system allows clients to delete their own comments if necessary

  
## 4. Shared / General Features

### Secure Authentication
- The application uses secure authentication practices, routing users to their specific dashboard (Admin, Creator, or Client) immediately upon login based on their assigned role.
- Passwords are hashed using bcrypt for security before being stored in the database.

### Profile Management
- All users have access to a profile settings page where they can update their full name, email address, and profile picture.
- The system allows users to securely change their password and manage their personal account details.

### Activity Stats
- Dashboard widgets showing:
  - Total assigned projects to them
  - Favourites count
  - Comment count


## Database Setup

### 1. Run SQL Script
Run the provided SQL script to initialize the tables, buckets, and lookup data.
* Script Name: [`GenerateDatabase.sql`](./GenerateDatabase.sql)

### 2. Set Policies for Storage Buckets (Manual Setup)
*Note: Since storage policies require system-level permissions, these must be set via the Supabase Dashboard UI.*

1.  Click the **Storage** tab (Folder icon) in the left sidebar.
2.  Under the **Manage** section in the side menu, click **Files**.
3.  At the top of the page (under the "Files" title), click the **Policies** tab.
4.  You will see `Models` and `Model Images` listed. Click the **New policy** button on the right side for the **Models** bucket.
5.  Select **Full customization**.
6.  **Policy Name:** Enter a name (e.g., `Full access to models for anon and authenticated`).
7.  **Allowed Operations:** Check **ALL** four boxes:
    * [x] `SELECT`
    * [x] `INSERT`
    * [x] `UPDATE`
    * [x] `DELETE`
8.  **Target Roles:** Check both:
    * [x] `Anon`
    * [x] `Authenticated`
9.  Click **Review** and then **Save Policy**.
10. **Repeat steps 4-9** for the `Model Images` bucket.


------------------------------------------

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
