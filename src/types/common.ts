/**
 * @fileoverview Shared UI-level types used across pages and components.
 */

/** Severity levels supported by the global notification snackbar. */
export type AlertSeverity = 'success' | 'error' | 'info' | 'warning';

/**
 * State of the global notification snackbar rendered by `App`.
 */
export interface NotificationFeedback {
  /** Whether the snackbar is currently visible */
  open: boolean;
  /** Message text shown to the user */
  message: string;
  /** Severity controlling the snackbar color and icon */
  severity: AlertSeverity;
}

/**
 * Callback signature used by every page/dialog to show a snackbar notification.
 * Implemented once in `App` and passed down as the `onNotify` prop.
 */
export type NotifyFn = (message: string, severity: AlertSeverity) => void;

/** Identifiers of the four top-level views reachable from the navbar. */
export type NavigationTab = 'customers' | 'trainings' | 'calendar' | 'statistics';
