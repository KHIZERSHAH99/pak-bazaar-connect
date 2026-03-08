import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as PKR with commas, e.g. 1500 → "PKR 1,500" */
export function formatPKR(amount: number | undefined | null): string {
  if (amount == null) return 'PKR 0';
  return `PKR ${amount.toLocaleString()}`;
}
