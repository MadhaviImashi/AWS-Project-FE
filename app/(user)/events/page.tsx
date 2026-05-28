'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEvents } from '@/lib/api/events';
import type { Event } from '@/types';

export default function UserEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then(setEvents).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Upcoming events</h1>
      {events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No events available yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer h-full">
                <h2 className="font-semibold text-gray-900 mb-2">{event.title}</h2>
                <p className="text-sm text-purple-600 font-medium mb-1">{event.date} · {event.time}</p>
                {event.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mt-2">{event.description}</p>
                )}
                {event.files?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-3">{event.files.length} attachment{event.files.length > 1 ? 's' : ''}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
