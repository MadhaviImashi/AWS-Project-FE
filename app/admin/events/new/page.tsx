'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/lib/api/events';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const event = await createEvent(form);
      router.push(`/admin/events/${event.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New event</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
        <Input label="Title" value={form.title} onChange={set('title')} required autoFocus />
        <Input label="Date" type="date" value={form.date} onChange={set('date')} required />
        <Input label="Time" type="time" value={form.time} onChange={set('time')} required />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={4}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500 resize-none"
          />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex gap-3 mt-2">
          <Button type="submit" loading={loading}>Create event</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
