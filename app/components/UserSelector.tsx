"use client";

import { useState, useEffect } from "react";
import { supabase, User } from "@/app/lib/supabase";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

interface UserSelectorProps {
  onUserSelect: (authUserId: string) => void;
  currentAuthUserId: string | null;
}

export function UserSelector({ onUserSelect, currentAuthUserId }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("full_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  const currentUser = users.find((u) => u.auth_user_id === currentAuthUserId);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {currentUser ? (
          <span>
            {currentUser.full_name || currentUser.email}
          </span>
        ) : (
          <span>Select User</span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-full z-20 mt-2 max-h-96 w-80 overflow-y-auto p-2">
            {loading ? (
              <div className="p-4 text-center text-sm text-brown/70">Loading users...</div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-red-600">{error}</div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-sm text-brown/70">No users found</div>
            ) : (
              <div className="space-y-1">
                {users.map((user) => (
                  <button
                    key={user.auth_user_id}
                    onClick={() => {
                      onUserSelect(user.auth_user_id);
                      setIsOpen(false);
                    }}
                    className={[
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      currentAuthUserId === user.auth_user_id
                        ? "bg-brown text-white"
                        : "hover:bg-brown/10",
                    ].join(" ")}
                  >
                    <div className="font-medium">
                      {user.full_name || "No name"}
                    </div>
                    <div className="text-xs opacity-70">{user.email}</div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
