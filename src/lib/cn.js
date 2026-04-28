/*
 * cn() — className merge utility
 * ────────────────────────────────
 * Combines clsx (conditional classnames) with tailwind-merge (resolves
 * Tailwind conflicts like "px-2 px-4" → keeps only "px-4").
 *
 * USAGE:
 *   import { cn } from "@/lib/cn";
 *
 *   <div className={cn(
 *     "base-class",
 *     isActive && "bg-purple-500",
 *     className  // passed from parent — wins over base
 *   )} />
 *
 * WHY BOTH LIBRARIES:
 *   clsx alone: cn("px-2", "px-4") → "px-2 px-4" (both applied, conflict)
 *   tailwind-merge alone: no conditional logic
 *   Together: cn("px-2", condition && "px-4") → "px-4" (resolved correctly)
 *
 * This is the same pattern shadcn/ui uses. You may already have this in
 * your project at @/lib/utils — if so, skip this file and use yours.
 *
 * FILE LOCATION: src/lib/cn.js
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}