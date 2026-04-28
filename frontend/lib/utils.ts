import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleError(error: any, fallbackMessage: string = 'An unexpected error occurred') {
  console.error(fallbackMessage, error);
}

export function showSuccess(message: string) {
  console.log('SUCCESS:', message);
}
