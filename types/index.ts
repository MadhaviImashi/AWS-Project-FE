export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  files: EventFile[];
}

export interface EventFile {
  id: string;
  event_id: string;
  s3_key: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_sub: string;
  user_email: string;
  user_name: string;
  registered_at: string;
  // joined from events table (my-registrations)
  title?: string;
  date?: string;
  time?: string;
  description?: string;
}

export type UserRole = 'admin' | 'user';
