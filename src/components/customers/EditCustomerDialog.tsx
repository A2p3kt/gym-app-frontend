/**
 * @fileoverview Dialog modal form for editing an existing customer's contact and address details.
 */

import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import type { Customer, CustomerFormData, NotifyFn } from '../../types';
import { updateCustomer } from '../../services/customerService';
import { customerToFormData, getCustomerHref } from '../../utils/customerUtils';
import { CustomerFormDialog } from './CustomerFormDialog';

/**
 * Props for the EditCustomerDialog component.
 */
export interface EditCustomerDialogProps {
  /** Controls modal visibility */
  open: boolean;
  /** The customer record being edited */
  customer: Customer;
  /** Callback fired when the dialog is closed or cancelled */
  onClose: () => void;
  /** Callback fired after a customer has been successfully updated to refresh the list */
  onCustomerUpdated: () => void;
  /** Callback to trigger feedback snackbar notifications */
  onNotify: NotifyFn;
}

/**
 * Modal form allowing trainers to update existing customer profiles (PUT to the customer's self link).
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
  /** Saves the changes; errors propagate to CustomerFormDialog, which reports them. */
  const handleSubmit = async (data: CustomerFormData) => {
    const customerUrl = getCustomerHref(customer);
    if (!customerUrl) {
      throw new Error('Unable to update: missing customer link.');
    }

    await updateCustomer(customerUrl, data);
    onNotify(`Customer ${data.firstname} ${data.lastname} successfully updated.`, 'success');
    onCustomerUpdated();
  };

  return (
    <CustomerFormDialog
      open={open}
      title="Edit Customer"
      submitLabel="Save Changes"
      icon={<EditIcon />}
      initialValues={customerToFormData(customer)}
      onSubmit={handleSubmit}
      errorFallbackMessage="Failed to update customer"
      onClose={onClose}
      onNotify={onNotify}
    />
  );
};
