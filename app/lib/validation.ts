/**
 * Validation utilities for forms and user input
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push("Email is required");
    return { isValid: false, errors };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push("Invalid email format");
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }
  
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  
  // Optional: Add more strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push("Password must contain at least one uppercase letter");
  // }
  // if (!/[a-z]/.test(password)) {
  //   errors.push("Password must contain at least one lowercase letter");
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push("Password must contain at least one number");
  // }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate full name
 */
export function validateFullName(name: string): ValidationResult {
  const errors: string[] = [];
  
  if (!name || !name.trim()) {
    errors.push("Full name is required");
    return { isValid: false, errors };
  }
  
  if (name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters");
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): ValidationResult {
  const errors: string[] = [];
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ["image/jpeg", "image/png", "image/jpg"] } = options;
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(", ")}`);
  }
  
  return { isValid: errors.length === 0, errors };
}

/**
 * Check password strength (returns score 0-4)
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#22c55e"];
  
  return {
    score,
    label: labels[score] || "Very Weak",
    color: colors[score] || "#ef4444",
  };
}
