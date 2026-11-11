/**
 * @fileoverview Generic reusable confirmation dialog for destructive or critical actions.
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';

/**
 * Props for the ConfirmDialog component.
 */
export interface ConfirmDialogProps {
  /** Controls modal visibility */
  open: boolean;
  /** Modal header title */
  title: string;
  /** Explanatory warning or confirmation message */
  message: string;
  /** Text displayed on the confirmation action button (defaults to "Yes") */
  confirmText?: string;
  /** Text displayed on the cancel button (defaults to "Cancel") */
  cancelText?: string;
  /** Color theme for the confirm button (defaults to "error" for destructive actions) */
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  /** Callback fired when user clicks confirm */
  onConfirm: () => void;
  /** Callback fired when user dismisses or cancels */
  onCancel: () => void;
  /** Optional loading state displaying a spinner in the confirm button */
  loading?: boolean;
}

/**
 * Reusable modal dialog confirming user intent before performing actions like deletes.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the confirmation dialog.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  confirmColor = 'error',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            p: 1,
            minWidth: { xs: '90%', sm: 400 },
          },
        },
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 600 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description" sx={{ color: 'text.secondary' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          color="inherit"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={confirmColor}
          autoFocus
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
