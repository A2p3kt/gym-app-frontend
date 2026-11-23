/**
 * @fileoverview Display formatters shared by tables, dialogs and the calendar,
 * so every date and customer name in the app is rendered the same way.
 */

import dayjs from 'dayjs';
import type { CustomerSummary } from '../types';

/** Date-time display format required by the assignment, e.g. "18.04.2024 18:59". */
export const DATE_TIME_FORMAT = 'DD.MM.YYYY HH:mm';

/**
 * Formats an ISO-8601 string (or Date) as `DD.MM.YYYY HH:mm` in the user's local time zone.
 *
 * @param value - ISO date string or Date.
 * @returns The formatted date, or an empty string if the value is missing or unparseable
 *          (so a raw ISO string is never shown to the user).
 */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) {
    return '';
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(DATE_TIME_FORMAT) : '';
}

/**
 * Formats a customer into "Firstname Lastname".
 *
 * @param customer - Customer (or embedded customer summary); null when the training has no owner.
 * @returns Full name, or "Unassigned" if no name is available.
 */
export function formatCustomerFullName(
  customer: Pick<CustomerSummary, 'firstname' | 'lastname'> | null | undefined
): string {
  if (!customer) {
    return 'Unassigned';
  }
  const fullName = `${customer.firstname || ''} ${customer.lastname || ''}`.trim();
  return fullName || 'Unassigned';
}

/**
 * Formats a number of minutes as hours and minutes, e.g. 135 -> "2 h 15 min".
 *
 * @param totalMinutes - Duration in minutes.
 * @returns Human-readable duration string.
 */
export function formatMinutesAsHours(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes} min`;
  }
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
