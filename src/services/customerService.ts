/**
 * @fileoverview Service functions for customer entity CRUD operations.
 */

import { apiFetch } from './api';
import type { Customer, CustomerFormData, CustomerListResponse } from '../types';

/**
 * Fetches all customers from the backend.
 *
 * @returns Array of Customer entities.
 */
export async function getCustomers(): Promise<Customer[]> {
  const data = await apiFetch<CustomerListResponse>('/customers');
  return data._embedded?.customers || [];
}

/**
 * Fetches a single customer by ID or canonical URL.
 *
 * @param idOrUrl - Numeric ID or full HATEOAS self link.
 * @returns Customer entity.
 */
export async function getCustomer(idOrUrl: string | number): Promise<Customer> {
  const endpoint = typeof idOrUrl === 'string' && idOrUrl.startsWith('http')
    ? idOrUrl
    : `/customers/${idOrUrl}`;
  return await apiFetch<Customer>(endpoint);
}

/**
 * Creates a new customer record.
 *
 * @param customer - Customer form payload.
 * @returns The newly created Customer entity.
 */
export async function addCustomer(customer: CustomerFormData): Promise<Customer> {
  return await apiFetch<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });
}

/**
 * Updates an existing customer record.
 *
 * @param idOrUrl - Numeric customer ID or canonical self link.
 * @param customer - Updated customer form payload.
 * @returns The updated Customer entity.
 */
export async function updateCustomer(
  idOrUrl: string | number,
  customer: CustomerFormData
): Promise<Customer> {
  const endpoint = typeof idOrUrl === 'string' && idOrUrl.startsWith('http')
    ? idOrUrl
    : `/customers/${idOrUrl}`;
  return await apiFetch<Customer>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(customer),
  });
}

/**
 * Deletes a customer by ID or canonical self URL.
 * Note: The backend cascades this deletion to remove all associated training sessions.
 *
 * @param idOrUrl - Numeric customer ID or canonical self link.
 */
export async function deleteCustomer(idOrUrl: string | number): Promise<void> {
  const endpoint = typeof idOrUrl === 'string' && idOrUrl.startsWith('http')
    ? idOrUrl
    : `/customers/${idOrUrl}`;
  await apiFetch<void>(endpoint, {
    method: 'DELETE',
  });
}

