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
