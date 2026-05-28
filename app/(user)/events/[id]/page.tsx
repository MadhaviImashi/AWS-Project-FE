'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getEvent } from '@/lib/api/events';
import { registerForEvent, cancelRegistration, getMyRegistrations } from '@/lib/api/registrations';
import { getViewUrl } from '@/lib/api/files';
import type { Event } from '@/types';
import Button from '@/components/ui/Button';

export default function UserEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getEvent(id), getMyRegistrations()]).then(([e, regs]) => {
      setEvent(e);
      setRegistered(regs.some((r) => r.event_id === id));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    setError('');
    setActionLoading(true);
    try {
      await registerForEvent(id);
      setRegistered(true);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Registration failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your registration for this event?')) return;
    setError('');
    setActionLoading(true);
    try {
      await cancelRegistration(id);
      setRegistered(false);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to cancel registration');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!event) return <p className="text-red-600">Event not found.</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
      <p className="text-purple-600 font-medium mb-4">{event.date} · {event.time}</p>

      {event.description && (
        <p className="text-gray-600 mb-6 leading-relaxed">{event.description}</p>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <div className="mb-6">
        {registered ? (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              You are registered for this event
            </span>
            <Button variant="secondary" loading={actionLoading} onClick={handleCancel}>
              Cancel registration
            </Button>
          </div>
        ) : (
          <Button loading={actionLoading} onClick={handleRegister}>
            Register for this event
          </Button>
        )}
      </div>

      {event.files?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Attachments</h2>
          <ul className="flex flex-col gap-2">
            {event.files.map((f) => (
              <li key={f.id}>
                <button
                  className="flex items-center gap-2 text-sm text-purple-600 hover:underline text-left"
                  onClick={async () => {
                    const url = await getViewUrl(f.s3_key);
                    window.open(url, '_blank');
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                  {f.file_name}
                  <span className="text-gray-400 capitalize">({f.file_type})</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
