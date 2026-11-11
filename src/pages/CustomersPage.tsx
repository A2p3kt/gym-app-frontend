/**
 * @fileoverview Customer management list page displaying sortable and filterable customer data with full CRUD actions.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import type { Customer, AlertSeverity } from '../types';
import { getCustomers, deleteCustomer } from '../services/customerService';
import { exportCustomersToCsv } from '../utils/csvExport';
import { AddCustomerDialog } from '../components/customers/AddCustomerDialog';
import { EditCustomerDialog } from '../components/customers/EditCustomerDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AddTrainingDialog } from '../components/trainings/AddTrainingDialog';

/**
 * Props for the CustomersPage component.
 */
export interface CustomersPageProps {
  /** Callback to trigger feedback snackbar notifications */
  onNotify: (message: string, severity: AlertSeverity) => void;
}

/**
 * Customer List View presenting all clients in a responsive, sortable AG Grid table with full CRUD capabilities.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the customer management table.
 */
export const CustomersPage: React.FC<CustomersPageProps> = ({ onNotify }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quickFilterText, setQuickFilterText] = useState<string>('');

  // Modals state
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [addTrainingDialogOpen, setAddTrainingDialogOpen] = useState<boolean>(false);
  const [customerForTraining, setCustomerForTraining] = useState<Customer | null>(null);

  /**
   * Fetches customer list on manual user refresh.
   */
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch customers';
      onNotify(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    let isMounted = true;
    getCustomers()
      .then((data) => {
        if (isMounted) {
          setCustomers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to fetch customers';
          onNotify(message, 'error');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onNotify]);

  /**
   * Opens the edit modal for a designated customer.
   */
  const handleOpenEdit = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  }, []);

  /**
   * Opens the deletion confirmation dialog for a designated customer.
   */
  const handleOpenDelete = useCallback((customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  }, []);

  /**
   * Executes customer deletion after user confirms in dialog.
   */
  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    const customerUrl = customerToDelete._links?.self?.href || customerToDelete._links?.customer?.href;
    if (!customerUrl) {
      onNotify('Unable to delete customer: Missing link reference.', 'error');
      setDeleteDialogOpen(false);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCustomer(customerUrl);
      onNotify(
        `Customer ${customerToDelete.firstname} ${customerToDelete.lastname} deleted successfully.`,
        'success'
      );
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      handleRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete customer';
      onNotify(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Opens the training scheduling modal pre-configured for a designated customer.
   */
  const handleOpenAddTraining = useCallback((customer: Customer) => {
    setCustomerForTraining(customer);
    setAddTrainingDialogOpen(true);
  }, []);

  /**
   * Triggers sanitized export of customer collection to CSV file.
   */
  const handleExportCsv = () => {
    try {
      exportCustomersToCsv(customers);
      onNotify('Customer records exported to CSV successfully.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export CSV';
      onNotify(message, 'error');
    }
  };

  /**
   * Column definitions for the customer AG Grid.
   */
  const columnDefs = useMemo<ColDef<Customer>[]>(() => [
    {
      field: 'firstname',
      headerName: 'First Name',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'lastname',
      headerName: 'Last Name',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'streetaddress',
      headerName: 'Street Address',
      sortable: true,
      filter: true,
      flex: 1.4,
      minWidth: 160,
    },
    {
      field: 'postcode',
      headerName: 'Postcode',
      sortable: true,
      filter: true,
      width: 110,
    },
    {
      field: 'city',
      headerName: 'City',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: true,
      filter: true,
      flex: 1.4,
      minWidth: 180,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 130,
    },
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
                onClick={() => handleOpenAddTraining(customer)}
              >
                <DirectionsRunIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Customer">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleOpenEdit(customer)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Customer">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleOpenDelete(customer)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [handleOpenAddTraining, handleOpenEdit, handleOpenDelete]);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    floatingFilter: false,
  }), []);

  return (
    <Box sx={{ py: 2 }}>
      <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }} elevation={1}>
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
              onClick={() => setAddDialogOpen(true)}
              sx={{ fontWeight: 600 }}
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
              sx={{ fontWeight: 600 }}
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
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh Customers"
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          className="ag-theme-material"
          sx={{
            height: 600,
            width: '100%',
            position: 'relative',
            '& .ag-root-wrapper': {
              borderRadius: 1,
              border: '1px solid #e2e8f0',
            },
          }}
        >
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
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
            rowData={customers}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilterText}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            animateRows={true}
          />
        </Box>
      </Paper>

      {/* Add Customer Modal */}
      <AddCustomerDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onCustomerAdded={handleRefresh}
        onNotify={onNotify}
      />

      {/* Edit Customer Modal */}
      {editDialogOpen && selectedCustomer && (
        <EditCustomerDialog
          key={selectedCustomer._links?.self?.href || 'edit-customer'}
          open={editDialogOpen}
          customer={selectedCustomer}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedCustomer(null);
          }}
          onCustomerUpdated={handleRefresh}
          onNotify={onNotify}
        />
      )}

      {/* Delete Customer Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Customer?"
        message={
          customerToDelete
            ? `Are you sure you want to delete ${customerToDelete.firstname} ${customerToDelete.lastname}? All associated training sessions will also be deleted permanently.`
            : 'Are you sure you want to delete this customer?'
        }
        confirmText="Delete Customer"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
          }
        }}
      />

      {/* Add Training for Selected Customer */}
      {addTrainingDialogOpen && (
        <AddTrainingDialog
          key={customerForTraining?._links?.self?.href || 'add-training'}
          open={addTrainingDialogOpen}
          initialCustomer={customerForTraining}
          onClose={() => {
            setAddTrainingDialogOpen(false);
            setCustomerForTraining(null);
          }}
          onTrainingAdded={handleRefresh}
          onNotify={onNotify}
        />
      )}
    </Box>
  );
};
