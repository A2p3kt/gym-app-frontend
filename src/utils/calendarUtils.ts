/**
 * @fileoverview Pure utility functions and Day.js localizer setup for the Training Calendar.
 */

import dayjs from 'dayjs';
import { dayjsLocalizer } from 'react-big-calendar';
import type { CalendarTrainingEvent, CustomerSummary, TrainingWithCustomer } from '../types';

/**
 * Curated WCAG-AA high-contrast color palette harmonious with the app's navy/teal theme
 * used for deterministic color-coding by workout activity name.
 */
const ACTIVITY_PALETTE: readonly string[] = [
  '#1a365d',
  '#007791',
  '#2b6cb0',
  '#2f855a',
  '#6b46c1',
  '#c05621',
  '#b83280',
  '#2c7a7b',
];

/**
 * Shared React Big Calendar Day.js localizer configured once at module load.
 * React Big Calendar v1.20.0 initializes the required Day.js plugins inside `dayjsLocalizer`.
 */
export const calendarLocalizer = dayjsLocalizer(dayjs);

/**
 * Formats a customer summary into a full display name.
 *
 * @param customer - Embedded customer summary or null when unassigned.
 * @returns Full name ("Firstname Lastname") or "Unassigned" if unavailable.
 */
export function formatCustomerFullName(customer: CustomerSummary | null): string {
  if (!customer) {
    return 'Unassigned';
  }
  const fullName = `${customer.firstname || ''} ${customer.lastname || ''}`.trim();
  return fullName || 'Unassigned';
}

/**
 * Maps a single API training record into a React Big Calendar event object.
 * Computes the end timestamp by adding the workout duration in minutes to the start timestamp.
 *
 * @param training - Training session with embedded customer details.
 * @returns Mapped calendar event, or null if the training's date is invalid.
 */
export function mapTrainingToCalendarEvent(
  training: TrainingWithCustomer
): CalendarTrainingEvent | null {
  const startDayjs = dayjs(training.date);
  if (!startDayjs.isValid()) {
    return null;
  }

  const safeDuration =
    Number.isFinite(training.duration) && training.duration > 0 ? training.duration : 0;
  const endDayjs = startDayjs.add(safeDuration, 'minute');
  const activityLabel = training.activity?.trim() || 'Training';
  const customerName = formatCustomerFullName(training.customer);

  return {
    id: training.id,
    title: `${activityLabel} / ${customerName}`,
    start: startDayjs.toDate(),
    end: endDayjs.toDate(),
    resource: training,
  };
}

/**
 * Maps an array of API training records into valid React Big Calendar events,
 * filtering out any records with invalid timestamps.
 *
 * @param trainings - Collection of training sessions with embedded customer records.
 * @returns Array of mapped CalendarTrainingEvent objects.
 */
export function mapTrainingsToCalendarEvents(
  trainings: TrainingWithCustomer[]
): CalendarTrainingEvent[] {
  return trainings
    .map(mapTrainingToCalendarEvent)
    .filter((event): event is CalendarTrainingEvent => event !== null);
}

/**
 * Computes a deterministic badge/event background color for a given workout activity.
 * Normalizes casing and whitespace so identical activities always share the same color.
 *
 * @param activity - Name of the training activity (e.g., "Spinning", "Gym Training").
 * @returns Hex color string from the curated high-contrast palette.
 */
export function getActivityColor(activity: string): string {
  const normalized = activity.trim().toLowerCase();
  if (!normalized) {
    return ACTIVITY_PALETTE[0];
  }

  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) | 0;
  }

  const index = Math.abs(hash) % ACTIVITY_PALETTE.length;
  return ACTIVITY_PALETTE[index];
}

/**
 * Formats an event's start and end dates into a human-readable local range (`DD.MM.YYYY HH:mm`).
 * Omits the redundant end date when the session starts and ends on the same calendar day.
 *
 * @param start - Session start Date object.
 * @param end - Session end Date object.
 * @returns Formatted date-time range string.
 */
export function formatEventDateRange(start: Date, end: Date): string {
  const startDayjs = dayjs(start);
  const endDayjs = dayjs(end);

  if (startDayjs.isSame(endDayjs, 'day')) {
    return `${startDayjs.format('DD.MM.YYYY HH:mm')} – ${endDayjs.format('HH:mm')}`;
  }

  return `${startDayjs.format('DD.MM.YYYY HH:mm')} – ${endDayjs.format('DD.MM.YYYY HH:mm')}`;
}
