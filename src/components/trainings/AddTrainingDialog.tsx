/**
 * @fileoverview Dialog modal form for scheduling and adding a new training workout session.
 */

import React, { useState } from 'react';
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
import type { Customer, NewTrainingPayload, NotifyFn } from '../../types';
import { getCustomers } from '../../services/customerService';
import { addTraining } from '../../services/trainingService';
import { useApiData } from '../../hooks/useApiData';
import { getCustomerHref } from '../../utils/customerUtils';
import { getErrorMessage } from '../../utils/errors';

/**
 * Props for the AddTrainingDialog component.
 */
export interface AddTrainingDialogProps {
  /** Controls modal visibility */
  open: boolean;
  /** Optional customer to pre-select (and lock) when opened from a customer table row */
  initialCustomer?: Customer | null;
  /** Callback fired when dialog is cancelled or closed */
  onClose: () => void;
  /** Optional callback fired after training is successfully scheduled (e.g. to refresh a list) */
  onTrainingAdded?: () => void;
  /** Callback to trigger feedback snackbar notifications */
  onNotify: NotifyFn;
}

/**
 * Raw form values. Everything is a string because that is what the inputs produce;
 * values are converted to the API types only when building the payload.
 */
interface TrainingFormState {
  /** Self link of the selected customer */
  customerHref: string;
  /** Activity name */
  activity: string;
  /** Duration in minutes, as typed */
  duration: string;
  /** Local date-time from the `datetime-local` input, format "YYYY-MM-DDTHH:mm" */
  date: string;
}

/** Validation messages keyed by form field. */
type TrainingFormErrors = Partial<Record<keyof TrainingFormState, string>>;

/** Pre-set popular activities shown as quick-pick buttons under the Activity field. */
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

/** Format produced and accepted by `<input type="datetime-local">`. */
const DATETIME_LOCAL_FORMAT = 'YYYY-MM-DDTHH:mm';

/**
 * Validates the training form.
 *
 * @param form - Current form values.
 * @returns Errors object; empty when the form is valid.
 */
function validateTrainingForm(form: TrainingFormState): TrainingFormErrors {
  const errors: TrainingFormErrors = {};

  if (!form.customerHref) {
    errors.customerHref = 'Please select a customer for this training session';
  }
  if (!form.activity.trim()) {
    errors.activity = 'Activity name is required';
  }
  const duration = Number(form.duration);
  if (!form.duration.trim() || !Number.isInteger(duration) || duration <= 0) {
    errors.duration = 'Please enter a whole number of minutes greater than 0';
  }
  if (!form.date) {
    errors.date = 'Date and time are required';
  } else if (!dayjs(form.date).isValid()) {
    errors.date = 'Invalid date and time selected';
  }

  return errors;
}

/**
 * Modal form allowing trainers to record new workouts associated with clients (POST /trainings).
 * Mount it only while open so the form starts fresh each time.
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
  const { data: customers, loading: loadingCustomers } = useApiData(
    getCustomers,
    [],
    onNotify,
    'Failed to load customer list'
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formState, setFormState] = useState<TrainingFormState>(() => ({
    customerHref: initialCustomer ? getCustomerHref(initialCustomer) : '',
    activity: '',
    duration: '45',
    date: dayjs().format(DATETIME_LOCAL_FORMAT),
  }));
  const [errors, setErrors] = useState<TrainingFormErrors>({});

  // When opened from a customer row, the customer is fixed, so the dropdown only needs
  // that one option. This also avoids MUI's "out-of-range value" warning that occurs when
  // the select's value is not yet among the options while the full list is loading.
  const customerOptions: Customer[] = initialCustomer ? [initialCustomer] : customers;
  const showLoadingOption = !initialCustomer && loadingCustomers;

  /** Sets one field and clears its validation error. */
  const setField = (field: keyof TrainingFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /** Returns an input change handler bound to one field. */
  const handleFieldChange = (field: keyof TrainingFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setField(field, e.target.value);

  /** Closes the dialog unless a save is in progress. */
  const handleCancel = () => {
    if (!submitting) {
      onClose();
    }
  };

  /** Validates and submits the new training session to the REST service. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateTrainingForm(formState);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const payload: NewTrainingPayload = {
        // The input gives local time; toISOString() converts it to UTC for the API.
        date: dayjs(formState.date).toISOString(),
        activity: formState.activity.trim(),
        duration: Number(formState.duration),
        customer: formState.customerHref,
      };

      await addTraining(payload);
      onNotify(`Training "${payload.activity}" scheduled successfully.`, 'success');
      onClose();
      onTrainingAdded?.();
    } catch (err) {
      onNotify(getErrorMessage(err, 'Failed to schedule training'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /** Helper text under the customer select. */
  const customerHelperText =
    errors.customerHref || (showLoadingOption ? 'Loading clients...' : 'Select client for this workout');

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-training-dialog-title"
      slotProps={{ paper: { sx: { borderRadius: 2, p: 1 } } }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="add-training-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              helperText={customerHelperText}
              disabled={submitting || Boolean(initialCustomer)}
            >
              {showLoadingOption && (
                <MenuItem disabled value="">
                  <em>Loading customers...</em>
                </MenuItem>
              )}
              {!showLoadingOption && customerOptions.length === 0 && (
                <MenuItem disabled value="">
                  <em>No registered customers found</em>
                </MenuItem>
              )}
              {customerOptions.map((c) => {
                const href = getCustomerHref(c);
                return (
                  <MenuItem key={href} value={href}>
                    {c.firstname} {c.lastname} ({c.email})
                  </MenuItem>
                );
              })}
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

            {/* Quick-pick buttons; the selected one is highlighted */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: -1 }}>
              {POPULAR_ACTIVITIES.map((act) => {
                const isSelected = formState.activity === act;
                return (
                  <Button
                    key={act}
                    size="small"
                    variant="outlined"
                    aria-pressed={isSelected}
                    onClick={() => setField('activity', act)}
                    disabled={submitting}
                    sx={{
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      py: 0.2,
                      px: 1,
                      bgcolor: isSelected ? 'primary.light' : 'transparent',
                      color: isSelected ? 'common.white' : 'text.primary',
                    }}
                  >
                    {act}
                  </Button>
                );
              })}
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
                  htmlInput: { min: 1, step: 1 },
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
                  // Keep the label above the input; the native picker always shows a placeholder.
                  inputLabel: { shrink: true },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCancel} disabled={submitting} variant="outlined" color="inherit">
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
