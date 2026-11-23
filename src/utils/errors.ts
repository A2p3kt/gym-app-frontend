/**
 * @fileoverview Helpers for turning unknown thrown values into user-facing messages.
 */

/**
 * Extracts a readable message from a caught error.
 * `catch (err)` gives us `unknown`, so we only trust `.message` when it is a real Error.
 *
 * @param err - The caught value.
 * @param fallback - Message to show when the error carries no usable text.
 * @returns A message suitable for the notification snackbar.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
