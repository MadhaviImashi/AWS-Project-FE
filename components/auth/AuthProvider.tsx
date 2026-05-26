'use client';

import '@/lib/amplify';
import { createContext, useCallback, useEffect, useState } from 'react';
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  confirmSignUp,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
} from 'aws-amplify/auth';
import type { UserRole } from '@/types';

interface AuthUser {
  sub: string;
  email: string;
  name?: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  confirmCode: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const resolveRole = async (): Promise<UserRole> => {
  const session = await fetchAuthSession();
  const groups = session.tokens?.idToken?.payload['cognito:groups'];
  if (Array.isArray(groups) && groups.includes('Admins')) return 'admin';
  return 'user';
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      await getCurrentUser();
      const [attrs, role] = await Promise.all([fetchUserAttributes(), resolveRole()]);
      setUser({
        sub: attrs.sub!,
        email: attrs.email!,
        name: attrs.name,
        role,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = async (email: string, password: string) => {
    await amplifySignIn({ username: email, password });
    await loadUser();
  };

  const signUp = async (email: string, password: string, name: string) => {
    await amplifySignUp({
      username: email,
      password,
      options: { userAttributes: { email, name, gender: 'not_specified' } },
    });
  };

  const confirmCode = async (email: string, code: string) => {
    await confirmSignUp({ username: email, confirmationCode: code });
  };

  const signOut = async () => {
    await amplifySignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, confirmCode, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
