# Platform Features Overview

This document outlines the core functionality of the platform, categorized by role: Admin, Creator, and Client, along with shared platform-wide features.

## 1. Admin Role

### User Management
- Sign-up Review: Review a list of pending account requests with the ability to approve or reject new users instantly.
- Role Management: Oversee the user base, managing Creator and Client roles to ensure secure access control.

### Project Oversight
- Global View: Access a master list of all projects across the platform regardless of the creator.
- User Assignment: Manually add, remove, or edit the specific clients assigned to any creator’s project.

### Category Management
- Create, read, and delete model categories (e.g., Wedding, Reception) to keep the platform organized.
- Integrity Checks: Smart deletion prevents removing categories that are currently attached to active models.

### Reporting System
- Excel Exports: Generate and download detailed spreadsheets containing platform analytics.
- Metrics: Reports include:
  - Project & model counts per creator
  - A leaderboard of most favourited projects
  - Active client statistics

## 2. Creator Role

### Project Management
- Project Controls: Create new projects with defined event start dates and assign relevant clients for access.
- Access Management: Edit project details or delete entire projects, with built-in cascade warnings if models are attached.

### 3D Model Management
- Full Asset Upload: Support for uploading complete 3D folders that must contain .gltf, .bin, and texture files.
- Snapshot Management: Upload multiple 2D reference images and manually select a cover thumbnail for the model card.
- Versioning System: Upload new versions of existing models to track progress without losing history.
- Download Permissions: Toggle the “Download Enabled” status for specific versions, granting clients permission to download source 3D assets (ZIP).
- Editing & Status: Edit model metadata, replace 3D source files, and update model status (In Revision, Awaiting Client Review, Approved, Discontinued).

### Portfolio Creation
- Public Showcases: Create curated portfolio pages to showcase work to potential clients.
- Curation: Select specific Approved models to display on these public-facing pages.

### View Model
- Inspect models using the integrated 3D viewer (Pan, Zoom, Orbit controls).
- Engage with client feedback via the comments section.

## 3. Client (User) Role

### Dashboard Navigation
- Explore Tab: Browse a directory of creators and view their public curated portfolio pages.
- Projects Tab: Access assigned projects and view all contained models.
- Favourites Tab: Quickly access a personal collection of starred model versions via a dedicated carousel.

### Interactive Viewing
- Full 3D interaction: orbit, zoom, and pan the model view.
- Switch between different versions of a model to see progress.
- Downloads: Download reference snapshots or full 3D assets (ZIP), if enabled by the creator.

### Feedback & Organization
- Comments: Leave feedback on specific model versions, timestamped for clarity.
- Favourites: Star specific models to save them to the Favourites tab for quick reference

  
## 4. Shared / General Features

### Secure Authentication
- Full sign-up and login flows with password encryption and automatic routing based on role (Admin / Creator / Client).

### Profile Management
- Update profile photos, full names, emails, and change passwords securely.

### Activity Stats
- Dashboard widgets showing:
  - Total assigned projects
  - Favourites count
  - Comment activity



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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
