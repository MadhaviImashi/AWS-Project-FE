'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function ConfirmForm() {
  const { confirmCode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await confirmCode(email, code);
      router.push('/login?confirmed=1');
    } catch (err: any) {
      setError(err.message ?? 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-black text-purple-700 text-3xl tracking-tight">CW</span>
          <span className="font-bold text-gray-800 text-3xl tracking-tight">Events</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify your email</h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter the 6-digit code sent to your email
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Confirmation code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
              autoFocus
            />
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" loading={loading} className="w-full mt-1">
              Verify email
            </Button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-6">
            <Link href="/login" className="text-purple-600 hover:underline font-medium">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmForm />
    </Suspense>
  );
}
