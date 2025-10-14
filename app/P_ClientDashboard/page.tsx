"use client";

import Link from "next/link";
import { useState } from "react";
import "./style.css";

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("projects");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sample project data
  const projects = [
    {
      id: 1,
      name: "Project A",
      created: "March 15, 2024",
      functions: 4,
      lastUpdated: "2 days ago",
      available: true
    },
    {
      id: 2,
      name: "Project B",
      created: "April 20, 2024",
      functions: 3,
      lastUpdated: "1 week ago",
      available: true
    },
    {
      id: 3,
      name: "Project C",
      created: "May 10, 2024",
      functions: 2,
      lastUpdated: "3 days ago",
      available: true
    }
  ];

  // Sample favorites data
  const favorites = [
    {
      id: 1,
      name: "Starry Night Sangeet",
      versions: [
        { id: 1, version: "2.1", added: "2 days ago" },
        { id: 2, version: "2.0", added: "5 days ago" },
        { id: 3, version: "1.5", added: "1 week ago" },
        { id: 4, version: "1.0", added: "2 weeks ago" }
      ]
    },
    {
      id: 2,
      name: "Enchanted Garden Reception",
      versions: [
        { id: 1, version: "2.0", added: "3 days ago" },
        { id: 2, version: "1.8", added: "1 week ago" },
        { id: 3, version: "1.5", added: "2 weeks ago" }
      ]
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Back to Menu Link */}
      <Link href="/" className="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Back to Menu
      </Link>

      {/* Header with user info */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Client Dashboard</h1>
        <div className="user-info">
          <div className="user-details">
            <div className="user-name">Sarah Johnson</div>
            <div className="user-email">sarah.j@email.com</div>
          </div>
          <div className="user-avatar">
            SJ
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="nav-tabs">
        <button 
          onClick={() => setActiveTab("projects")} 
          className={`nav-tab ${activeTab === "projects" ? "active" : "inactive"}`}
        >
          <svg className="nav-tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2Z"/>
          </svg>
          Projects
        </button>
        <button 
          onClick={() => setActiveTab("favourites")} 
          className={`nav-tab ${activeTab === "favourites" ? "active" : "inactive"}`}
        >
          <svg className="nav-tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Favourites
        </button>
      </div>

      {/* Projects Tab Content */}
      {activeTab === "projects" && (
        <>
          {/* Search bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search projects..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-button"
                onClick={() => setSearchTerm("")}
              >
                Clear
              </button>
            )}
          </div>

          {/* Project list */}
          <div className="project-list">
            {projects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-card-content">
                  <div className="project-info">
                    <h2 className="project-name">{project.name}</h2>
                    <p className="project-meta">
                      Created: {project.created} • {project.functions} functions • Last updated {project.lastUpdated}
                    </p>
                  </div>
                  <div className="project-actions">
                    <span className="status-badge">
                      Available
                    </span>
                    <button className="chevron-button">
                      <svg className="chevron-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Favourites Tab Content */}
      {activeTab === "favourites" && (
        <div className="favorites-container">
          {favorites.map(favorite => (
            <div key={favorite.id} className="project-card favorite-card">
              <div className="favorite-header">
                <h2 className="project-name">{favorite.name}</h2>
                <button className="chevron-button">
                  <svg className="chevron-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
              <p className="project-meta">{favorite.versions.length} function versions</p>
              
              <div className="version-grid">
                {favorite.versions.map(version => (
                  <div key={version.id} className="version-card">
                    <div className="version-image">
                      <div className="placeholder-image">Image</div>
                    </div>
                    <div className="version-info">
                      <p className="version-number">Version {version.version}</p>
                      <p className="version-date">Added {version.added}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}