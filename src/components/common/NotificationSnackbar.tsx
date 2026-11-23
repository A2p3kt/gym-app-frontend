/**
 * @fileoverview Reusable snackbar notification component for feedback alerts.
 */

import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { SnackbarCloseReason } from '@mui/material';
import type { AlertSeverity } from '../../types';

/**
 * Props for the NotificationSnackbar component.
 */
export interface NotificationSnackbarProps {
  /** Whether the notification snackbar is currently visible */
  open: boolean;
  /** Feedback message text to present to the user */
  message: string;
  /** Severity level influencing color and icon */
  severity: AlertSeverity;
  /** Callback fired when the notification should be closed */
  onClose: () => void;
  /** Optional auto-hide duration in milliseconds (defaults to 5000ms) */
  autoHideDuration?: number;
}

/**
 * Global feedback alert component positioned at bottom-right of the screen.
 * Automatically dismisses after the configured duration.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the snackbar alert.
 */
export const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 5000,
}) => {
  /**
   * MUI closes the snackbar on any click elsewhere on the page ("clickaway").
   * We ignore that so a success message is not dismissed by the same click
   * that closed a dialog; it still closes via its X button or the auto-hide timer.
   */
  const handleSnackbarClose = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          boxShadow: 3,
          fontWeight: 500,
          borderRadius: 2,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

