/**
 * @fileoverview Dialog modal form for scheduling and adding a new training workout session.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import dayjs from 'dayjs';
import type { Customer, NewTrainingPayload, AlertSeverity } from '../../types';
import { getCustomers } from '../../services/customerService';
import { addTraining } from '../../services/trainingService';

/**
 * Props for the AddTrainingDialog component.
 */
export interface AddTrainingDialogProps {
  /** Controls modal visibility */
  open: boolean;
  /** Optional customer to pre-select when opened directly from a customer table row */
  initialCustomer?: Customer | null;
  /** Callback fired when dialog is cancelled or closed */
  onClose: () => void;
  /** Callback fired after training is successfully scheduled */
  onTrainingAdded: () => void;
  /** Callback to trigger feedback snackbar notifications */
  onNotify: (message: string, severity: AlertSeverity) => void;
}

/** Form data structure for adding training */
interface TrainingFormState {
  customerHref: string;
  activity: string;
  duration: string;
  date: string;
}

/** Pre-set popular activities for convenience */
const POPULAR_ACTIVITIES = [
  'Gym Training',
  'Spinning',
  'Jogging',
  'Zumba',
  'Pilates',
  'Boxing',
  'Swimming',
  'CrossFit',
  'Yoga',
];

/**
 * Modal form allowing trainers to record new workouts associated with clients.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the Add Training form dialog.
 */
export const AddTrainingDialog: React.FC<AddTrainingDialogProps> = ({
  open,
  initialCustomer,
  onClose,
  onTrainingAdded,
  onNotify,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formState, setFormState] = useState<TrainingFormState>(() => ({
    customerHref: initialCustomer?._links?.self?.href || initialCustomer?._links?.customer?.href || '',
    activity: '',
    duration: '45',
    date: dayjs().format('YYYY-MM-DDTHH:mm'),
  }));

  const [errors, setErrors] = useState<Partial<Record<keyof TrainingFormState, string>>>({});

  // Fetch the customer options for dropdown selection
  useEffect(() => {
    let isMounted = true;
    getCustomers()
      .then((data) => {
        if (isMounted) {
          setCustomers(data);
          setLoadingCustomers(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load customer list';
          onNotify(message, 'error');
          setLoadingCustomers(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onNotify]);

  /**
   * Updates form field value and clears corresponding field error.
   */
  const handleFieldChange = (field: keyof TrainingFormState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Validates form fields before submission.
   *
   * @returns True if valid, false otherwise.
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TrainingFormState, string>> = {};

    if (!formState.customerHref) {
      newErrors.customerHref = 'Please select a customer for this training session';
    }
    if (!formState.activity.trim()) {
      newErrors.activity = 'Activity name is required';
    }
    const parsedDuration = Number(formState.duration);
    if (!formState.duration.trim() || isNaN(parsedDuration) || parsedDuration <= 0) {
      newErrors.duration = 'Please specify a positive duration in minutes';
    }
    if (!formState.date) {
      newErrors.date = 'Date and time are required';
    } else if (!dayjs(formState.date).isValid()) {
      newErrors.date = 'Invalid date and time selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles modal cancellation.
   */
  const handleCancel = () => {
    if (!submitting) {
      onClose();
    }
  };

  /**
   * Submits the new training session to the REST service.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload: NewTrainingPayload = {
        date: dayjs(formState.date).toISOString(),
        activity: formState.activity.trim(),
        duration: Math.round(Number(formState.duration)),
        customer: formState.customerHref,
      };

      await addTraining(payload);
      onNotify(`Training "${payload.activity}" scheduled successfully.`, 'success');
      onClose();
      onTrainingAdded();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to schedule training';
      onNotify(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            p: 1,
          },
        },
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsRunIcon color="secondary" />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Schedule New Training
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              select
              label="Associated Customer"
              required
              fullWidth
              size="small"
              value={formState.customerHref}
              onChange={handleFieldChange('customerHref')}
              error={Boolean(errors.customerHref)}
              helperText={errors.customerHref || (loadingCustomers ? 'Loading clients...' : 'Select client for this workout')}
              disabled={submitting || Boolean(initialCustomer)}
            >
              {loadingCustomers ? (
                <MenuItem disabled value="">
                  <em>Loading customers...</em>
                </MenuItem>
              ) : customers.length === 0 ? (
                <MenuItem disabled value="">
                  <em>No registered customers found</em>
                </MenuItem>
              ) : (
                customers.map((c) => {
                  const href = c._links?.self?.href || c._links?.customer?.href;
                  return (
                    <MenuItem key={href} value={href}>
                      {c.firstname} {c.lastname} ({c.email})
                    </MenuItem>
                  );
                })
              )}
            </TextField>

            <TextField
              label="Activity"
              required
              fullWidth
              size="small"
              placeholder="e.g. Spinning, Jogging, Gym"
              value={formState.activity}
              onChange={handleFieldChange('activity')}
              error={Boolean(errors.activity)}
              helperText={errors.activity || 'Type custom activity or select a quick option below'}
              disabled={submitting}
              autoFocus
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: -1 }}>
              {POPULAR_ACTIVITIES.map((act) => (
                <Button
                  key={act}
                  size="small"
                  variant="outlined"
                  onClick={() => setFormState((prev) => ({ ...prev, activity: act }))}
                  disabled={submitting}
                  sx={{
                    borderRadius: 4,
                    fontSize: '0.75rem',
                    py: 0.2,
                    px: 1,
                    textTransform: 'none',
                    bgcolor: formState.activity === act ? 'primary.light' : 'transparent',
                    color: formState.activity === act ? 'common.white' : 'text.primary',
                  }}
                >
                  {act}
                </Button>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Duration (minutes)"
                required
                type="number"
                fullWidth
                size="small"
                value={formState.duration}
                onChange={handleFieldChange('duration')}
                error={Boolean(errors.duration)}
                helperText={errors.duration}
                disabled={submitting}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                  },
                }}
              />

              <TextField
                label="Date & Time"
                required
                type="datetime-local"
                fullWidth
                size="small"
                value={formState.date}
                onChange={handleFieldChange('date')}
                error={Boolean(errors.date)}
                helperText={errors.date}
                disabled={submitting}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCancel}
            disabled={submitting}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="contained"
            color="secondary"
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <DirectionsRunIcon />}
          >
            Schedule Workout
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};