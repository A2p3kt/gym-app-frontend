/**
 * @fileoverview Root application shell: theme, navbar, active page and the global notification snackbar.
 */

import { lazy, Suspense, useCallback, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, CircularProgress } from '@mui/material';
import type { NavigationTab, NotificationFeedback, NotifyFn } from './types';
import { appTheme } from './theme';
import { Navbar } from './components/common/Navbar';
import { NotificationSnackbar } from './components/common/NotificationSnackbar';

// Pages are lazy-loaded so each heavy library (AG Grid, React Big Calendar, Recharts)
// is downloaded only when its page is first opened, instead of in one large bundle.
// `.then(...)` adapts our named exports to the default export that React.lazy expects.
const CustomersPage = lazy(() =>
  import('./pages/CustomersPage').then((m) => ({ default: m.CustomersPage }))
);
const TrainingsPage = lazy(() =>
  import('./pages/TrainingsPage').then((m) => ({ default: m.TrainingsPage }))
);
const CalendarPage = lazy(() =>
  import('./pages/CalendarPage').then((m) => ({ default: m.CalendarPage }))
);
const StatisticsPage = lazy(() =>
  import('./pages/StatisticsPage').then((m) => ({ default: m.StatisticsPage }))
);

/** Spinner shown while a lazy page's code is being downloaded. */
const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
    <CircularProgress />
  </Box>
);

/**
 * Root component. Owns the two pieces of app-wide state:
 * - which tab is active (simple view switcher, no router needed for four views), and
 * - the snackbar notification shown after any create/update/delete/error.
 *
 * @returns The full application layout.
 */
function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('customers');
  const [notification, setNotification] = useState<NotificationFeedback>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Incremented after "Reset Demo DB". It is part of each page's `key`, so the
  // active page remounts and refetches fresh data from the reset database.
  const [dbResetCounter, setDbResetCounter] = useState(0);

  // useCallback keeps this function identity stable across renders. Pages list
  // `onNotify` as an effect dependency, so an unstable function would make every
  // notification trigger a refetch (and an infinite loop if the fetch keeps failing).
  const handleNotify = useCallback<NotifyFn>((message, severity) => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const handleDatabaseReset = useCallback(() => {
    setDbResetCounter((prev) => prev + 1);
  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onNotify={handleNotify}
          onDatabaseReset={handleDatabaseReset}
        />

        <Container maxWidth="xl" component="main" sx={{ flexGrow: 1, py: 2 }}>
          <Suspense fallback={<PageLoader />}>
            {currentTab === 'customers' && (
              <CustomersPage key={`customers-${dbResetCounter}`} onNotify={handleNotify} />
            )}
            {currentTab === 'trainings' && (
              <TrainingsPage key={`trainings-${dbResetCounter}`} onNotify={handleNotify} />
            )}
            {currentTab === 'calendar' && (
              <CalendarPage key={`calendar-${dbResetCounter}`} onNotify={handleNotify} />
            )}
            {currentTab === 'statistics' && (
              <StatisticsPage key={`statistics-${dbResetCounter}`} onNotify={handleNotify} />
            )}
          </Suspense>
        </Container>

        <NotificationSnackbar
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          onClose={handleCloseNotification}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
