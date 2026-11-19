/**
 * @fileoverview Custom calendar event renderer displaying a compact title and hover inspection tooltip.
 */

import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import type { EventProps } from 'react-big-calendar';
import type { CalendarTrainingEvent } from '../../types';
import { formatCustomerFullName, formatEventDateRange } from '../../utils/calendarUtils';

/**
 * Custom event cell content component for React Big Calendar.
 * Shows the truncated "Activity / Customer Name" title with an interactive
 * Material UI tooltip displaying formatted session details on hover.
 *
 * @param props - Event props provided by React Big Calendar.
 * @returns JSX Element rendering the calendar event item with tooltip preview.
 */
export const CalendarEventItem: React.FC<EventProps<CalendarTrainingEvent>> = ({
  event,
  title,
}) => {
  const { resource, start, end } = event;
  const customerName = formatCustomerFullName(resource.customer);
  const formattedRange = formatEventDateRange(start, end);

  const tooltipContent = (
    <Box sx={{ p: 0.5, maxWidth: 260 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'common.white', mb: 0.25 }}>
        {resource.activity}
      </Typography>
      <Typography variant="body2" sx={{ color: 'common.white', opacity: 0.95 }}>
        Customer: {customerName}
      </Typography>
      <Typography variant="body2" sx={{ color: 'common.white', opacity: 0.9 }}>
        Time: {formattedRange}
      </Typography>
      <Typography variant="body2" sx={{ color: 'common.white', opacity: 0.9 }}>
        Duration: {resource.duration} min
      </Typography>
      <Typography
        variant="caption"
        sx={{ display: 'block', mt: 0.5, color: 'common.white', opacity: 0.75, fontStyle: 'italic' }}
      >
        Click for full details
      </Typography>
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow enterDelay={250} placement="top">
      <Box
        component="span"
        sx={{
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '0.8rem',
          fontWeight: 500,
          lineHeight: 1.3,
        }}
      >
        {title}
      </Box>
    </Tooltip>
  );
};
