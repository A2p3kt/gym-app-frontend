/**
 * @fileoverview Dialog modal form for creating a new customer record.
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import type { CustomerFormData, AlertSeverity } from '../../types';
import { addCustomer } from '../../services/customerService';

/**
 * Props for the AddCustomerDialog component.
 */
export interface AddCustomerDialogProps {
  /** Controls modal visibility */
  open: boolean;
  /** Callback fired when the dialog is closed or cancelled */
  onClose: () => void;
  /** Callback fired after a customer has been successfully added to refresh the collection */
  onCustomerAdded: () => void;
  /** Callback to trigger feedback snackbar notifications */
  onNotify: (message: string, severity: AlertSeverity) => void;
}

/** Initial empty state for customer form fields */
const initialFormData: CustomerFormData = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  streetaddress: '',
  postcode: '',
  city: '',
};

/**
 * Modal form allowing personal trainers to register new client profiles with validation.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the Add Customer form dialog.
 */
export const AddCustomerDialog: React.FC<AddCustomerDialogProps> = ({
  open,
  onClose,
  onCustomerAdded,
  onNotify,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  /**
   * Updates an individual form field and clears its validation error.
   */
  const handleChange = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Validates form inputs ensuring required fields and email formatting.
   *
   * @returns True if all fields are valid, false otherwise.
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.streetaddress.trim()) {
      newErrors.streetaddress = 'Street address is required';
    }
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Resets form values and validation errors to initial defaults.
   */
  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  /**
   * Handles modal cancellation.
   */
  const handleCancel = () => {
    if (!submitting) {
      handleReset();
      onClose();
    }
  };

  /**
   * Submits the new customer to the REST backend.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const trimmedPayload: CustomerFormData = {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        streetaddress: formData.streetaddress.trim(),
        postcode: formData.postcode.trim(),
        city: formData.city.trim(),
      };

      await addCustomer(trimmedPayload);
      onNotify(`Customer ${trimmedPayload.firstname} ${trimmedPayload.lastname} successfully created.`, 'success');
      handleReset();
      onClose();
      onCustomerAdded();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create customer';
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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Add New Customer
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="First Name"
              required
              fullWidth
              size="small"
              value={formData.firstname}
              onChange={handleChange('firstname')}
              error={Boolean(errors.firstname)}
              helperText={errors.firstname}
              disabled={submitting}
              autoFocus
            />

            <TextField
              label="Last Name"
              required
              fullWidth
              size="small"
              value={formData.lastname}
              onChange={handleChange('lastname')}
              error={Boolean(errors.lastname)}
              helperText={errors.lastname}
              disabled={submitting}
            />

            <TextField
              label="Email"
              required
              type="email"
              fullWidth
              size="small"
              value={formData.email}
              onChange={handleChange('email')}
              error={Boolean(errors.email)}
              helperText={errors.email}
              disabled={submitting}
              sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
            />

            <TextField
              label="Phone"
              required
              fullWidth
              size="small"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              disabled={submitting}
              sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
            />

            <TextField
              label="Street Address"
              required
              fullWidth
              size="small"
              value={formData.streetaddress}
              onChange={handleChange('streetaddress')}
              error={Boolean(errors.streetaddress)}
              helperText={errors.streetaddress}
              disabled={submitting}
              sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}
            />

            <TextField
              label="Postcode"
              required
              fullWidth
              size="small"
              value={formData.postcode}
              onChange={handleChange('postcode')}
              error={Boolean(errors.postcode)}
              helperText={errors.postcode}
              disabled={submitting}
            />

            <TextField
              label="City"
              required
              fullWidth
              size="small"
              value={formData.city}
              onChange={handleChange('city')}
              error={Boolean(errors.city)}
              helperText={errors.city}
              disabled={submitting}
            />
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
            color="primary"
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <PersonAddIcon />}
          >
            Save Customer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
