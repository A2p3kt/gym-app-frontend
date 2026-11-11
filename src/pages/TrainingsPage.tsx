/**
 * @fileoverview Training sessions list page displaying activities with formatted date, customer name, and full CRUD actions.
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
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DeleteIcon from '@mui/icons-material/Delete';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ValueGetterParams, ICellRendererParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import type { TrainingWithCustomer, AlertSeverity } from '../types';
import { getTrainingsWithCustomer, deleteTraining } from '../services/trainingService';
import { AddTrainingDialog } from '../components/trainings/AddTrainingDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

/**
 * Props for the TrainingsPage component.
 */
export interface TrainingsPageProps {
  /** Callback to trigger feedback snackbar notifications */
  onNotify: (message: string, severity: AlertSeverity) => void;
}

/**
 * Training List View presenting all workouts with associated client details.
 * Supports searching, sorting, scheduling new workouts, and deleting sessions with confirmation.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the training data table.
 */
export const TrainingsPage: React.FC<TrainingsPageProps> = ({ onNotify }) => {
  const [trainings, setTrainings] = useState<TrainingWithCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quickFilterText, setQuickFilterText] = useState<string>('');

  // Modals state
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [trainingToDelete, setTrainingToDelete] = useState<TrainingWithCustomer | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  /**
   * Fetches training sessions on manual refresh.
   */
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTrainingsWithCustomer();
      setTrainings(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trainings';
      onNotify(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    let isMounted = true;
    getTrainingsWithCustomer()
      .then((data) => {
        if (isMounted) {
          setTrainings(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to fetch trainings';
          onNotify(message, 'error');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onNotify]);

  /**
   * Opens the confirmation dialog for deleting a training session.
   */
  const handleOpenDelete = useCallback((training: TrainingWithCustomer) => {
    setTrainingToDelete(training);
    setDeleteDialogOpen(true);
  }, []);

  /**
   * Executes deletion of a training session after user confirms.
   */
  const handleConfirmDelete = async () => {
    if (!trainingToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTraining(trainingToDelete.id);
      onNotify(
        `Training session "${trainingToDelete.activity}" deleted successfully.`,
        'success'
      );
      setDeleteDialogOpen(false);
      setTrainingToDelete(null);
      handleRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete training';
      onNotify(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * AG Grid column definitions for training sessions.
   */
  const columnDefs = useMemo<ColDef<TrainingWithCustomer>[]>(() => [
    {
      field: 'activity',
      headerName: 'Activity',
      sortable: true,
      filter: true,
      flex: 1.2,
      minWidth: 140,
    },
    {
      field: 'duration',
      headerName: 'Duration',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: (params) => (params.value != null ? `${params.value} min` : ''),
    },
    {
      field: 'date',
      headerName: 'Date & Time',
      sortable: true,
      filter: true,
      flex: 1.2,
      minWidth: 160,
      valueFormatter: (params) => {
        if (!params.value) return '';
        const parsed = dayjs(params.value);
        return parsed.isValid() ? parsed.format('DD.MM.YYYY HH:mm') : params.value;
      },
    },
    {
      headerName: 'Customer Name',
      sortable: true,
      filter: true,
      flex: 1.5,
      minWidth: 180,
      valueGetter: (params: ValueGetterParams<TrainingWithCustomer>) => {
        const customer = params.data?.customer;
        if (!customer) return 'No customer associated';
        return `${customer.firstname || ''} ${customer.lastname || ''}`.trim();
      },
    },
    {
      headerName: 'Actions',
      sortable: false,
      filter: false,
      pinned: 'right',
      width: 100,
      cellRenderer: (params: ICellRendererParams<TrainingWithCustomer>) => {
        const training = params.data;
        if (!training) return null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
            <Tooltip title="Delete Training Session">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleOpenDelete(training)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [handleOpenDelete]);

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
              Training Sessions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total scheduled sessions: {trainings.length}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<DirectionsRunIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              Schedule Training
            </Button>
            <TextField
              size="small"
              placeholder="Search trainings..."
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
              title="Refresh Trainings"
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
          <AgGridReact<TrainingWithCustomer>
            rowData={trainings}
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

      {/* Add Training Modal */}
      {addDialogOpen && (
        <AddTrainingDialog
          key="schedule-training-modal"
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onTrainingAdded={handleRefresh}
          onNotify={onNotify}
        />
      )}

      {/* Delete Training Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Training Session?"
        message={
          trainingToDelete
            ? `Are you sure you want to delete the ${trainingToDelete.activity} training session on ${dayjs(trainingToDelete.date).format('DD.MM.YYYY HH:mm')}?`
            : 'Are you sure you want to delete this training session?'
        }
        confirmText="Delete Training"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteDialogOpen(false);
            setTrainingToDelete(null);
          }
        }}
      />
    </Box>
  );
};
