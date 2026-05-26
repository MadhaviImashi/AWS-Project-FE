import client from './client';
import type { Registration } from '@/types';

export const registerForEvent = (eventId: string) =>
  client.post<Registration>(`/api/v1/registrations/${eventId}`).then((r) => r.data);

export const cancelRegistration = (eventId: string) =>
  client.delete(`/api/v1/registrations/${eventId}`);

export const getMyRegistrations = () =>
  client.get<Registration[]>('/api/v1/registrations/me').then((r) => r.data);
