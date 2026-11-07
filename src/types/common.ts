export type AlertSeverity = 'success' | 'error' | 'info' | 'warning';

export interface NotificationFeedback {
  open: boolean;
  message: string;
  severity: AlertSeverity;
}

export type NavigationTab = 'customers' | 'trainings' | 'calendar' | 'statistics';

