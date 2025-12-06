// app/P_AdminDashboard/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/auth/AuthProvider";
import { ROLE_IDS } from "@/app/lib/auth";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Modal } from "@/app/components/ui/Confirm";
import { PendingRequestsList } from "@/app/components/admin/PendingRequestsList";
import {
  fetchUnapprovedUsers,
  approveUser,
  rejectUser,
  fetchApprovedUsers,
  type ApprovedUser,
} from "@/app/lib/admin";
import { ModelCategory, supabase } from "@/app/lib/supabase";
import { generateAdminReport, downloadExcelFile } from "@/app/lib/reportGenerator";
import { SecureAuthModal } from "@/app/components/auth/SecureAuthModal";
import { UserProjectsModal } from "@/app/components/admin/UserProjectsModal";

type ManageCategoryAction = "create" | "read" | "update" | "delete";

interface ManageCategoryRequest {
  id?: number;
  model_category?: string;
}

// Helper Icon Components
const RequestsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>;
const ReportsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const CategoriesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("requests");
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReportOptions, setSelectedReportOptions] = useState<{
    creatorProjectsSummary: boolean;
    topFavoritedProjects: boolean;
    activeClientsCount: boolean;
  }>({
    creatorProjectsSummary: false,
    topFavoritedProjects: false,
    activeClientsCount: false,
  });
  const [reportDateRange, setReportDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Secure authentication state
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);

  // Users state
  const [users, setUsers] = useState<ApprovedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ApprovedUser | null>(null);
  const [showUserProjectsModal, setShowUserProjectsModal] = useState(false);
  const [categories, setCategories] = useState<ModelCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categoryActionLoading, setCategoryActionLoading] = useState<boolean>(false);
  const [categoryActionTargetId, setCategoryActionTargetId] = useState<number | null>(null);
  const [categoryActionType, setCategoryActionType] = useState<ManageCategoryAction | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ModelCategory | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Handle successful authentication
  const handleAuthSuccess = (authenticatedUser: any) => {
    setVerifiedUser(authenticatedUser);
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  // Admin role protection - Only user_role_id = 3 can access
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not authenticated, logout and redirect to auth page
        logout();
        router.push('/auth');
      } else if (user.user_role_id !== ROLE_IDS.admin) {
        // User is not admin (user_role_id must be 3), logout and redirect to auth page
        logout();
        router.push('/auth');
      }
    }
  }, [user, loading, logout, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-beige">
        <div className="text-brown">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin
  if (!user || user.user_role_id !== ROLE_IDS.admin) {
    return null;
  }

  const manageCategories = useCallback(
    async (
      action: ManageCategoryAction,
      data?: ManageCategoryRequest
    ): Promise<ModelCategory | ModelCategory[] | number> => {
      switch (action) {
        case "create": {
          const rawName = data?.model_category?.trim();
          if (!rawName) {
            throw new Error("Category name is required.");
          }
          const { data: createdCategory, error } = await supabase
            .from("model_categories")
            .insert({ model_category: rawName })
            .select()
            .single();
          if (error) {
            throw error;
          }
          return createdCategory as ModelCategory;
        }
        case "read": {
          const { data: categoryList, error } = await supabase
            .from("model_categories")
            .select("*")
            .order("model_category", { ascending: true });
          if (error) {
            throw error;
          }
          return (categoryList || []) as ModelCategory[];
        }
        case "update": {
          if (!data?.id) {
            throw new Error("Category id is required.");
          }
          const rawName = data.model_category?.trim();
          if (!rawName) {
            throw new Error("Category name is required.");
          }
          const { data: updatedCategory, error } = await supabase
            .from("model_categories")
            .update({ model_category: rawName })
            .eq("id", data.id)
            .select()
            .single();
          if (error) {
            throw error;
          }
          return updatedCategory as ModelCategory;
        }
        case "delete": {
          if (!data?.id) {
            throw new Error("Category id is required.");
          }
          const { error } = await supabase
            .from("model_categories")
            .delete()
            .eq("id", data.id);
          if (error) {
            throw error;
          }
          return data.id;
        }
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    },
    []
  );

  const loadCategories = useCallback(async () => {
    // Only load if authenticated
    if (!isAuthenticated) {
      return;
    }
    
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const categoryList = (await manageCategories("read")) as ModelCategory[];
      setCategories(categoryList);
    } catch (error) {
      setCategoriesError(
        error instanceof Error ? error.message : "Failed to load categories."
      );
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [manageCategories, isAuthenticated]);

  const loadUsers = useCallback(async () => {
    // Only load if authenticated
    if (!isAuthenticated) {
      return;
    }
    
    setUsersLoading(true);
    setUsersError(null);
    try {
      const approvedUsers = await fetchApprovedUsers();
      setUsers(approvedUsers);
    } catch (error) {
      setUsersError(
        error instanceof Error ? error.message : "Failed to load users."
      );
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCategories();
    loadUsers();
  }, [loadCategories, loadUsers]);

  const handleCreateCategory = async () => {
    // Check authentication
    if (!isAuthenticated) {
      setCategoriesError("Please authenticate first.");
      return;
    }
    
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setCategoriesError("Category name cannot be empty.");
      return;
    }
    setCategoryActionType("create");
    setCategoryActionTargetId(null);
    setCategoryActionLoading(true);
    setCategoriesError(null);
    try {
      const createdCategory = (await manageCategories("create", {
        model_category: trimmedName,
      })) as ModelCategory;
      setCategories((prev) =>
        [...prev, createdCategory].sort((a, b) =>
          a.model_category.localeCompare(b.model_category)
        )
      );
      setNewCategoryName("");
    } catch (error) {
      setCategoriesError(
        error instanceof Error ? error.message : "Failed to create category."
      );
    } finally {
      setCategoryActionLoading(false);
      setCategoryActionType(null);
      setCategoryActionTargetId(null);
    }
  };

  const handleStartEditingCategory = (category: ModelCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.model_category);
    setCategoriesError(null);
  };

  const handleCancelEditingCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleUpdateCategory = async () => {
    if (editingCategoryId === null) {
      return;
    }
    const trimmedName = editingCategoryName.trim();
    if (!trimmedName) {
      setCategoriesError("Category name cannot be empty.");
      return;
    }
    setCategoryActionType("update");
    setCategoryActionTargetId(editingCategoryId);
    setCategoryActionLoading(true);
    setCategoriesError(null);
    try {
      const updatedCategory = (await manageCategories("update", {
        id: editingCategoryId,
        model_category: trimmedName,
      })) as ModelCategory;
      setCategories((prev) =>
        prev
          .map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category
          )
          .sort((a, b) => a.model_category.localeCompare(b.model_category))
      );
      handleCancelEditingCategory();
    } catch (error) {
      setCategoriesError(
        error instanceof Error ? error.message : "Failed to update category."
      );
    } finally {
      setCategoryActionLoading(false);
      setCategoryActionType(null);
      setCategoryActionTargetId(null);
    }
  };

  const handlePromptDeleteCategory = (category: ModelCategory) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
    setCategoriesError(null);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete || categoryActionLoading) {
      return;
    }
    setCategoryActionType("delete");
    setCategoryActionTargetId(categoryToDelete.id);
    setCategoryActionLoading(true);
    setCategoriesError(null);
    try {
      await manageCategories("delete", { id: categoryToDelete.id });
      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryToDelete.id)
      );
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      setCategoriesError(
        error instanceof Error ? error.message : "Failed to delete category."
      );
    } finally {
      setCategoryActionLoading(false);
      setCategoryActionType(null);
      setCategoryActionTargetId(null);
    }
  };

  const tabs = useMemo(() => [
    { key: "requests", label: "Requests", icon: <RequestsIcon /> },
    { key: "users", label: "Users", icon: <UsersIcon /> },
    { key: "reports", label: "Reports", icon: <ReportsIcon /> },
    { key: "categories", label: "Categories", icon: <CategoriesIcon /> },
  ], []);

  const reportOptions = [
    {
      key: "creatorProjectsSummary" as const,
      label: "Number of projects & models per creator",
      description: "Summarize creators along with their project and model counts",
    },
    {
      key: "topFavoritedProjects" as const,
      label: "Projects with the most favourites",
      description: "Highlight popular projects, their owners, and total favourites",
    },
    {
      key: "activeClientsCount" as const,
      label: "Number of active clients",
      description: "Provide a current total of active client accounts",
    },
  ];

  const handleReportOptionChange = (key: keyof typeof selectedReportOptions) => {
    setSelectedReportOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleGenerateReport = async () => {
    // Check authentication
    if (!isAuthenticated) {
      setReportError("Please authenticate first.");
      return;
    }
    
    // Validate that at least one option is selected
    const hasSelection = Object.values(selectedReportOptions).some((val) => val);
    if (!hasSelection) {
      setReportError("Please select at least one report type.");
      return;
    }

    setIsGeneratingReport(true);
    setReportError(null);

    try {
      const blob = await generateAdminReport({
        ...selectedReportOptions,
        dateRange: {
          start: reportDateRange.start || null,
          end: reportDateRange.end || null,
        },
      });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `admin_report_${timestamp}.xlsx`;

      downloadExcelFile(blob, filename);
      
      // Close modal and reset after successful generation
      setReportModalOpen(false);
      setSelectedReportOptions({
        creatorProjectsSummary: false,
        topFavoritedProjects: false,
        activeClientsCount: false,
      });
      setReportDateRange({ start: "", end: "" });
    } catch (error) {
      console.error("Error generating report:", error);
      setReportError(
        error instanceof Error ? error.message : "Failed to generate report. Please try again."
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    const roleLower = role.toLowerCase();
    if (roleLower === "creator") return <span className={base + " bg-blue-100 text-blue-700"}>Creator</span>;
    if (roleLower === "client") return <span className={base + " bg-purple-100 text-purple-700"}>Client</span>;
    if (roleLower === "admin") return <span className={base + " bg-gold text-brown"}>Admin</span>;
    return <span className={base + " bg-gray-100 text-gray-700"}>{role}</span>;
  };

  const handleUserClick = (user: ApprovedUser) => {
    setSelectedUser(user);
    setShowUserProjectsModal(true);
  };

  const handleUserProjectsModalClose = () => {
    setShowUserProjectsModal(false);
    setSelectedUser(null);
    // Reload users in case project counts changed
    loadUsers();
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    if (status.toLowerCase() === "active") return <span className={base + " bg-green-100 text-green-700"}>Active</span>;
    return <span className={base + " bg-gray-100 text-gray-700"}>Inactive</span>;
  };

  return (
    <div className="min-h-screen bg-beige">
      {/* Secure Authentication Modal - Shows on page load */}
      <SecureAuthModal
        isOpen={showAuthModal}
        requiredRole="admin"
        onAuthSuccess={handleAuthSuccess}
      />

      {/* User Projects Management Modal */}
      <UserProjectsModal
        isOpen={showUserProjectsModal}
        onClose={handleUserProjectsModalClose}
        user={selectedUser}
      />

      <div className="border-b border-brown/10 bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-brown">Admin Dashboard</h1>
            {isAuthenticated && verifiedUser && (
              <div className="text-sm text-brown/70">
                Welcome, {verifiedUser.full_name || verifiedUser.email}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 md:px-8">
        {/* Show content only if authenticated */}
        {!isAuthenticated && (
          <Card className="p-8 text-center">
            <div className="text-brown/70">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="text-lg font-semibold text-brown mb-2">Authentication Required</h2>
              <p className="text-sm">Please sign in to access the admin dashboard.</p>
            </div>
          </Card>
        )}

        {isAuthenticated && (
          <>
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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-brown">All Users</h2>
            {usersError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {usersError}
              </div>
            )}
            {usersLoading ? (
              <Card className="p-4 text-center text-sm text-brown/70">
                Loading users...
              </Card>
            ) : users.length === 0 ? (
              <Card className="p-4 text-center text-sm text-brown/70">
                No users found.
              </Card>
            ) : (
              <div className="grid gap-4">
                {users.map((u) => {
                  const initials = u.full_name
                    ? u.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
                    : u.email[0].toUpperCase();
                  const roleName = u.user_roles?.role || "User";
                  
                  return (
                    <Card 
                      key={u.user_id} 
                      className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-brown/5 transition-colors"
                      onClick={() => handleUserClick(u)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-brown/10 text-sm font-semibold text-brown">
                          {initials}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-brown">{u.full_name || "No name"}</h3>
                          <p className="text-xs text-brown/70">{u.email}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <RoleBadge role={roleName} />
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-xs text-brown/60">User ID: {u.user_id}</p>
                        <p className="text-xs text-brown/60">Click to manage projects</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <Card className="p-4 space-y-4">
            <h2 className="text-lg font-semibold text-brown">Generate Reports</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-brown">Start Date</label>
                <input 
                  type="date" 
                  value={reportDateRange.start}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brown">End Date</label>
                <input 
                  type="date" 
                  value={reportDateRange.end}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30" 
                />
              </div>
            </div>
            <Button variant="gold" className="gap-2" onClick={() => setReportModalOpen(true)}>
              <ReportsIcon /> Generate Excel Report
            </Button>
          </Card>
        )}

        {activeTab === "categories" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-brown">Function Categories</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Add new category..."
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30"
                disabled={categoryActionLoading && categoryActionType === "create"}
              />
              <Button
                variant="brown"
                className="gap-2"
                onClick={handleCreateCategory}
                disabled={categoryActionLoading || !newCategoryName.trim()}
              >
                <UsersIcon />
                {categoryActionLoading && categoryActionType === "create" ? "Adding..." : "Add Category"}
              </Button>
            </div>
            {categoriesError && (
              <div className="text-sm text-red-600">{categoriesError}</div>
            )}
            {categoriesLoading ? (
              <Card className="p-4 text-sm text-brown/70">Loading categories...</Card>
            ) : categories.length === 0 ? (
              <Card className="p-4 text-sm text-brown/70">
                No categories available yet. Create the first category to get started.
              </Card>
            ) : (
              <div className="grid gap-4">
                {categories.map((category) => {
                  const isEditing = editingCategoryId === category.id;
                  const isProcessing = categoryActionLoading && categoryActionTargetId === category.id;
                  const isDeleting = isProcessing && categoryActionType === "delete";
                  const isUpdating = isProcessing && categoryActionType === "update";
                  return (
                    <Card
                      key={category.id}
                      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(event) => setEditingCategoryName(event.target.value)}
                            className="w-full rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30"
                            disabled={isProcessing}
                          />
                        ) : (
                          <h3 className="text-sm font-semibold text-brown">{category.model_category}</h3>
                        )}
                        {!isEditing && (
                          <p className="mt-1 text-xs text-brown/60">Category ID: {category.id}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="brown"
                              className="px-3 py-1 text-xs"
                              onClick={handleUpdateCategory}
                              disabled={categoryActionLoading}
                            >
                              {isUpdating ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              variant="outline"
                              className="px-3 py-1 text-xs"
                              onClick={handleCancelEditingCategory}
                              disabled={categoryActionLoading}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              className="gap-1 px-3 py-1 text-xs"
                              onClick={() => handleStartEditingCategory(category)}
                              disabled={categoryActionLoading}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              className="gap-1 px-3 py-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handlePromptDeleteCategory(category)}
                              disabled={categoryActionLoading}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
          </>
        )}

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (categoryActionLoading) {
              return;
            }
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
          }}
          onConfirm={handleDeleteCategory}
          onConfirmLabel={categoryActionLoading ? "Deleting..." : "Delete"}
          onCancelLabel="Cancel"
          title="Delete Category"
        >
          <p className="text-sm text-brown/70">
            Are you sure you want to delete the category "{categoryToDelete?.model_category}"? This action cannot be undone.
          </p>
        </Modal>

        <Modal
          isOpen={isReportModalOpen}
          onClose={() => {
            if (!isGeneratingReport) {
              setReportModalOpen(false);
              setReportError(null);
            }
          }}
          title="Generate Excel Report"
          onCancelLabel="Close"
        >
          <div className="mt-4 space-y-4">
            <p className="text-sm text-brown/70">
              Select the information you want included in the exported Excel report.
            </p>
            {reportError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {reportError}
              </div>
            )}
            <div className="space-y-3">
              {reportOptions.map((option) => (
                <label
                  key={option.key}
                  htmlFor={option.key}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-brown/10 bg-brown/5 px-3 py-3 text-sm text-brown hover:bg-brown/10"
                >
                  <input 
                    id={option.key} 
                    type="checkbox" 
                    className="mt-1 size-4 accent-brown"
                    checked={selectedReportOptions[option.key]}
                    onChange={() => handleReportOptionChange(option.key)}
                    disabled={isGeneratingReport}
                  />
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-brown/60">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <Button 
              variant="gold" 
              className="w-full justify-center" 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? "Generating..." : "Download Excel Report"}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}