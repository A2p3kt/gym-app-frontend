/**
 * @fileoverview Statistics & Analytics dashboard visualizing workout volume.
 * Full implementation scheduled for Milestone 4.
 */

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

/**
 * Placeholder view for the Workout Statistics page.
 *
 * @returns JSX Element rendering the statistics placeholder.
 */
export const StatisticsPage: React.FC = () => {
  return (
    <Box sx={{ py: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <BarChartIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Workout Analytics & Statistics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Activity volume charts and workout aggregation will be activated in Milestone 4.
        </Typography>
      </Paper>
    </Box>
  );
};
