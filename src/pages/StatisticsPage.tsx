/**
 * @fileoverview Statistics & Analytics dashboard: summary cards plus a bar chart of minutes per activity.
 */

import React, { useMemo } from 'react';
import { Alert, Box, CircularProgress, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimerIcon from '@mui/icons-material/Timer';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { NotifyFn } from '../types';
import { getTrainingsWithCustomer } from '../services/trainingService';
import { useApiData } from '../hooks/useApiData';
import { aggregateDurationByActivity, computeSummaryStats } from '../utils/statistics';
import { formatMinutesAsHours } from '../utils/formatters';
import { ActivityDurationChart, ActivityStatsTable, StatCard } from '../components/statistics';

/**
 * Props for the StatisticsPage component.
 */
export interface StatisticsPageProps {
  /** Callback to trigger feedback snackbar notifications */
  onNotify: NotifyFn;
}

/**
 * Workout analytics dashboard. Loads all trainings, then derives:
 * - summary cards (total minutes, total sessions, most frequent activity), and
 * - a bar chart + table of total minutes per activity (Lodash groupBy/sumBy, see utils/statistics.ts).
 *
 * @param props - Component props.
 * @returns JSX Element rendering the statistics dashboard.
 */
export const StatisticsPage: React.FC<StatisticsPageProps> = ({ onNotify }) => {
  const { data: trainings, loading, reload } = useApiData(
    getTrainingsWithCustomer,
    [],
    onNotify,
    'Failed to fetch training statistics'
  );

  // Derived data is recomputed only when the trainings change.
  const activityStats = useMemo(() => aggregateDurationByActivity(trainings), [trainings]);
  const summary = useMemo(() => computeSummaryStats(trainings), [trainings]);

  const hasData = trainings.length > 0;

  return (
    <Box sx={{ py: 2 }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
            Workout Statistics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total training time by activity, across all customers
          </Typography>
        </Box>
        <Tooltip title="Refresh Statistics">
          <span>
            <IconButton onClick={reload} disabled={loading} aria-label="Refresh statistics" color="primary">
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {loading && !hasData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : !hasData ? (
        <Alert severity="info">
          No training sessions to analyze yet. Schedule a session on the Trainings page or reset the
          demo database from the top bar.
        </Alert>
      ) : (
        <>
          {/* Summary cards: 1 column on phones, 3 on wider screens */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
            <StatCard
              label="Total Training Time"
              value={`${summary.totalMinutes} min`}
              caption={formatMinutesAsHours(summary.totalMinutes)}
              icon={<TimerIcon />}
            />
            <StatCard
              label="Total Sessions"
              value={String(summary.totalSessions)}
              caption={`${activityStats.length} different ${activityStats.length === 1 ? 'activity' : 'activities'}`}
              icon={<EventRepeatIcon />}
            />
            <StatCard
              label="Most Frequent Activity"
              value={summary.mostFrequentActivity ?? '–'}
              caption={`${summary.mostFrequentActivityCount} ${summary.mostFrequentActivityCount === 1 ? 'session' : 'sessions'}`}
              icon={<EmojiEventsIcon />}
            />
          </Box>

          {/* Chart */}
          <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, mb: 2, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'primary.dark', mb: 2 }}>
              Total Minutes per Activity
            </Typography>
            <ActivityDurationChart data={activityStats} />
          </Paper>

          {/* Same numbers as a table */}
          <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'primary.dark', mb: 1 }}>
              Activity Breakdown
            </Typography>
            <ActivityStatsTable data={activityStats} />
          </Paper>
        </>
      )}
    </Box>
  );
};
