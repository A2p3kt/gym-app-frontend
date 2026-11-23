/**
 * @fileoverview Small summary card showing one headline number on the Statistics page.
 */

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

/**
 * Props for the StatCard component.
 */
export interface StatCardProps {
  /** Short label above the value, e.g. "Total Sessions" */
  label: string;
  /** The headline value, already formatted for display */
  value: string;
  /** Optional secondary line under the value, e.g. "42 sessions" */
  caption?: string;
  /** Icon shown at the top-right of the card */
  icon: React.ReactNode;
}

/**
 * Displays a single key metric (label, large value, optional caption).
 *
 * @param props - Component props.
 * @returns JSX Element rendering the metric card.
 */
export const StatCard: React.FC<StatCardProps> = ({ label, value, caption, icon }) => (
  <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Box sx={{ color: 'secondary.dark', display: 'flex' }}>{icon}</Box>
    </Box>
    <Typography
      variant="h4"
      component="p"
      sx={{ fontWeight: 700, color: 'primary.dark', mt: 1, wordBreak: 'break-word' }}
    >
      {value}
    </Typography>
    {caption && (
      <Typography variant="caption" color="text.secondary">
        {caption}
      </Typography>
    )}
  </Paper>
);
