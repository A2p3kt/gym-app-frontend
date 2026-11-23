/**
 * @fileoverview Shared customer form dialog used by both "Add Customer" and "Edit Customer".
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
} from '@mui/material';
import type { CustomerFormData, NotifyFn } from '../../types';
import {
  trimCustomerForm,
  validateCustomerForm,
  type CustomerFormErrors,
} from '../../utils/customerUtils';
import { getErrorMessage } from '../../utils/errors';

/**
 * Props for the CustomerFormDialog component.
 */
export interface CustomerFormDialogProps {
  /** Controls modal visibility */
  open: boolean;
  /** Dialog heading, e.g. "Add New Customer" */
  title: string;
  /** Label of the submit button, e.g. "Save Customer" */
  submitLabel: string;
  /** Icon shown next to the title and inside the submit button */
  icon: React.ReactNode;
  /** Values the form starts with (blank for add, the customer's data for edit) */
  initialValues: CustomerFormData;
  /**
   * Performs the API call with the validated, trimmed values.
   * Should throw on failure; the dialog then shows the error and stays open.
   */
  onSubmit: (data: CustomerFormData) => Promise<void>;
  /** Message shown if `onSubmit` throws without a message of its own */
  errorFallbackMessage: string;
  /** Callback fired when the dialog should close (cancel or successful save) */
  onClose: () => void;
  /** Callback to trigger feedback snackbar notifications */
  onNotify: NotifyFn;
}

/**
 * Layout of the form: one entry per field, in display order.
 * `fullRow` fields span both columns of the two-column grid on wider screens.
 */
const FIELDS: ReadonlyArray<{
  name: keyof CustomerFormData;
  label: string;
  type?: string;
  fullRow?: boolean;
}> = [
  { name: 'firstname', label: 'First Name' },
  { name: 'lastname', label: 'Last Name' },
  { name: 'email', label: 'Email', type: 'email', fullRow: true },
  { name: 'phone', label: 'Phone', type: 'tel', fullRow: true },
  { name: 'streetaddress', label: 'Street Address', fullRow: true },
  { name: 'postcode', label: 'Postcode' },
  { name: 'city', label: 'City' },
];

/**
 * Modal form with validation for a customer's contact and address details.
 * The parent decides what "save" means through `onSubmit` (POST for add, PUT for edit).
 *
 * The parent should mount this dialog only while it is open (`{open && <Dialog/>}`),
 * so the form state starts fresh from `initialValues` every time it opens.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the customer form dialog.
 */
export const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({
  open,
  title,
  submitLabel,
  icon,
  initialValues,
  onSubmit,
  errorFallbackMessage,
  onClose,
  onNotify,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>(initialValues);
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  /**
   * Returns a change handler for one field; also clears that field's error as the user types.
   */
  const handleChange = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /** Closes the dialog unless a save is in progress. */
  const handleCancel = () => {
    if (!submitting) {
      onClose();
    }
  };

  /** Validates, then hands the trimmed values to the parent's `onSubmit`. */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateCustomerForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(trimCustomerForm(formData));
      onClose();
    } catch (err) {
      onNotify(getErrorMessage(err, errorFallbackMessage), 'error');
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
      aria-labelledby="customer-form-dialog-title"
      slotProps={{ paper: { sx: { borderRadius: 2, p: 1 } } }}
    >
      {/* noValidate: we show our own validation messages instead of the browser's popups */}
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="customer-form-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', color: 'primary.main' }}>{icon}</Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {FIELDS.map((field, index) => (
              <TextField
                key={field.name}
                label={field.label}
                type={field.type}
                required
                fullWidth
                size="small"
                value={formData[field.name]}
                onChange={handleChange(field.name)}
                error={Boolean(errors[field.name])}
                helperText={errors[field.name]}
                disabled={submitting}
                autoFocus={index === 0}
                sx={field.fullRow ? { gridColumn: { xs: '1', sm: 'span 2' } } : undefined}
              />
            ))}
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
            color="primary"
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : icon}
          >
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
