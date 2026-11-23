/**
 * @fileoverview Training entity types, API payloads, and calendar/statistics view models.
 */

import type { CustomerSummary } from './customer';

/**
 * HATEOAS hyperlinks for a training resource (returned by `/trainings`).
 */
export interface TrainingLinks {
  /** Canonical self link to the training */
  self: {
    href: string;
  };
  /** Link to the training entity resource */
  training: {
    href: string;
  };
  /** Link to the customer that owns this training */
  customer: {
    href: string;
  };
}

/**
 * Training as returned by the HATEOAS `/trainings` endpoint (no customer details embedded).
 */
export interface TrainingRaw {
  /** Numeric training ID (not always present in HATEOAS responses) */
  id?: number;
  /** Start time as an ISO-8601 string, e.g. "2024-04-18T18:59:46.350+00:00" */
  date: string;
  /** Session length in minutes */
  duration: number;
  /** Activity name, e.g. "Spinning" */
  activity: string;
  /** HATEOAS navigational links */
  _links?: TrainingLinks;
}

/**
 * Training as returned by the `/gettrainings` endpoint, with the owning customer embedded.
 * This is the shape used by the Trainings, Calendar and Statistics pages.
 */
export interface TrainingWithCustomer {
  /** Numeric training ID (used to build `/trainings/{id}` for deletion) */
  id: number;
  /** Start time as an ISO-8601 string */
  date: string;
  /** Session length in minutes */
  duration: number;
  /** Activity name */
  activity: string;
  /** Owning customer, or null if the backend returns an orphaned training */
  customer: CustomerSummary | null;
}

/**
 * Request body for `POST /trainings`.
 */
export interface NewTrainingPayload {
  /** Start time as an ISO-8601 string */
  date: string;
  /** Activity name */
  activity: string;
  /** Session length in whole minutes */
  duration: number;
  /** The customer's self link, e.g. "https://.../api/customers/123" */
  customer: string;
}

/**
 * HATEOAS wrapper response for the `/trainings` collection.
 */
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

/**
 * One bar in the Statistics chart: total minutes trained for a single activity.
 */
export interface ActivityDurationStat {
  /** Activity name (display casing taken from the first occurrence) */
  activity: string;
  /** Sum of all session durations for this activity, in minutes */
  duration: number;
  /** Number of sessions recorded for this activity */
  sessions: number;
}

/**
 * Headline numbers shown in the Statistics page summary cards.
 */
export interface TrainingSummaryStats {
  /** Sum of all session durations, in minutes */
  totalMinutes: number;
  /** Total number of sessions */
  totalSessions: number;
  /** Activity with the most sessions, or null when there are no trainings */
  mostFrequentActivity: string | null;
  /** Number of sessions of the most frequent activity */
  mostFrequentActivityCount: number;
}
