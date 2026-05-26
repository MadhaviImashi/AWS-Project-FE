import client from './client';
import type { Event, EventFile, Registration } from '@/types';

export const getEvents = () =>
  client.get<Event[]>('/api/v1/events').then((r) => r.data);

export const getEvent = (id: string) =>
  client.get<Event>(`/api/v1/events/${id}`).then((r) => r.data);

export const createEvent = (data: { title: string; date: string; time: string; description?: string }) =>
  client.post<Event>('/api/v1/events', data).then((r) => r.data);

export const updateEvent = (id: string, data: Partial<{ title: string; date: string; time: string; description: string }>) =>
  client.put<Event>(`/api/v1/events/${id}`, data).then((r) => r.data);

export const deleteEvent = (id: string) =>
  client.delete(`/api/v1/events/${id}`);

export const attachFile = (eventId: string, data: { s3Key: string; fileName: string; fileType: string }) =>
  client.post<EventFile>(`/api/v1/events/${eventId}/files`, data).then((r) => r.data);

export const deleteFile = (eventId: string, fileId: string) =>
  client.delete(`/api/v1/events/${eventId}/files/${fileId}`);

export const getEventRegistrations = (eventId: string) =>
  client.get<Registration[]>(`/api/v1/events/${eventId}/registrations`).then((r) => r.data);
