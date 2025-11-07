
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // This hook requires a client component
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

interface FormState {
  fullName: string;
  email: string;

}

const initialFormState: FormState = {
  fullName: "Sarah Johnson",
  email: "sarah.j@email.com",

};

export function ProfileClientPage() {
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<FormState>(initialFormState);

  const handleInputChange = (
    field: keyof FormState,
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const profileSource = searchParams.get("from");
  const backHref = profileSource === "creator" ? "/creator/dashboard" : "/P_ClientDashboard";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-2 text-brown hover:underline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brown md:text-3xl">
            Edit Account Information
          </h1>
          <p className="mt-1 text-sm text-brown/70">
            Update your profile, contact details, and account role.
          </p>
        </div>
        <div className="flex size-16 items-center justify-center rounded-full bg-brown/10 text-lg font-semibold text-brown">
          {formState.fullName
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </div>
      </div>

      <Card className="p-6">
        <form className="grid gap-6">
          {/* The grid-cols-2 layout will now organize the 3 remaining fields */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Full Name */}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-brown">Full Name</span>
              <input
                type="text"
                value={formState.fullName}
                onChange={(event) => handleInputChange("fullName", event.target.value)}
                className="rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30"
              />
            </label>

            {/* Email Address */}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-brown">Email Address</span>
              <input
                type="email"
                value={formState.email}
                onChange={(event) => handleInputChange("email", event.target.value)}
                className="rounded-xl border border-brown/20 bg-white px-3 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-brown/30"
              />
            </label>

        
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-brown/60">
              Saving will update your account details across the entire platform.
            </p>
            <div className="flex gap-3">
              <Link
                href={backHref}
                className="inline-flex items-center rounded-xl border border-brown/20 px-4 py-2 text-sm font-medium text-brown transition hover:bg-brown/5"
              >
                Cancel
              </Link>
              <Button type="button" variant="gold" className="px-6">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}