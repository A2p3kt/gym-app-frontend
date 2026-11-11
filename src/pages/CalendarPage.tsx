/**
 * @fileoverview Calendar view page showing training appointments.
 * Full implementation scheduled for Milestone 3.
 */

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

/**
 * Placeholder view for the Training Calendar page.
 *
 * @returns JSX Element rendering the calendar placeholder.
 */
export const CalendarPage: React.FC = () => {
  return (
    <Box sx={{ py: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <CalendarMonthIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Training Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Interactive multi-view calendar (Month, Week, Day) will be activated in Milestone 3.
        </Typography>
      </Paper>
    </Box>
  );
};
