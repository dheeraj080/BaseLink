import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from 'react-hot-toast'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleError(error: any, fallbackMessage: string = 'An unexpected error occurred') {
  console.error(fallbackMessage, error);
}

export function showSuccess(message: string) {
  toast.success(message);
}

/**
 * Calculates the UTC offset for a given IANA timezone at a specific date.
 * Returns format like "+05:30", "-08:00", or "Z" for UTC.
 */
export function getTimezoneOffset(ianaTimezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaTimezone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find((part) => part.type === 'timeZoneName');
    
    if (!offsetPart) return 'Z';
    
    // Format is usually "GMT+5:30" or "GMT-8" or "GMT"
    const value = offsetPart.value;
    if (value === 'GMT') return 'Z';
    
    const match = value.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 'Z';
    
    const [_, sign, hours, minutes = '00'] = match;
    return `${sign}${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  } catch (e) {
    console.error('Error calculating timezone offset:', e);
    return 'Z';
  }
}
