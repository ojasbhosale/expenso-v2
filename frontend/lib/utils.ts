import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Safe number formatting utilities
export const formatCurrency = (value: number | string | null | undefined): string => {
  const num = Number(value) || 0
  return num.toFixed(2)
}

export const formatNumber = (value: number | string | null | undefined): number => {
  return Number(value) || 0
}

export const formatCompactCurrency = (value: number): string => {
  const num = Number(value) || 0
  if (num >= 1000000) {
    return `₹${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`
  }
  return `₹${num.toFixed(0)}`
}

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const formatDateLong = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
