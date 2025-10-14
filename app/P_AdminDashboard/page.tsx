"use client";

import Link from "next/link";
import { useState } from "react";
import "./style.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("requests");
  
  // Sample user request data
  const requests = [
    {
      id: 1,
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      role: "Creator",
      requestedDate: "March 20, 2024"
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      role: "Client",
      requestedDate: "March 22, 2024"
    },
    {
      id: 3,
      name: "Anita Desai",
      email: "anita.desai@email.com",
      role: "Creator",
      requestedDate: "March 25, 2024"
    },
    {
      id: 4,
      name: "Meera Patel",
      email: "meera.patel@email.com",
      role: "Client",
      requestedDate: "March 26, 2024"
    }
  ];

  // Sample users data
  const users = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      role: "Client",
      status: "Active",
      projects: 12,
      functions: 45,
      initials: "SJ"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@email.com",
      role: "Creator",
      status: "Active",
      projects: 8,
      functions: 32,
      initials: "MC"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      role: "Client",
      status: "Inactive",
      projects: 5,
      functions: 18,
      initials: "ER"
    }
  ];

  // Sample categories data
  const categories = [
    { id: 1, name: "Wedding Ceremony", description: "Ceremonial events and decorations", functions: 24 },
    { id: 2, name: "Corporate Events", description: "Business meetings and conferences", functions: 18 },
    { id: 3, name: "Birthday Parties", description: "Celebration events for birthdays", functions: 31 },
    { id: 4, name: "Art Exhibitions", description: "Gallery and museum displays", functions: 12 }
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

      {/* Header with title */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
      </div>

      {/* Navigation tabs */}
      <div className="nav-tabs">
        <button 
          onClick={() => setActiveTab("requests")} 
          className={`nav-tab ${activeTab === "requests" ? "active" : ""}`}
        >
          <svg className="nav-tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Requests
        </button>
        <button 
          onClick={() => setActiveTab("users")} 
          className={`nav-tab ${activeTab === "users" ? "active" : ""}`}
        >
          <svg className="nav-tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Users
        </button>
        <button 
          onClick={() => setActiveTab("reports")} 
          className={`nav-tab ${activeTab === "reports" ? "active" : ""}`}
        >
          <svg className="nav-tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Reports
        </button>
        <button 
          onClick={() => setActiveTab("categories")} 
          className={`nav-tab ${activeTab === "categories" ? "active" : ""}`}
        >
          <svg className="nav-tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Categories
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "requests" && (
        <div className="content-container">
          <div className="content-header">
            <h2 className="content-title">Pending Account Requests</h2>
            
            <div className="dropdown-container">
              <select className="dropdown-select">
                <option>All Requests</option>
                <option>Creator Requests</option>
                <option>Client Requests</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <div className="table-row table-header">
              <div className="table-cell">Name</div>
              <div className="table-cell">Email</div>
              <div className="table-cell">Role</div>
              <div className="table-cell">Requested Date</div>
              <div className="table-cell">Actions</div>
            </div>
            
            {requests.map(request => (
              <div key={request.id} className="table-row">
                <div className="table-cell">{request.name}</div>
                <div className="table-cell">{request.email}</div>
                <div className="table-cell">
                  <span className={`role-badge ${request.role.toLowerCase()}`}>
                    {request.role}
                  </span>
                </div>
                <div className="table-cell">{request.requestedDate}</div>
                <div className="table-cell actions">
                  <button className="action-button approve">Approve</button>
                  <button className="action-button reject">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="content-container">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-avatar-container">
                <div className="user-avatar">{user.initials}</div>
              </div>
              <div className="user-info">
                <h3 className="user-name">{user.name}</h3>
                <p className="user-email">{user.email}</p>
                <div className="user-tags">
                  <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span>
                </div>
              </div>
              <div className="user-stats">
                <p>Projects: {user.projects}</p>
                <p>Functions: {user.functions}</p>
              </div>
              <div className="user-actions">
                <button className="chevron-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "reports" && (
        <div className="content-container">
          <h2 className="content-title">Generate Reports</h2>
          
          <div className="report-form">
            <div className="date-range">
              <div className="date-field">
                <label>Start Date</label>
                <input type="text" placeholder="mm/dd/yyyy" className="date-input" />
              </div>
              <div className="date-field">
                <label>End Date</label>
                <input type="text" placeholder="mm/dd/yyyy" className="date-input" />
              </div>
            </div>
            
            <div className="report-types">
              <h3>Report Types</h3>
              <div className="checkbox-grid">
                <div className="checkbox-item">
                  <input type="checkbox" id="userActivity" />
                  <label htmlFor="userActivity">User Activity</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" id="projectStats" />
                  <label htmlFor="projectStats">Project Statistics</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" id="functionAnalytics" />
                  <label htmlFor="functionAnalytics">Function Analytics</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" id="systemPerformance" />
                  <label htmlFor="systemPerformance">System Performance</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" id="revenueReports" />
                  <label htmlFor="revenueReports">Revenue Reports</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" id="userRegistrations" />
                  <label htmlFor="userRegistrations">User Registrations</label>
                </div>
              </div>
            </div>
            
            <button className="generate-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Generate Excel Report
            </button>
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="content-container">
          <h2 className="content-title">Function Categories</h2>
          
          <div className="category-form">
            <input type="text" placeholder="Add new category..." className="category-input" />
            <button className="add-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Category
            </button>
          </div>
          
          <div className="category-list">
            {categories.map(category => (
              <div key={category.id} className="category-item">
                <div className="category-content">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  <p className="category-functions">{category.functions} functions</p>
                </div>
                <div className="category-actions">
                  <button className="icon-button edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                  <button className="icon-button delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}