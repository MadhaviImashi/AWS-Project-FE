'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getEvent, updateEvent } from '@/lib/api/events';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });

  useEffect(() => {
    getEvent(id).then((e) =>
      setForm({ title: e.title, date: e.date, time: e.time, description: e.description ?? '' }),
    ).finally(() => setLoading(false));
    setLoading(true);
  }, [id]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateEvent(id, form);
      router.push(`/admin/events/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit event</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
        <Input label="Title" value={form.title} onChange={set('title')} required />
        <Input label="Date" type="date" value={form.date} onChange={set('date')} required />
        <Input label="Time" type="time" value={form.time} onChange={set('time')} required />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={4}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
          />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex gap-3 mt-2">
          <Button type="submit" loading={saving}>Save changes</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
