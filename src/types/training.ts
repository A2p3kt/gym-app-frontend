/**
 * @fileoverview Training entity types, API payloads, and calendar event contracts.
 */

import type { CustomerSummary } from './customer';

export interface TrainingLinks {
  self: {
    href: string;
  };
  training: {
    href: string;
  };
  customer: {
    href: string;
  };
}

export interface TrainingRaw {
  id?: number;
  date: string; // ISO-8601 string, e.g. "2024-04-18T18:59:46.350+00:00"
  duration: number; // in minutes
  activity: string;
  _links?: TrainingLinks;
}

export interface TrainingWithCustomer {
  id: number;
  date: string;
  duration: number;
  activity: string;
  customer: CustomerSummary | null;
}

export interface NewTrainingPayload {
  date: string; // ISO-8601 string
  activity: string;
  duration: number;
  customer: string; // Customer self link, e.g. "https://.../api/customers/123"
}

export interface TrainingListResponse {
  _embedded: {
    trainings: TrainingRaw[];
  };
}

/**
 * Calendar event representation mapped from a TrainingWithCustomer record
 * for display inside React Big Calendar.
 */
export interface CalendarTrainingEvent {
  /** Unique numeric ID of the training session */
  id: number;
  /** Display title formatted as "Activity / Customer Name" */
  title: string;
  /** Session start timestamp */
  start: Date;
  /** Session end timestamp computed from start + duration (minutes) */
  end: Date;
  /** Underlying training record with embedded customer details for inspection */
  resource: TrainingWithCustomer;
}
