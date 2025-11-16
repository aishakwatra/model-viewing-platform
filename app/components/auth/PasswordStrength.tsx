"use client";

import { getPasswordStrength } from "@/app/lib/validation";

interface PasswordStrengthProps {
  password: string;
  show?: boolean;
}

export function PasswordStrength({ password, show = true }: PasswordStrengthProps) {
  if (!show || !password) return null;

  const { score, label, color } = getPasswordStrength(password);
  const percentage = (score / 4) * 100;

  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-brown/70">Password strength:</span>
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-brown/10">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {score < 2 && (
        <p className="mt-1 text-xs text-brown/60">
          Use 8+ characters with uppercase, lowercase, numbers & symbols
        </p>
      )}
    </div>
  );
}
