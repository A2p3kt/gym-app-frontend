/**
 * @fileoverview Custom Material UI toolbar for the Training Calendar providing period navigation and view switching.
 */

import React from 'react';
import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import { Navigate, Views } from 'react-big-calendar';
import type { ToolbarProps, View } from 'react-big-calendar';
import type { CalendarTrainingEvent } from '../../types';

/**
 * Supported view options rendered in the calendar toolbar switcher.
 */
const VIEW_OPTIONS: ReadonlyArray<{ view: View; label: string }> = [
  { view: Views.MONTH, label: 'Month' },
  { view: Views.WEEK, label: 'Week' },
  { view: Views.DAY, label: 'Day' },
];

/**
 * Custom MUI-styled toolbar for React Big Calendar.
 * Renders Previous / Today / Next navigation controls, the active date range label,
 * and Month / Week / Day view switching buttons.
 *
 * @param props - Toolbar props injected by React Big Calendar.
 * @returns JSX Element rendering the calendar toolbar.
 */
export const CalendarToolbar: React.FC<ToolbarProps<CalendarTrainingEvent>> = ({
  label,
  view,
  onNavigate,
  onView,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 2,
      }}
    >
      <ButtonGroup size="small" variant="outlined" color="primary" aria-label="Calendar navigation">
        <Button
          onClick={() => onNavigate(Navigate.PREVIOUS)}
          aria-label="Previous period"
          title="Previous"
        >
          <ChevronLeftIcon fontSize="small" />
        </Button>
        <Button
          onClick={() => onNavigate(Navigate.TODAY)}
          startIcon={<TodayIcon fontSize="small" />}
          aria-label="Go to today"
        >
          Today
        </Button>
        <Button
          onClick={() => onNavigate(Navigate.NEXT)}
          aria-label="Next period"
          title="Next"
        >
          <ChevronRightIcon fontSize="small" />
        </Button>
      </ButtonGroup>

      <Typography
        variant="h6"
        component="h2"
        sx={{
          fontWeight: 700,
          color: 'primary.dark',
          textAlign: 'center',
          minWidth: { xs: '100%', sm: 'auto' },
          order: { xs: -1, sm: 0 },
        }}
      >
        {label}
      </Typography>

      <ButtonGroup size="small" color="primary" aria-label="Calendar view switcher">
        {VIEW_OPTIONS.map((option) => {
          const isActive = view === option.view;
          return (
            <Button
              key={option.view}
              variant={isActive ? 'contained' : 'outlined'}
              color="primary"
              aria-pressed={isActive}
              onClick={() => onView(option.view)}
            >
              {option.label}
            </Button>
          );
        })}
      </ButtonGroup>
    </Box>
  );
};
