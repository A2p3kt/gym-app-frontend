/**
 * @fileoverview Dialog modal form for creating a new customer record.
 */

import React from 'react';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import type { CustomerFormData, NotifyFn } from '../../types';
import { addCustomer } from '../../services/customerService';
import { EMPTY_CUSTOMER_FORM } from '../../utils/customerUtils';
import { CustomerFormDialog } from './CustomerFormDialog';

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
  onNotify: NotifyFn;
}

/**
 * Modal form allowing personal trainers to register new client profiles (POST /customers).
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
  /** Creates the customer; errors propagate to CustomerFormDialog, which reports them. */
  const handleSubmit = async (data: CustomerFormData) => {
    await addCustomer(data);
    onNotify(`Customer ${data.firstname} ${data.lastname} successfully created.`, 'success');
    onCustomerAdded();
  };

  return (
    <CustomerFormDialog
      open={open}
      title="Add New Customer"
      submitLabel="Save Customer"
      icon={<PersonAddIcon />}
      initialValues={EMPTY_CUSTOMER_FORM}
      onSubmit={handleSubmit}
      errorFallbackMessage="Failed to create customer"
      onClose={onClose}
      onNotify={onNotify}
    />
  );
};
