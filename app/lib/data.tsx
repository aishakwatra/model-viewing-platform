import { Project } from './types';

export const projectsData: Project[] = [
  {
    id: "proj-a",
    name: "Project A",
    startDate: "2024-03-15",
    modelCount: 3,
    lastUpdated: "2 days ago",
    status: "Complete",
    models: [
      {
        id: "model-1",
        name: "Mandap Design",
        category: "Wedding Ceremony",
        version: "2.1",
        status: "Released for Download",
        thumbnailUrl: "/sangeet-stage.png",
        versions: ["2.1", "2.0", "1.9"],
      },
      {
        id: "model-2",
        name: "Reception Centerpiece",
        category: "Reception",
        version: "1.8",
        status: "Approved",
        thumbnailUrl: "/sangeet-stage.png",
        versions: ["1.8", "1.7"],
      },
      {
        id: "model-3",
        name: "Sangeet Stage Decor",
        category: "Sangeet",
        version: "1.2",
        status: "Under Revision",
        thumbnailUrl: "/sangeet-stage.png",
        versions: ["1.2", "1.1", "1.0"],
      },
    ],
  },
  {
    id: "proj-b",
    name: "Project B",
    startDate: "April 20, 2024",
    modelCount: 2,
    lastUpdated: "1 week ago",
    status: "In Progress",
    models: [
      {
        id: "model-4",
        name: "Haldi Seating Arrangement",
        category: "Haldi",
        version: "1.0",
        status: "Awaiting Review",
        thumbnailUrl: "/sangeet-stage.png",
        versions: ["1.0"],
      },
      {
        id: "model-5",
        name: "Wedding Aisle Decor",
        category: "Wedding Ceremony",
        version: "1.5",
        status: "Approved",
        thumbnailUrl: "/sangeet-stage.png",
        versions: ["1.5", "1.4", "1.3", "1.2", "1.1"],
      },
    ],
  },
  {
    id: "proj-c",
    name: "Project C",
    startDate: "2024-04-20",
    modelCount: 1, 
    lastUpdated: "3 days ago",
    status: "Complete",
    models: [
      {
        id: "model-6",
        name: "Mehendi Lounge Setup",
        category: "Mehendi",
        version: "2.0",
        status: "Released for Download",
        thumbnailUrl: "sangeet-stage.png",
        versions: ["2.0", "1.9", "1.8"],
      },
    ],
  },
];

export const filterTabs = [
  "All Projects",
  "Wedding Ceremony",
  "Reception",
  "Sangeet",
  "Mehendi",
  "Haldi",
];

