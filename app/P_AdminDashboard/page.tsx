"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Modal } from "@/app/components/ui/Confirm";
import { Tabs } from "@/app/components/Tabs";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("requests");
  const [isReportModalOpen, setReportModalOpen] = useState(false);

  // Dummy data (as requested)
  const requests = [
    { id: 1, name: "Priya Sharma", email: "priya.sharma@email.com", role: "Creator", requestedDate: "March 20, 2024" },
    { id: 2, name: "Rajesh Kumar", email: "rajesh.kumar@email.com", role: "Client", requestedDate: "March 22, 2024" },
    { id: 3, name: "Anita Desai", email: "anita.desai@email.com", role: "Creator", requestedDate: "March 25, 2024" },
    { id: 4, name: "Meera Patel", email: "meera.patel@email.com", role: "Client", requestedDate: "March 26, 2024" },
  ];

  const users = [
    { id: 1, name: "Sarah Johnson", email: "sarah.j@email.com", role: "Client", status: "Active", projects: 12, functions: 45, initials: "SJ" },
    { id: 2, name: "Michael Chen", email: "m.chen@email.com", role: "Creator", status: "Active", projects: 8, functions: 32, initials: "MC" },
    { id: 3, name: "Emily Rodriguez", email: "emily.r@email.com", role: "Client", status: "Inactive", projects: 5, functions: 18, initials: "ER" },
  ];

  const categories = [
    { id: 1, name: "Wedding Ceremony", description: "Ceremonial events and decorations", functions: 24 },
    { id: 2, name: "Corporate Events", description: "Business meetings and conferences", functions: 18 },
    { id: 3, name: "Birthday Parties", description: "Celebration events for birthdays", functions: 31 },
    { id: 4, name: "Art Exhibitions", description: "Gallery and museum displays", functions: 12 },
  ];

  const tabs = [
    { key: "requests", label: "Requests" },
    { key: "users", label: "Users" },
    { key: "reports", label: "Reports" },
    { key: "categories", label: "Categories" },
  ];

  const reportOptions = [
    {
      key: "creatorProjectsSummary",
      label: "Number of projects & models per creator",
      description: "Summarize creators along with their project and model counts",
    },
    {
      key: "topFavoritedProjects",
      label: "Projects with the most favourites",
      description: "Highlight popular projects, their owners, and total favourites",
    },
    {
      key: "activeClientsCount",
      label: "Number of active clients",
      description: "Provide a current total of active client accounts",
    },
  ];

  const RoleBadge = ({ role }: { role: string }) => {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    if (role.toLowerCase() === "creator") return <span className={base + " bg-blue-100 text-blue-700"}>Creator</span>;
    return <span className={base + " bg-purple-100 text-purple-700"}>Client</span>;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    if (status.toLowerCase() === "active") return <span className={base + " bg-green-100 text-green-700"}>Active</span>;
    return <span className={base + " bg-gray-100 text-gray-700"}>Inactive</span>;
  };

  return (
    <div className="min-h-screen bg-brown/5">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        {/* Back link */}
        <Link href="/" className="mb-4 inline-flex items-center gap-2 text-brown hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Back to Menu
        </Link>

        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brown md:text-3xl">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <Card className="p-0">
          <div className="px-4 pt-3">
            <Tabs tabs={tabs} defaultKey={activeTab} onChange={setActiveTab} />
          </div>

          {/* Requests */}
          {activeTab === "requests" && (
            <div className="space-y-4 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-semibold text-brown">Pending Account Requests</h2>
                <select className="w-full max-w-xs rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30">
                  <option>All Requests</option>
                  <option>Creator Requests</option>
                  <option>Client Requests</option>
                </select>
              </div>

              <Card className="p-0">
                <div className="grid grid-cols-12 border-b border-brown/10 bg-brown/5 px-4 py-3 text-xs font-semibold text-brown">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Requested Date</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <div>
                  {requests.map((r) => (
                    <div key={r.id} className="grid grid-cols-12 items-center border-b border-brown/10 px-4 py-3 last:border-none">
                      <div className="col-span-3 text-sm text-brown">{r.name}</div>
                      <div className="col-span-3 text-sm text-brown/80">{r.email}</div>
                      <div className="col-span-2">
                        <RoleBadge role={r.role} />
                      </div>
                      <div className="col-span-2 text-sm text-brown/80">{r.requestedDate}</div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <Button variant="gold" className="h-9 px-3 text-xs">Approve</Button>
                        <Button variant="outline" className="h-9 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="space-y-4 p-4">
              <div className="grid gap-4">
                {users.map((u) => (
                  <Card key={u.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-full bg-brown/10 text-sm font-semibold text-brown">
                        {u.initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-brown">{u.name}</h3>
                        <p className="text-xs text-brown/70">{u.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <RoleBadge role={u.role} />
                          <StatusBadge status={u.status} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-brown">Projects: <span className="font-semibold">{u.projects}</span></p>
                        <p className="text-sm text-brown">Functions: <span className="font-semibold">{u.functions}</span></p>
                      </div>
                      <Button variant="ghost" className="p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Reports */}
          {activeTab === "reports" && (
            <div className="space-y-4 p-4">
              <h2 className="text-lg font-semibold text-brown">Generate Reports</h2>
              <Card className="p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-brown">Start Date</label>
                    <input type="text" placeholder="mm/dd/yyyy" className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-brown">End Date</label>
                    <input type="text" placeholder="mm/dd/yyyy" className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30" />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold text-brown">Report Types</h3>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {[
                      ["userActivity", "User Activity"],
                      ["projectStats", "Project Statistics"],
                      ["functionAnalytics", "Function Analytics"],
                      ["systemPerformance", "System Performance"],
                      ["revenueReports", "Revenue Reports"],
                      ["userRegistrations", "User Registrations"],
                    ].map(([id, label]) => (
                      <label key={id} htmlFor={id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-brown/10 bg-brown/5 px-3 py-2 text-sm text-brown hover:bg-brown/10">
                        <input id={id} type="checkbox" className="size-4 accent-brown" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="gold" className="gap-2" onClick={() => setReportModalOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Generate Excel Report
                  </Button>
                </div>
              </Card>
            </div>
          )}

          <Modal
            isOpen={isReportModalOpen}
            onClose={() => setReportModalOpen(false)}
            title="Generate Excel Report"
            onCancelLabel="Close"
          >
            <div className="mt-4 space-y-4">
              <p className="text-sm text-brown/70">
                Select the information you want included in the exported Excel report.
              </p>
              <div className="space-y-3">
                {reportOptions.map((option) => (
                  <label
                    key={option.key}
                    htmlFor={option.key}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-brown/10 bg-brown/5 px-3 py-3 text-sm text-brown hover:bg-brown/10"
                  >
                    <input id={option.key} type="checkbox" className="mt-1 size-4 accent-brown" />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-brown/60">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button variant="gold" className="w-full justify-center" onClick={() => setReportModalOpen(false)}>
                Download Excel (Mock)
              </Button>
            </div>
          </Modal>

          {/* Categories */}
          {activeTab === "categories" && (
            <div className="space-y-4 p-4">
              <h2 className="text-lg font-semibold text-brown">Function Categories</h2>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input type="text" placeholder="Add new category..." className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30" />
                <Button variant="brown" className="gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Category
                </Button>
              </div>

              <div className="grid gap-4">
                {categories.map((c) => (
                  <Card key={c.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-brown">{c.name}</h3>
                      <p className="mt-1 text-sm text-brown/70">{c.description}</p>
                      <p className="mt-1 text-xs text-brown/60">{c.functions} functions</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="gap-1 px-3 py-1 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </Button>
                      <Button variant="outline" className="gap-1 px-3 py-1 text-xs text-red-600 border-red-200 hover:bg-red-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}