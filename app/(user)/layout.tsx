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
      <header className="bg-purple-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1">
            <span className="font-black text-white text-lg tracking-tight">CW</span>
            <span className="font-semibold text-purple-200 text-lg tracking-tight">Events</span>
          </div>
          <nav className="flex gap-5">
            <Link href="/events" className="text-sm text-purple-200 hover:text-white font-medium transition-colors">
              Events
            </Link>
            <Link href="/my-registrations" className="text-sm text-purple-200 hover:text-white font-medium transition-colors">
              My registrations
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-purple-300">{user.name ?? user.email}</span>
          <button onClick={signOut} className="text-sm text-purple-200 hover:text-white font-medium transition-colors">
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
