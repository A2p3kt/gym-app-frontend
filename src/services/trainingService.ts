/**
 * @fileoverview Service functions for training session operations.
 */

import { apiFetch } from './api';
import type {
  NewTrainingPayload,
  TrainingListResponse,
  TrainingRaw,
  TrainingWithCustomer,
} from '../types';

/**
 * Fetches raw trainings in HATEOAS format (no customer details).
 * The UI uses {@link getTrainingsWithCustomer} instead; this is kept for completeness of the API layer.
 *
 * @returns Array of raw training records.
 */
export async function getTrainings(): Promise<TrainingRaw[]> {
  const data = await apiFetch<TrainingListResponse>('/trainings');
  return data._embedded?.trainings || [];
}

/**
 * Fetches all trainings with embedded customer details via the dedicated `/gettrainings` endpoint.
 *
 * @returns Array of trainings, each with its customer (or null).
 */
export async function getTrainingsWithCustomer(): Promise<TrainingWithCustomer[]> {
  return await apiFetch<TrainingWithCustomer[]>('/gettrainings');
}

/**
 * Creates a new training linked to a customer.
 *
 * @param training - Payload whose `customer` field is the customer's self link.
 * @returns The created training record.
 */
export async function addTraining(training: NewTrainingPayload): Promise<TrainingRaw> {
  return await apiFetch<TrainingRaw>('/trainings', {
    method: 'POST',
    body: JSON.stringify(training),
  });
}

/**
 * Deletes a training session.
 *
 * @param idOrUrl - Numeric training ID or the training's full self link.
 */
export async function deleteTraining(idOrUrl: number | string): Promise<void> {
  const endpoint = typeof idOrUrl === 'string' && idOrUrl.startsWith('http')
    ? idOrUrl
    : `/trainings/${idOrUrl}`;
  await apiFetch<void>(endpoint, {
    method: 'DELETE',
  });
}
