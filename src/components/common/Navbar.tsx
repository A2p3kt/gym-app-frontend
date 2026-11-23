/**
 * @fileoverview Main navigation bar component with tab switching and database reset functionality.
 */

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import type { NavigationTab, NotifyFn } from '../../types';
import { resetDatabase } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';
import { ConfirmDialog } from './ConfirmDialog';

/**
 * Props for the Navbar component.
 */
export interface NavbarProps {
  /** The currently active navigation tab identifier */
  currentTab: NavigationTab;
  /** Callback fired when user clicks a navigation tab */
  onTabChange: (tab: NavigationTab) => void;
  /** Callback to trigger feedback snackbar notifications */
  onNotify: NotifyFn;
  /** Callback fired when remote database has been successfully reset */
  onDatabaseReset: () => void;
}

/**
 * Top application header containing the brand logo, navigation tabs, and system reset utility.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the AppBar and navigation tabs.
 */
export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onNotify,
  onDatabaseReset,
}) => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  /** MUI Tabs passes the clicked tab's `value`, which is one of our NavigationTab ids. */
  const handleTabChange = (_event: React.SyntheticEvent, newTab: NavigationTab) => {
    onTabChange(newTab);
  };

  /** Calls POST /reset, then tells App to remount the current page so it refetches. */
  const handleConfirmReset = async () => {
    setResetting(true);
    try {
      await resetDatabase();
      onNotify('Demo database successfully reset to sample seed data.', 'success');
      setResetDialogOpen(false);
      onDatabaseReset();
    } catch (err) {
      onNotify(getErrorMessage(err, 'Failed to reset database'), 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar sx={{ justifyContent: 'space-between', flexWrap: { xs: 'wrap', md: 'nowrap' }, py: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
            <FitnessCenterIcon sx={{ fontSize: 28, color: 'secondary.light' }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              Personal Trainer Portal
            </Typography>
          </Box>

          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            // Scrollable so the four tabs never overflow the screen on phones.
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="main navigation tabs"
            sx={{
              minHeight: 48,
              // On phones the tabs drop to their own full-width row below the title and reset button.
              width: { xs: '100%', md: 'auto' },
              order: { xs: 3, md: 0 },
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              },
            }}
          >
            <Tab
              value="customers"
              icon={<PeopleIcon fontSize="small" />}
              iconPosition="start"
              label="Customers"
            />
            <Tab
              value="trainings"
              icon={<DirectionsRunIcon fontSize="small" />}
              iconPosition="start"
              label="Trainings"
            />
            <Tab
              value="calendar"
              icon={<CalendarMonthIcon fontSize="small" />}
              iconPosition="start"
              label="Calendar"
            />
            <Tab
              value="statistics"
              icon={<BarChartIcon fontSize="small" />}
              iconPosition="start"
              label="Statistics"
            />
          </Tabs>

          <Box sx={{ my: { xs: 1, md: 0 } }}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={resetting ? <CircularProgress size={16} color="inherit" /> : <RestartAltIcon />}
              onClick={() => setResetDialogOpen(true)}
              disabled={resetting}
              sx={{
                borderColor: 'rgba(255,255,255,0.4)',
                '&:hover': {
                  borderColor: 'common.white',
                  bgcolor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              Reset Demo DB
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <ConfirmDialog
        open={resetDialogOpen}
        title="Reset Demo Database?"
        message="Are you sure you want to reset the database? All custom modifications will be discarded and restored to the default sample records."
        confirmText="Reset Database"
        confirmColor="warning"
        loading={resetting}
        onConfirm={handleConfirmReset}
        onCancel={() => setResetDialogOpen(false)}
      />
    </>
  );
};

