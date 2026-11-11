/**
 * @fileoverview Central HTTP client and REST API helper module.
 */

/**
 * Base URL for the Personal Trainer REST API.
 */
export const API_BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

/**
 * Endpoint to reset the remote database back to demo state.
 */
export const RESET_DB_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/reset';

/**
 * Generic fetch wrapper for REST API communications.
 *
 * @template T - Expected response payload type.
 * @param endpoint - Relative endpoint path (e.g. '/customers') or absolute URL.
 * @param options - Standard RequestInit options.
 * @returns Parsed JSON response payload, or undefined for 204 No Content.
 * @throws Error when HTTP response is not ok.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options?.headers || {});
  if (!headers.has('Content-Type') && options?.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    try {
      const errorBody = await response.text();
      if (errorBody) {
        errorMessage += ` - ${errorBody}`;
      }
    } catch {
      // Ignore text decoding errors
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json() as T;
  }

  const text = await response.text();
  return text as unknown as T;
}

/**
 * Resets the remote demo database with fresh seed data.
 *
 * @returns Confirmation message string from the backend.
 */
export async function resetDatabase(): Promise<string> {
  const response = await fetch(RESET_DB_URL, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to reset database: HTTP ${response.status} ${response.statusText}`);
  }

  return await response.text();
}

