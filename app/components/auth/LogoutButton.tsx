"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { logout } from "@/app/lib/auth";

interface LogoutButtonProps {
  variant?: "brown" | "gold" | "outline" | "ghost";
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = "outline",
  className = "",
  children = "Logout",
}: LogoutButtonProps) {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/auth");
  }

  return (
    <Button variant={variant} onClick={handleLogout} className={className}>
      {children}
    </Button>
  );
}
