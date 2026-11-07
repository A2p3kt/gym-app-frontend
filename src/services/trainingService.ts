import { apiFetch } from './api';
import type {
  NewTrainingPayload,
  TrainingListResponse,
  TrainingRaw,
  TrainingWithCustomer,
} from '../types';

/**
 * Fetches raw trainings (HATEOAS format)
 */
export async function getTrainings(): Promise<TrainingRaw[]> {
  const data = await apiFetch<TrainingListResponse>('/trainings');
  return data._embedded?.trainings || [];
}

/**
 * Fetches all trainings with embedded customer details
 * Uses the dedicated /gettrainings endpoint
 */
export async function getTrainingsWithCustomer(): Promise<TrainingWithCustomer[]> {
  return await apiFetch<TrainingWithCustomer[]>('/gettrainings');
}

/**
 * Adds a new training linked to a customer
 */
export async function addTraining(training: NewTrainingPayload): Promise<TrainingRaw> {
  return await apiFetch<TrainingRaw>('/trainings', {
    method: 'POST',
    body: JSON.stringify(training),
  });
}

/**
 * Deletes a training session by ID or URL
 */
export async function deleteTraining(idOrUrl: number | string): Promise<void> {
  const endpoint = typeof idOrUrl === 'string' && idOrUrl.startsWith('http')
    ? idOrUrl
    : `/trainings/${idOrUrl}`;
  await apiFetch<void>(endpoint, {
    method: 'DELETE',
  });
}
