import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(dh: number): string {
  return new Intl.NumberFormat('en-MA', {
    style: 'currency',
    currency: 'MAD',
  }).format(dh);
}
