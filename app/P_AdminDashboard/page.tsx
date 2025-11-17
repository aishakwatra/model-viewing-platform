// app/P_AdminDashboard/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Modal } from "@/app/components/ui/Confirm";
import { Tabs } from "@/app/components/Tabs";
import { PendingRequestsList } from "@/app/components/admin/PendingRequestsList";
import {
  fetchUnapprovedUsers,
  approveUser,
  rejectUser,
} from "@/app/lib/admin";

// Helper Icon Components
const RequestsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const CategoriesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("requests");
  const [isReportModalOpen, setReportModalOpen] = useState(false);

  const requests = [
    { id: 1, name: "Priya Sharma", email: "priya.sharma@email.com", role: "Creator", requestedDate: "March 20, 2024" },
    { id: 2, name: "Rajesh Kumar", email: "rajesh.kumar@email.com", role: "Client", requestedDate: "March 22, 2024" },
  ];
  const users = [
    { id: 1, name: "Sarah Johnson", email: "sarah.j@email.com", role: "Client", status: "Active", projects: 12, functions: 45, initials: "SJ" },
    { id: 2, name: "Michael Chen", email: "m.chen@email.com", role: "Creator", status: "Active", projects: 8, functions: 32, initials: "MC" },
  ];
  const categories = [
    { id: 1, name: "Wedding Ceremony", description: "Ceremonial events and decorations", functions: 24 },
    { id: 2, name: "Corporate Events", description: "Business meetings and conferences", functions: 18 },
  ];

  const tabs = useMemo(() => [
    { key: "requests", label: "Requests", icon: <RequestsIcon /> },
    { key: "users", label: "Users", icon: <UsersIcon /> },
    { key: "reports", label: "Reports", icon: <ReportsIcon /> },
    { key: "categories", label: "Categories", icon: <CategoriesIcon /> },
  ], []);

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
    <div className="min-h-screen bg-beige">
      <div className="border-b border-brown/10 bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-brown">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-8">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-brown/5 border border-brown/10 self-start">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'brown' : 'ghost'}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2"
            >
              {tab.icon} {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "requests" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-brown">Pending Account Requests</h2>
            <PendingRequestsList
              fetchRequests={fetchUnapprovedUsers}
              approveRequest={approveUser}
              rejectRequest={rejectUser}
            />
          </div>
        )}

        {activeTab === "users" && (
          <div className="grid gap-4">
            {users.map((u) => (
              <Card key={u.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-brown/10 text-sm font-semibold text-brown">{u.initials}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-brown">{u.name}</h3>
                    <p className="text-xs text-brown/70">{u.email}</p>
                    <div className="mt-2 flex items-center gap-2"><RoleBadge role={u.role} /><StatusBadge status={u.status} /></div>
                  </div>
                </div>
                {/* --- CHANGE IS HERE --- */}
                <div className="text-left mr-4">
                    <p className="text-sm text-brown">Projects: <span className="font-semibold">{u.projects}</span></p>
                    <p className="text-sm text-brown">Functions: <span className="font-semibold">{u.functions}</span></p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "reports" && (
          <Card className="p-4 space-y-4">
            <h2 className="text-lg font-semibold text-brown">Generate Reports</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-brown">Start Date</label><input type="date" className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30" /></div>
              <div><label className="mb-1 block text-sm font-medium text-brown">End Date</label><input type="date" className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30" /></div>
            </div>
            <Button variant="gold" className="gap-2" onClick={() => setReportModalOpen(true)}>
              <ReportsIcon /> Generate Excel Report
            </Button>
          </Card>
        )}

        {activeTab === "categories" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-brown">Function Categories</h2>
            <div className="flex gap-3"><input type="text" placeholder="Add new category..." className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30" /><Button variant="brown" className="gap-2"><UsersIcon /> Add Category</Button></div>
            <div className="grid gap-4">
              {categories.map((c) => (
                <Card key={c.id} className="flex items-center justify-between gap-4 p-4">
                  <div><h3 className="text-sm font-semibold text-brown">{c.name}</h3><p className="mt-1 text-sm text-brown/70">{c.description}</p></div>
                  <div className="flex items-center gap-2"><Button variant="outline" className="gap-1 px-3 py-1 text-xs">Edit</Button><Button variant="outline" className="gap-1 px-3 py-1 text-xs text-red-600 border-red-200 hover:bg-red-50">Delete</Button></div>
                </Card>
              ))}
            </div>
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
      </div>
    </div>
  );
}