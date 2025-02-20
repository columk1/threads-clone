import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const baseButtonStyles =
  'rounded-lg border border-primary-outline px-4 font-semibold text-primary-text transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed'
