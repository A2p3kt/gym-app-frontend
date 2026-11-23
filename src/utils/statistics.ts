/**
 * @fileoverview Aggregation helpers for the Statistics page (built on Lodash `groupBy` / `sumBy`).
 */

import groupBy from 'lodash/groupBy';
import sumBy from 'lodash/sumBy';
import type { ActivityDurationStat, TrainingSummaryStats, TrainingWithCustomer } from '../types';

/**
 * Normalizes an activity name so that "Spinning", "spinning " and "SPINNING" are grouped together.
 *
 * @param activity - Raw activity name from the API.
 * @returns Lower-cased, trimmed key (empty activities become "other").
 */
function activityKey(activity: string | null | undefined): string {
  return activity?.trim().toLowerCase() || 'other';
}

/**
 * Only count sessions with a usable, positive duration. Guards the totals against
 * bad records (null, NaN or negative minutes) coming from the shared demo database.
 *
 * @param training - Training record.
 * @returns The duration in minutes, or 0 if it is not a valid positive number.
 */
function safeDuration(training: TrainingWithCustomer): number {
  return Number.isFinite(training.duration) && training.duration > 0 ? training.duration : 0;
}

/**
 * Sums training minutes per activity for the bar chart.
 *
 * Example output: `[{ activity: 'Spinning', duration: 180, sessions: 3 }, ...]`
 *
 * @param trainings - All training sessions.
 * @returns One entry per activity, sorted by total duration (largest first).
 */
export function aggregateDurationByActivity(
  trainings: TrainingWithCustomer[]
): ActivityDurationStat[] {
  const groups = groupBy(trainings, (t) => activityKey(t.activity));

  return Object.values(groups)
    .map((sessions) => ({
      // Show the activity with the casing of its first occurrence, e.g. "Spinning".
      activity: sessions[0].activity?.trim() || 'Other',
      duration: sumBy(sessions, safeDuration),
      sessions: sessions.length,
    }))
    .sort((a, b) => b.duration - a.duration || a.activity.localeCompare(b.activity));
}

/**
 * Computes the headline numbers shown in the Statistics summary cards.
 *
 * @param trainings - All training sessions.
 * @returns Totals plus the most frequent activity (by number of sessions).
 */
export function computeSummaryStats(trainings: TrainingWithCustomer[]): TrainingSummaryStats {
  const byActivity = aggregateDurationByActivity(trainings);

  // "Most frequent" is by session count; ties are broken by total minutes
  // because `byActivity` is already sorted by duration and the first max wins.
  let mostFrequent: ActivityDurationStat | null = null;
  for (const stat of byActivity) {
    if (!mostFrequent || stat.sessions > mostFrequent.sessions) {
      mostFrequent = stat;
    }
  }

  return {
    totalMinutes: sumBy(trainings, safeDuration),
    totalSessions: trainings.length,
    mostFrequentActivity: mostFrequent?.activity ?? null,
    mostFrequentActivityCount: mostFrequent?.sessions ?? 0,
  };
}
