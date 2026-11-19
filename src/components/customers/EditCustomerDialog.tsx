/**
 * @fileoverview Dialog modal form for editing an existing customer's contact and address details.
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
import EditIcon from '@mui/icons-material/Edit';
import type { Customer, CustomerFormData, AlertSeverity } from '../../types';
import { updateCustomer } from '../../services/customerService';

/**
 * Props for the EditCustomerDialog component.
 */
export interface EditCustomerDialogProps {
  /** Controls modal visibility */
  open: boolean;
  /** The customer record being edited, or null if none selected */
  customer: Customer | null;
  /** Callback fired when the dialog is closed or cancelled */
  onClose: () => void;
  /** Callback fired after a customer has been successfully updated to refresh the list */
  onCustomerUpdated: () => void;
  /** Callback to trigger feedback snackbar notifications */
  onNotify: (message: string, severity: AlertSeverity) => void;
}

/**
 * Modal form allowing trainers to update existing customer profiles.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the Edit Customer form dialog.
 */
export const EditCustomerDialog: React.FC<EditCustomerDialogProps> = ({
  open,
  customer,
  onClose,
  onCustomerUpdated,
  onNotify,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>(() => ({
    firstname: customer?.firstname || '',
    lastname: customer?.lastname || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    streetaddress: customer?.streetaddress || '',
    postcode: customer?.postcode || '',
    city: customer?.city || '',
  }));
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
   * Handles modal cancellation.
   */
  const handleCancel = () => {
    if (!submitting) {
      onClose();
    }
  };

  /**
   * Submits the updated customer data to the REST backend.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const customerUrl = customer._links?.self?.href || customer._links?.customer?.href;
    if (!customerUrl) {
      onNotify('Unable to update: Missing canonical customer URL link.', 'error');
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

      await updateCustomer(customerUrl, trimmedPayload);
      onNotify(`Customer ${trimmedPayload.firstname} ${trimmedPayload.lastname} successfully updated.`, 'success');
      onClose();
      onCustomerUpdated();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update customer';
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
          <EditIcon color="primary" />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            Edit Customer
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
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <EditIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
