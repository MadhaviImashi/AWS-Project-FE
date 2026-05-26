'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/useAuth';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-900">Codewave Events</span>
          <nav className="flex gap-4">
            <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Events
            </Link>
            <Link href="/my-registrations" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              My registrations
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.name ?? user.email}</span>
          <button onClick={signOut} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
