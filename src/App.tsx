import { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
} from '@mui/material';
import type { NavigationTab, AlertSeverity } from './types';
import { Navbar } from './components/common/Navbar';
import { NotificationSnackbar } from './components/common/NotificationSnackbar';
import { CustomersPage } from './pages/CustomersPage';
import { TrainingsPage } from './pages/TrainingsPage';
import { CalendarPage } from './pages/CalendarPage';
import { StatisticsPage } from './pages/StatisticsPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a365d',
      light: '#2a4365',
      dark: '#0f2942',
    },
    secondary: {
      main: '#00a3c4',
      light: '#319795',
      dark: '#007791',
    },
    background: {
      default: '#f7fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('customers');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertSeverity;
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [dbResetCounter, setDbResetCounter] = useState(0);

  const handleNotify = (message: string, severity: AlertSeverity) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleDatabaseReset = () => {
    setDbResetCounter((prev) => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onNotify={handleNotify}
          onDatabaseReset={handleDatabaseReset}
        />

        <Container maxWidth="xl" component="main" sx={{ flexGrow: 1, py: 2 }}>
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
