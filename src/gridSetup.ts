/**
 * @fileoverview One-time AG Grid setup: registers the grid features we use and defines the grid theme.
 *
 * Only the Customers and Trainings pages import this file, so AG Grid's code is
 * downloaded only when one of those pages is opened (it is not in the main bundle).
 */

import {
  ClientSideRowModelModule,
  DateFilterModule,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  QuickFilterModule,
  TextFilterModule,
  ValidationModule,
  themeMaterial,
} from 'ag-grid-community';
import { BRAND, FONT_FAMILY } from './theme';

// AG Grid v33+ only includes features that are registered as modules.
// Registering just what our tables use keeps the bundle much smaller than `AllCommunityModule`.
ModuleRegistry.registerModules([
  ClientSideRowModelModule, // rows passed in via the `rowData` prop
  TextFilterModule, // column filters on text columns
  NumberFilterModule, // "Duration" filter
  DateFilterModule, // "Date & Time" filter
  QuickFilterModule, // the search box (`quickFilterText`)
  PaginationModule, // pagination bar and page-size selector
  // Development only: prints full, readable messages for grid misconfiguration.
  ...(import.meta.env.DEV ? [ValidationModule] : []),
]);

/**
 * AG Grid theme (Theming API, AG Grid v33+), matched to the MUI brand colors.
 * Passed to every grid via the `theme` prop. We deliberately do NOT import the
 * legacy `ag-grid.css` / `ag-theme-*.css` files: mixing both systems makes AG Grid
 * log error #239 and causes conflicting styles.
 */
export const gridTheme = themeMaterial.withParams({
  accentColor: BRAND.navy,
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  headerFontWeight: 600,
  headerTextColor: BRAND.navyDark,
  headerBackgroundColor: '#f8fafc',
  borderColor: BRAND.border,
  wrapperBorderRadius: 8,
});
