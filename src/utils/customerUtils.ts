/**
 * @fileoverview Pure helpers for working with customer records and the customer form.
 */

import type { Customer, CustomerFormData } from '../types';

/** Validation messages keyed by form field; a missing key means the field is valid. */
export type CustomerFormErrors = Partial<Record<keyof CustomerFormData, string>>;

/** Blank customer form used when adding a new customer. */
export const EMPTY_CUSTOMER_FORM: CustomerFormData = {
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  streetaddress: '',
  postcode: '',
  city: '',
};

/** Human-readable field names used to build "X is required" messages. */
const FIELD_LABELS: Record<keyof CustomerFormData, string> = {
  firstname: 'First name',
  lastname: 'Last name',
  email: 'Email address',
  phone: 'Phone number',
  streetaddress: 'Street address',
  postcode: 'Postcode',
  city: 'City',
};

/** Simple "something@something.tld" check; the backend does not validate emails itself. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Returns the customer's canonical REST URL (its HATEOAS self link).
 * The API has no `id` field on customers, so this URL is the customer's identity:
 * it is used for PUT/DELETE requests and as the `customer` value when creating a training.
 *
 * @param customer - Customer returned by `/customers`.
 * @returns The self link, or an empty string if the backend omitted the links.
 */
export function getCustomerHref(customer: Customer): string {
  return customer._links?.self?.href || customer._links?.customer?.href || '';
}

/**
 * Copies the editable fields out of a customer entity (drops `_links`).
 *
 * @param customer - Existing customer record.
 * @returns Form values pre-filled with the customer's data.
 */
export function customerToFormData(customer: Customer): CustomerFormData {
  return {
    firstname: customer.firstname || '',
    lastname: customer.lastname || '',
    email: customer.email || '',
    phone: customer.phone || '',
    streetaddress: customer.streetaddress || '',
    postcode: customer.postcode || '',
    city: customer.city || '',
  };
}

/**
 * Trims surrounding whitespace from every field before sending it to the API.
 *
 * @param data - Raw form values.
 * @returns A new object with trimmed values.
 */
export function trimCustomerForm(data: CustomerFormData): CustomerFormData {
  const trimmed = { ...data };
  for (const key of Object.keys(trimmed) as Array<keyof CustomerFormData>) {
    trimmed[key] = trimmed[key].trim();
  }
  return trimmed;
}

/**
 * Validates the customer form: every field is required and the email must look like an email.
 *
 * @param data - Form values to validate.
 * @returns An errors object; it is empty when the form is valid.
 */
export function validateCustomerForm(data: CustomerFormData): CustomerFormErrors {
  const errors: CustomerFormErrors = {};

  for (const key of Object.keys(FIELD_LABELS) as Array<keyof CustomerFormData>) {
    if (!data[key].trim()) {
      errors[key] = `${FIELD_LABELS[key]} is required`;
    }
  }

  if (!errors.email && !EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  return errors;
}
