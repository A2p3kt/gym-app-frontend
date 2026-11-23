/**
 * @fileoverview Modal dialog displaying detailed training session and customer information upon calendar event selection.
 */

import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import type { CalendarTrainingEvent } from '../../types';
import { formatEventDateRange, getActivityColor } from '../../utils/calendarUtils';
import { formatCustomerFullName } from '../../utils/formatters';

/**
 * Props for the TrainingEventDialog component.
 */
export interface TrainingEventDialogProps {
  /** Controls modal visibility */
  open: boolean;
  /** Selected calendar training event to inspect, or null when closed */
  event: CalendarTrainingEvent | null;
  /** Callback invoked when the user closes the inspection modal */
  onClose: () => void;
}

/**
 * Internal props for rendering a consistent icon-prefixed detail row.
 */
interface DetailRowProps {
  /** Leading MUI icon element */
  icon: React.ReactNode;
  /** Field label */
  label: string;
  /** Formatted field value or interactive link element */
  value: React.ReactNode;
}

/**
 * Helper sub-component rendering a single structured metadata row inside the event details dialog.
 */
const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
    <Box sx={{ color: 'primary.main', mt: 0.25, display: 'flex', alignItems: 'center' }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

/**
 * Modal dialog presenting comprehensive session and client information when a trainer
 * clicks on an event in the Training Calendar.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the event inspection dialog, or null if no event is selected.
 */
export const TrainingEventDialog: React.FC<TrainingEventDialogProps> = ({
  open,
  event,
  onClose,
}) => {
  // Nothing selected: render nothing (the dialog is closed anyway).
  if (!event) {
    return null;
  }

  const { resource: training, start, end } = event;
  const { customer } = training;
  const activityColor = getActivityColor(training.activity);
  const formattedDateRange = formatEventDateRange(start, end);

  // Build "Street, Postcode City", skipping any parts that are empty.
  const street = customer?.streetaddress?.trim();
  const locality = [customer?.postcode?.trim(), customer?.city?.trim()].filter(Boolean).join(' ');
  const fullAddress = [street, locality].filter(Boolean).join(', ');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="training-event-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            p: 1,
          },
        },
      }}
    >
      <DialogTitle
        id="training-event-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          pr: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', minWidth: 0 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: activityColor,
              color: 'common.white',
              flexShrink: 0,
            }}
          >
            <FitnessCenterIcon fontSize="small" />
          </Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: 'primary.dark' }}>
            {training.activity}
          </Typography>
          <Chip
            label={`${training.duration} min`}
            size="small"
            color="secondary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="Close session details"
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5, pb: 2.5 }}>
        <Typography
          variant="overline"
          sx={{ display: 'block', fontWeight: 700, color: 'text.secondary', mb: 1.5, letterSpacing: 0.8 }}
        >
          Session Information
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <DetailRow
            icon={<FitnessCenterIcon fontSize="small" />}
            label="Activity"
            value={training.activity}
          />
          <DetailRow
            icon={<EventIcon fontSize="small" />}
            label="Date & Time"
            value={formattedDateRange}
          />
          <DetailRow
            icon={<AccessTimeIcon fontSize="small" />}
            label="Duration"
            value={`${training.duration} minutes`}
          />
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Typography
          variant="overline"
          sx={{ display: 'block', fontWeight: 700, color: 'text.secondary', mb: 1.5, letterSpacing: 0.8 }}
        >
          Customer Information
        </Typography>

        {customer ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <DetailRow
              icon={<PersonIcon fontSize="small" />}
              label="Customer Name"
              value={formatCustomerFullName(customer)}
            />
            <DetailRow
              icon={<EmailIcon fontSize="small" />}
              label="Email"
              value={
                customer.email?.trim() ? (
                  <Link href={`mailto:${customer.email.trim()}`} underline="hover" color="primary">
                    {customer.email.trim()}
                  </Link>
                ) : (
                  'Not provided'
                )
              }
            />
            <DetailRow
              icon={<PhoneIcon fontSize="small" />}
              label="Phone"
              value={
                customer.phone?.trim() ? (
                  <Link href={`tel:${customer.phone.trim()}`} underline="hover" color="primary">
                    {customer.phone.trim()}
                  </Link>
                ) : (
                  'Not provided'
                )
              }
            />
            {fullAddress && (
              <DetailRow
                icon={<LocationOnIcon fontSize="small" />}
                label="Address"
                value={fullAddress}
              />
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No customer associated with this training session.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
