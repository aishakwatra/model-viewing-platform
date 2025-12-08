// --- TYPE DEFINITIONS ---
// This file defines the "shape" of your data.

export interface Model {
  id: string;
  name: string;
  category: string;
  version: string;
  status: string;
  thumbnailUrl: string;
  versions: string[];
  versionThumbnails?: Record<string, string>;
  versionIds?: Record<string, number>; 
  versionDownloadStatus?: Record<string, boolean>; 
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
