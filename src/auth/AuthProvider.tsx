import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { apiRequest } from '@/lib/api';

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  full_name?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  loginAdmin: (payload: LoginPayload) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error('AUTH_TIMEOUT'));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const currentUser = await withTimeout(apiRequest<AuthUser>('/api/auth/me'));
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refresh,
      login: async (payload) => {
        const currentUser = await apiRequest<AuthUser>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setUser(currentUser);
        return currentUser;
      },
      register: async (payload) => {
        const currentUser = await apiRequest<AuthUser>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setUser(currentUser);
        return currentUser;
      },
      loginAdmin: async (payload) => {
        const currentUser = await apiRequest<AuthUser>('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setUser(currentUser);
        return currentUser;
      },
      signOut: async () => {
        await apiRequest('/api/auth/logout', { method: 'POST' });
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
