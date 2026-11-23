/**
 * @fileoverview Training sessions list page displaying activities with formatted date, customer name, and full CRUD actions.
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
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DeleteIcon from '@mui/icons-material/Delete';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import dayjs from 'dayjs';
import type { TrainingWithCustomer, NotifyFn } from '../types';
import { getTrainingsWithCustomer, deleteTraining } from '../services/trainingService';
import { useApiData } from '../hooks/useApiData';
import { gridTheme } from '../gridSetup';
import { getErrorMessage } from '../utils/errors';
import { formatCustomerFullName, formatDateTime } from '../utils/formatters';
import { AddTrainingDialog } from '../components/trainings/AddTrainingDialog';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

/**
 * Props for the TrainingsPage component.
 */
export interface TrainingsPageProps {
  /** Callback to trigger feedback snackbar notifications */
  onNotify: NotifyFn;
}

/**
 * Compares two ISO date strings chronologically (used for sorting the Date column).
 * Comparing parsed timestamps is safer than comparing the raw strings, which would
 * sort incorrectly if the API ever returned different UTC offsets.
 */
function compareIsoDates(a: string | null | undefined, b: string | null | undefined): number {
  return dayjs(a ?? 0).valueOf() - dayjs(b ?? 0).valueOf();
}

/**
 * Comparator for AG Grid's built-in date filter. AG Grid passes the picked date
 * (local midnight) and the raw cell value; we compare calendar days only.
 *
 * @returns Negative if the cell is before the filter date, positive if after, 0 if same day.
 */
function compareCellToFilterDate(filterDate: Date, cellValue: string | null): number {
  if (!cellValue) return -1;
  const cellDay = dayjs(cellValue).startOf('day');
  if (cellDay.isSame(filterDate, 'day')) return 0;
  return cellDay.isBefore(filterDate) ? -1 : 1;
}

/**
 * Training List View presenting all workouts with associated client details.
 * Supports searching, sorting, scheduling new workouts, and deleting sessions with confirmation.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the training data table.
 */
export const TrainingsPage: React.FC<TrainingsPageProps> = ({ onNotify }) => {
  const { data: trainings, loading, reload } = useApiData(
    getTrainingsWithCustomer,
    [],
    onNotify,
    'Failed to fetch trainings'
  );
  const [quickFilterText, setQuickFilterText] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [trainingToDelete, setTrainingToDelete] = useState<TrainingWithCustomer | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  /** Deletes the selected training after the user confirmed. */
  const handleConfirmDelete = async () => {
    if (!trainingToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTraining(trainingToDelete.id);
      onNotify(`Training session "${trainingToDelete.activity}" deleted successfully.`, 'success');
      setTrainingToDelete(null);
      reload();
    } catch (err) {
      onNotify(getErrorMessage(err, 'Failed to delete training'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * AG Grid column definitions for training sessions.
   * `setTrainingToDelete` is a stable state setter, so the memo has no dependencies.
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
      flex: 1.2,
      minWidth: 160,
      // The cell value stays the ISO string (for correct sorting/filtering);
      // only the displayed text is formatted as DD.MM.YYYY HH:mm.
      valueFormatter: (params) => formatDateTime(params.value),
      comparator: compareIsoDates,
      // Date picker filter that compares by calendar day.
      filter: 'agDateColumnFilter',
      filterParams: { comparator: compareCellToFilterDate },
      // Without this, the search box would match against the raw ISO string,
      // so typing e.g. "18.04.2024" would find nothing.
      getQuickFilterText: (params) => formatDateTime(params.value),
    },
    {
      colId: 'customerName',
      headerName: 'Customer Name',
      sortable: true,
      filter: true,
      flex: 1.5,
      minWidth: 180,
      valueGetter: (params) => formatCustomerFullName(params.data?.customer),
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
                aria-label={`Delete ${training.activity} session`}
                onClick={() => setTrainingToDelete(training)}
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

  return (
    <Box sx={{ py: 2 }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 2, borderRadius: 2 }} elevation={1}>
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
                htmlInput: { 'aria-label': 'Search trainings' },
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />
            <Tooltip title="Refresh Trainings">
              <span>
                <IconButton onClick={reload} disabled={loading} aria-label="Refresh trainings" color="primary">
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
          <AgGridReact<TrainingWithCustomer>
            theme={gridTheme}
            rowData={trainings}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            getRowId={(params) => String(params.data.id)}
            quickFilterText={quickFilterText}
            pagination
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            overlayNoRowsTemplate="No training sessions found. Schedule one or reset the demo database."
          />
        </Box>
      </Paper>

      {/* Mounted only while open so the form starts fresh each time. */}
      {addDialogOpen && (
        <AddTrainingDialog
          open
          onClose={() => setAddDialogOpen(false)}
          onTrainingAdded={reload}
          onNotify={onNotify}
        />
      )}

      <ConfirmDialog
        open={Boolean(trainingToDelete)}
        title="Delete Training Session?"
        message={
          trainingToDelete
            ? `Are you sure you want to delete the ${trainingToDelete.activity} training session on ${formatDateTime(trainingToDelete.date)}?`
            : 'Are you sure you want to delete this training session?'
        }
        confirmText="Delete Training"
        confirmColor="error"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setTrainingToDelete(null);
        }}
      />
    </Box>
  );
};
