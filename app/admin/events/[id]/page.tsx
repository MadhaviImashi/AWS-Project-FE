'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getEvent, attachFile, deleteFile, getEventRegistrations } from '@/lib/api/events';
import { getUploadUrl, uploadFileToS3 } from '@/lib/api/files';
import type { Event, Registration } from '@/types';
import Button from '@/components/ui/Button';

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [e, r] = await Promise.all([getEvent(id), getEventRegistrations(id)]);
    setEvent(e);
    setRegistrations(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      const { uploadUrl, s3Key } = await getUploadUrl({ eventId: id, fileName: file.name, contentType: file.type });
      await uploadFileToS3(uploadUrl, file);
      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      await attachFile(id, { s3Key, fileName: file.name, fileType });
      await load();
    } catch (err: any) {
      setUploadError(err.response?.data?.error ?? 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Remove this file?')) return;
    setDeletingFileId(fileId);
    try {
      await deleteFile(id, fileId);
      setEvent((prev) => prev ? { ...prev, files: prev.files.filter((f) => f.id !== fileId) } : prev);
    } finally {
      setDeletingFileId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!event) return <p className="text-red-600">Event not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-500 mt-1">{event.date} at {event.time}</p>
          {event.description && <p className="text-gray-600 mt-2 max-w-xl">{event.description}</p>}
        </div>
        <Link href={`/admin/events/${id}/edit`}>
          <Button variant="secondary">Edit event</Button>
        </Link>
      </div>

      {/* Files */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Files</h2>
          <div>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx" />
            <Button onClick={() => fileInputRef.current?.click()} loading={uploading} variant="secondary">
              Upload file
            </Button>
          </div>
        </div>
        {uploadError && <p className="text-sm text-red-600 mb-3">{uploadError}</p>}
        {event.files.length === 0 ? (
          <p className="text-sm text-gray-400">No files uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {event.files.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{f.file_name}</p>
                  <p className="text-xs text-gray-400 capitalize">{f.file_type}</p>
                </div>
                <Button
                  variant="danger"
                  className="py-1 px-3 text-xs"
                  loading={deletingFileId === f.id}
                  onClick={() => handleDeleteFile(f.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Registrations */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Registrations ({registrations.length})</h2>
        {registrations.length === 0 ? (
          <p className="text-sm text-gray-400">No registrations yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b border-gray-100">
              <tr>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {registrations.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 text-gray-900">{r.user_name}</td>
                  <td className="py-3 text-gray-600">{r.user_email}</td>
                  <td className="py-3 text-gray-400">{new Date(r.registered_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
