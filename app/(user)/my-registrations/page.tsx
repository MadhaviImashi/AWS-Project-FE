'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyRegistrations } from '@/lib/api/registrations';
import { cancelRegistration } from '@/lib/api/registrations';
import type { Registration } from '@/types';
import Button from '@/components/ui/Button';

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = async () => {
    getMyRegistrations().then(setRegistrations).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (eventId: string, title: string) => {
    if (!confirm(`Cancel registration for "${title}"?`)) return;
    setCancellingId(eventId);
    try {
      await cancelRegistration(eventId);
      setRegistrations((prev) => prev.filter((r) => r.event_id !== eventId));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My registrations</h1>
      {registrations.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">You haven&apos;t registered for any events yet.</p>
          <Link href="/events" className="text-blue-600 hover:underline font-medium text-sm">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {registrations.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">{r.title}</h2>
                <p className="text-sm text-blue-600 mt-1">{r.date} · {r.time}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Registered {new Date(r.registered_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/events/${r.event_id}`}>
                  <Button variant="secondary" className="py-1 px-3 text-sm">View</Button>
                </Link>
                <Button
                  variant="danger"
                  className="py-1 px-3 text-sm"
                  loading={cancellingId === r.event_id}
                  onClick={() => handleCancel(r.event_id, r.title ?? '')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
