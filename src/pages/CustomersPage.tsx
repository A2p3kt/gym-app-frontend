/**
 * @fileoverview Customer management list page displaying sortable and filterable customer data with full CRUD actions.
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import type { Customer, NotifyFn } from '../types';
import { getCustomers, deleteCustomer } from '../services/customerService';
import { useApiData } from '../hooks/useApiData';
import { gridTheme } from '../gridSetup';
import { exportCustomersToCsv } from '../utils/csvExport';
import { getCustomerHref } from '../utils/customerUtils';
import { getErrorMessage } from '../utils/errors';
import { formatCustomerFullName } from '../utils/formatters';
import { AddCustomerDialog, EditCustomerDialog } from '../components/customers';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AddTrainingDialog } from '../components/trainings/AddTrainingDialog';

/**
 * Props for the CustomersPage component.
 */
export interface CustomersPageProps {
  /** Callback to trigger feedback snackbar notifications */
  onNotify: NotifyFn;
}

/**
 * Which dialog (if any) is open, and for which customer.
 * Using one state value instead of several booleans guarantees only one dialog is open at a time.
 */
type CustomerDialogState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; customer: Customer }
  | { type: 'delete'; customer: Customer }
  | { type: 'addTraining'; customer: Customer };

/** Shared sizing for the plain text columns. */
const TEXT_COLUMN: ColDef<Customer> = { sortable: true, filter: true, flex: 1, minWidth: 120 };

/**
 * Customer List View presenting all clients in a responsive, sortable AG Grid table with full CRUD capabilities.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the customer management table.
 */
export const CustomersPage: React.FC<CustomersPageProps> = ({ onNotify }) => {
  const { data: customers, loading, reload } = useApiData(
    getCustomers,
    [],
    onNotify,
    'Failed to fetch customers'
  );
  const [quickFilterText, setQuickFilterText] = useState<string>('');
  const [dialog, setDialog] = useState<CustomerDialogState>({ type: 'none' });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const closeDialog = () => setDialog({ type: 'none' });

  /**
   * Deletes the customer after the user confirmed in the dialog.
   * The backend also deletes all of that customer's trainings (cascade).
   */
  const handleConfirmDelete = async () => {
    if (dialog.type !== 'delete') return;
    const { customer } = dialog;

    const customerUrl = getCustomerHref(customer);
    if (!customerUrl) {
      onNotify('Unable to delete customer: Missing link reference.', 'error');
      closeDialog();
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCustomer(customerUrl);
      onNotify(`Customer ${formatCustomerFullName(customer)} deleted successfully.`, 'success');
      closeDialog();
      reload();
    } catch (err) {
      onNotify(getErrorMessage(err, 'Failed to delete customer'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  /** Downloads all customers as a CSV file (data columns only, no links or actions). */
  const handleExportCsv = () => {
    try {
      exportCustomersToCsv(customers);
      onNotify('Customer records exported to CSV successfully.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Failed to export CSV'), 'error');
    }
  };

  /**
   * Column definitions for the customer AG Grid.
   * Memoized so AG Grid does not rebuild its columns on every render.
   * `setDialog` is a state setter, which React guarantees is stable, so no dependencies are needed.
   */
  const columnDefs = useMemo<ColDef<Customer>[]>(() => [
    { ...TEXT_COLUMN, field: 'firstname', headerName: 'First Name' },
    { ...TEXT_COLUMN, field: 'lastname', headerName: 'Last Name' },
    { ...TEXT_COLUMN, field: 'streetaddress', headerName: 'Street Address', flex: 1.4, minWidth: 160 },
    { field: 'postcode', headerName: 'Postcode', sortable: true, filter: true, width: 110 },
    { ...TEXT_COLUMN, field: 'city', headerName: 'City' },
    { ...TEXT_COLUMN, field: 'email', headerName: 'Email', flex: 1.4, minWidth: 180 },
    { ...TEXT_COLUMN, field: 'phone', headerName: 'Phone', minWidth: 130 },
    {
      headerName: 'Actions',
      sortable: false,
      filter: false,
      pinned: 'right',
      width: 145,
      cellRenderer: (params: ICellRendererParams<Customer>) => {
        const customer = params.data;
        if (!customer) return null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', gap: 0.5 }}>
            <Tooltip title="Add Training Session">
              <IconButton
                size="small"
                color="secondary"
                aria-label={`Add training for ${formatCustomerFullName(customer)}`}
                onClick={() => setDialog({ type: 'addTraining', customer })}
              >
                <DirectionsRunIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Customer">
              <IconButton
                size="small"
                color="primary"
                aria-label={`Edit ${formatCustomerFullName(customer)}`}
                onClick={() => setDialog({ type: 'edit', customer })}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Customer">
              <IconButton
                size="small"
                color="error"
                aria-label={`Delete ${formatCustomerFullName(customer)}`}
                onClick={() => setDialog({ type: 'delete', customer })}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({ resizable: true }), []);

  const customerToDelete = dialog.type === 'delete' ? dialog.customer : null;

  return (
    <Box sx={{ py: 2 }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 2, borderRadius: 2 }} elevation={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
              Customers Directory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total clients registered: {customers.length}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => setDialog({ type: 'add' })}
            >
              Add Customer
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCsv}
              disabled={loading || customers.length === 0}
            >
              Export CSV
            </Button>
            <TextField
              size="small"
              placeholder="Search customers..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
                htmlInput: { 'aria-label': 'Search customers' },
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
            <Tooltip title="Refresh Customers">
              <span>
                <IconButton onClick={reload} disabled={loading} aria-label="Refresh customers" color="primary">
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ height: 600, width: '100%', position: 'relative' }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 2,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <AgGridReact<Customer>
            theme={gridTheme}
            rowData={customers}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            // The self link is the customer's unique identity (the API exposes no id field).
            getRowId={(params) => getCustomerHref(params.data)}
            quickFilterText={quickFilterText}
            pagination
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            overlayNoRowsTemplate="No customers found. Add one or reset the demo database."
          />
        </Box>
      </Paper>

      {/* Dialogs are mounted only while open, so each one starts with fresh form state. */}
      {dialog.type === 'add' && (
        <AddCustomerDialog open onClose={closeDialog} onCustomerAdded={reload} onNotify={onNotify} />
      )}

      {dialog.type === 'edit' && (
        <EditCustomerDialog
          open
          customer={dialog.customer}
          onClose={closeDialog}
          onCustomerUpdated={reload}
          onNotify={onNotify}
        />
      )}

      {dialog.type === 'addTraining' && (
        <AddTrainingDialog
          open
          initialCustomer={dialog.customer}
          onClose={closeDialog}
          onNotify={onNotify}
        />
      )}

      <ConfirmDialog
        open={dialog.type === 'delete'}
        title="Delete Customer?"
        message={
          customerToDelete
            ? `Are you sure you want to delete ${formatCustomerFullName(customerToDelete)}? All associated training sessions will also be deleted permanently.`
            : 'Are you sure you want to delete this customer?'
        }
        confirmText="Delete Customer"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) closeDialog();
        }}
      />
    </Box>
  );
};
