/**
 * @fileoverview Table view of the per-activity statistics (accessible alternative to the chart).
 */

import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { ActivityDurationStat } from '../../types';
import { formatMinutesAsHours } from '../../utils/formatters';

/**
 * Props for the ActivityStatsTable component.
 */
export interface ActivityStatsTableProps {
  /** One entry per activity, in display order */
  data: ActivityDurationStat[];
}

/**
 * Lists each activity with its session count and total time, so the exact
 * numbers behind the chart can be read (and checked) without hovering.
 *
 * @param props - Component props.
 * @returns JSX Element rendering the statistics table.
 */
export const ActivityStatsTable: React.FC<ActivityStatsTableProps> = ({ data }) => (
  <TableContainer>
    <Table size="small" aria-label="Training minutes per activity">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700 }}>Activity</TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>Sessions</TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>Total minutes</TableCell>
          <TableCell align="right" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'table-cell' } }}>
            Total time
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.activity} hover>
            <TableCell>{row.activity}</TableCell>
            <TableCell align="right">{row.sessions}</TableCell>
            <TableCell align="right">{row.duration}</TableCell>
            <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
              {formatMinutesAsHours(row.duration)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
