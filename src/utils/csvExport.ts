/**
 * @fileoverview Utility functions for exporting tabular entity data to CSV format using PapaParse.
 */

import Papa from 'papaparse';
import dayjs from 'dayjs';
import type { Customer } from '../types';

/**
 * Clean data structure formatted specifically for CSV row representation.
 * Explicitly excludes internal links, relational IDs, and UI action columns.
 */
export interface CustomerCsvRow {
  'First Name': string;
  'Last Name': string;
  'Street Address': string;
  'Postcode': string;
  'City': string;
  'Email': string;
  'Phone': string;
}

/**
 * Transforms an array of Customer entities into sanitized CSV records and initiates a browser file download.
 *
 * @param customers - Collection of customer entities to export.
 * @param filename - Optional custom file name (defaults to 'customers_YYYY-MM-DD.csv').
 */
export function exportCustomersToCsv(customers: Customer[], filename?: string): void {
  if (!customers || customers.length === 0) {
    throw new Error('No customer records available to export.');
  }

  // Filter out internal references and map to user-friendly column headers
  const csvData: CustomerCsvRow[] = customers.map((c) => ({
    'First Name': c.firstname || '',
    'Last Name': c.lastname || '',
    'Street Address': c.streetaddress || '',
    'Postcode': c.postcode || '',
    'City': c.city || '',
    'Email': c.email || '',
    'Phone': c.phone || '',
  }));

  const csvString = Papa.unparse(csvData, {
    quotes: true,
    header: true,
  });

  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const downloadFilename = filename || `customers_${dayjs().format('YYYY-MM-DD')}.csv`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', downloadFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
