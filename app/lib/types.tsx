// --- TYPE DEFINITIONS ---
// This file defines the "shape" of your data.

export interface Model {
  id: string;
  name: string;
  category: string;
  version: string; // Current/Latest version
  status: string;
  thumbnailUrl: string; // The specific thumbnail for the current/latest version
  versions: string[];
  versionThumbnails?: Record<string, string>; // NEW: Map "1.0" -> "url.jpg"
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  modelCount: number;
  lastUpdated: string;
  status: string;
  models: Model[];
  clientIds?: number[];
}
