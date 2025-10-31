'use client';

import { useState, useEffect } from 'react';
// import { IUser } from '@/lib/types'; // <<< REMOVED THIS LINE

interface SessionUser {
  userId: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  rollNumber?: string | null;
}

export function useSession() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data.user);
        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSession();
  }, []);

  return { session, isLoading };
}