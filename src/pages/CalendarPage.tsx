/**
 * @fileoverview Interactive Training Calendar page supporting Month, Week, and Day views plus event inspection.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Calendar, Views } from 'react-big-calendar';
import type { Components, Formats, View } from 'react-big-calendar';
import dayjs from 'dayjs';
import type { CalendarTrainingEvent, NotifyFn } from '../types';
import { getTrainingsWithCustomer } from '../services/trainingService';
import { useApiData } from '../hooks/useApiData';
import {
  calendarLocalizer,
  getActivityColor,
  mapTrainingsToCalendarEvents,
} from '../utils/calendarUtils';
import {
  CalendarEventItem,
  CalendarToolbar,
  TrainingEventDialog,
} from '../components/calendar';

/**
 * Props for the CalendarPage component.
 */
export interface CalendarPageProps {
  /** Callback to trigger feedback snackbar notifications */
  onNotify: NotifyFn;
}

/** Supported React Big Calendar view modes */
const CALENDAR_VIEWS: View[] = [Views.MONTH, Views.WEEK, Views.DAY];

/** Default vertical scroll anchor (07:00) for Week and Day time grids (only the time part is used) */
const DEFAULT_SCROLL_TIME = new Date(1970, 0, 1, 7, 0, 0);

/** Suppresses native browser title tooltips so the custom MUI Tooltip renders cleanly */
const EMPTY_TOOLTIP_ACCESSOR = (): string => '';

/** Standardized Day.js date/time display formats aligned with DD.MM.YYYY HH:mm */
const CALENDAR_FORMATS: Formats = {
  timeGutterFormat: 'HH:mm',
  eventTimeRangeFormat: ({ start, end }) =>
    `${dayjs(start).format('HH:mm')} – ${dayjs(end).format('HH:mm')}`,
  eventTimeRangeStartFormat: ({ start }) => `${dayjs(start).format('HH:mm')} – `,
  eventTimeRangeEndFormat: ({ end }) => ` – ${dayjs(end).format('HH:mm')}`,
  dayHeaderFormat: 'dddd, DD.MM.YYYY',
  dayFormat: 'ddd DD.MM',
  monthHeaderFormat: 'MMMM YYYY',
  dayRangeHeaderFormat: ({ start, end }) =>
    `${dayjs(start).format('DD.MM.YYYY')} – ${dayjs(end).format('DD.MM.YYYY')}`,
};

/** Custom MUI component overrides injected into React Big Calendar */
const CALENDAR_COMPONENTS: Components<CalendarTrainingEvent> = {
  toolbar: CalendarToolbar,
  event: CalendarEventItem,
};

/**
 * Training Calendar page displaying all scheduled workout sessions across
 * Month, Week, and Day views with hover previews and click-to-inspect details.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the interactive Training Calendar view.
 */
export const CalendarPage: React.FC<CalendarPageProps> = ({ onNotify }) => {
  const { data: trainings, loading, reload } = useApiData(
    getTrainingsWithCustomer,
    [],
    onNotify,
    'Failed to fetch training schedule'
  );
  // Convert API trainings into calendar events (start/end Dates + title); recomputed only when data changes.
  const events = useMemo(() => mapTrainingsToCalendarEvents(trainings), [trainings]);

  // The calendar is "controlled": we own the current view and date so the custom toolbar can drive them.
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarTrainingEvent | null>(null);

  /**
   * Updates the active calendar period date when navigating (Prev, Next, Today, or drilldown).
   */
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  /**
   * Switches between Month, Week, and Day views.
   */
  const handleViewChange = useCallback((nextView: View) => {
    setCurrentView(nextView);
  }, []);

  /**
   * Opens the detailed inspection dialog for the clicked training event.
   */
  const handleSelectEvent = useCallback((event: CalendarTrainingEvent) => {
    setSelectedEvent(event);
  }, []);

  /**
   * Applies deterministic activity-based color styling to each calendar event pill.
   */
  const eventPropGetter = useCallback((event: CalendarTrainingEvent) => ({
    style: {
      backgroundColor: getActivityColor(event.resource.activity),
      borderColor: 'transparent',
      color: '#ffffff',
      borderRadius: '6px',
      padding: '2px 6px',
    },
  }), []);

  return (
    <Box sx={{ py: 2 }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 2, borderRadius: 2 }} elevation={1}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
              Training Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total scheduled sessions: {events.length} • Click any session for full details
            </Typography>
          </Box>

          <Tooltip title="Refresh Schedule">
            <span>
              <IconButton
                onClick={reload}
                disabled={loading}
                aria-label="Refresh Schedule"
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {!loading && events.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No scheduled training sessions found. Schedule a session on the Trainings page or reset
            the demo database from the top bar.
          </Alert>
        )}

        <Box
          sx={{
            height: { xs: 580, md: 680 },
            position: 'relative',
            '& .rbc-calendar': {
              fontFamily: 'inherit',
            },
            '& .rbc-month-view, & .rbc-time-view': {
              borderColor: '#e2e8f0',
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'background.paper',
            },
            '& .rbc-header': {
              py: 1,
              fontWeight: 600,
              fontSize: '0.82rem',
              color: 'primary.dark',
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            },
            '& .rbc-day-bg + .rbc-day-bg, & .rbc-month-row + .rbc-month-row': {
              borderColor: '#e2e8f0',
            },
            '& .rbc-time-content, & .rbc-time-header-content, & .rbc-timeslot-group': {
              borderColor: '#e2e8f0',
            },
            '& .rbc-today': {
              bgcolor: '#edf7fc',
            },
            '& .rbc-off-range-bg': {
              bgcolor: '#f8fafc',
            },
            '& .rbc-event': {
              boxShadow: '0 1px 2px rgba(15, 41, 66, 0.14)',
              transition: 'filter 0.15s ease, transform 0.15s ease',
              '&:hover': {
                filter: 'brightness(1.08)',
              },
            },
            '& .rbc-event.rbc-selected': {
              outline: '2px solid #0f2942',
              outlineOffset: 1,
            },
            '& .rbc-show-more': {
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.78rem',
              mt: 0.25,
            },
            '& .rbc-overlay': {
              borderRadius: 1.5,
              boxShadow: 4,
              border: '1px solid #e2e8f0',
              p: 1,
              zIndex: 10,
            },
            '& .rbc-overlay-header': {
              fontWeight: 700,
              color: 'primary.dark',
              borderBottom: '1px solid #e2e8f0',
              pb: 0.75,
              mb: 0.75,
            },
          }}
        >
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 5,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <Calendar<CalendarTrainingEvent>
            localizer={calendarLocalizer}
            events={events}
            view={currentView}
            onView={handleViewChange}
            date={currentDate}
            onNavigate={handleNavigate}
            views={CALENDAR_VIEWS}
            formats={CALENDAR_FORMATS}
            components={CALENDAR_COMPONENTS}
            eventPropGetter={eventPropGetter}
            tooltipAccessor={EMPTY_TOOLTIP_ACCESSOR}
            scrollToTime={DEFAULT_SCROLL_TIME}
            popup
            drilldownView={Views.DAY}
            dayLayoutAlgorithm="no-overlap"
            onSelectEvent={handleSelectEvent}
          />
        </Box>
      </Paper>

      <TrainingEventDialog
        open={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </Box>
  );
};
